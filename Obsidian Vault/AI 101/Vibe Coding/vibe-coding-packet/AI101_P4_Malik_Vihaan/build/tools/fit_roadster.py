"""Fit two side-by-side seats and a removable targa roof to the credited Car Concept."""
import json,struct
from pathlib import Path
import numpy as np
assets=Path(__file__).resolve().parents[1]/'assets'
raw=(assets/'night-car-v21.glb').read_bytes()
end=20+struct.unpack_from('<I',raw,12)[0]
doc=json.loads(raw[20:end]);data=bytearray(raw[end+8:])
nodes=doc['nodes'];world={}
def visit(i,parent):
    n=nodes[i];x,y,z,w=n.get('rotation',[0,0,0,1])
    m=np.eye(4);m[:3,3]=n.get('translation',[0,0,0])
    m[:3,:3]=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])@np.diag(n.get('scale',[1,1,1]))
    if 'matrix' in n:m=np.array(n['matrix']).reshape(4,4).T
    world[i]=parent@m
    for c in n.get('children',[]):visit(c,world[i])
for i in doc['scenes'][0]['nodes']:visit(i,np.diag([-1.,1.,-1.,1.]))
def accessor(i):
    a=doc['accessors'][i];v=doc['bufferViews'][a['bufferView']]
    dims={'VEC3':3,'SCALAR':1}[a['type']]
    dt=np.dtype({5123:'<u2',5125:'<u4',5126:'<f4'}[a['componentType']])
    return np.ndarray((a['count'],dims),dt,buffer=data,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',dims*dt.itemsize),dt.itemsize)).copy()
for i,n in enumerate(nodes):
    name=n.get('name','')
    if name in ('BodyRoofPanel','InteriorCage','BodyDoorLWindow','BodyDoorRWindow','BodyDoorLWindowGasket','BodyDoorRWindowGasket'):
        n.pop('mesh',None)
    if name.startswith(('InteriorSteering','InteriorPedal')) and not name.startswith(('InteriorSteeringWheel','InteriorSteeringEmblem')):
        parent=next((j for j,p in enumerate(nodes) if i in p.get('children',[])),None)
        shift=np.linalg.solve(world[parent][:3,:3],[-.50,.035,.44]) if parent is not None else [.5,.035,-.44]
        n['translation']=(np.array(n.get('translation',[0,0,0]))+shift).tolist()
    if not (name.startswith('InteriorSeats') or name=='BodyPillars'):continue
    for prim in doc['meshes'][n['mesh']]['primitives']:
        pos=accessor(prim['attributes']['POSITION'])@world[i][:3,:3].T+world[i][:3,3]
        inds=accessor(prim['indices']).reshape(-1,3);pts=pos[inds].mean(1)
        if name=='BodyPillars':
            keep=~((pts[:,1]>.82)&(pts[:,2]>-.34))
        else:
            # The two centre seats cross the centreline; each flanking seat is a separate mesh island.
            _,ids=np.unique(pos.round(4),axis=0,return_inverse=True)
            parent=list(range(max(ids)+1))
            def root(j):
                while j!=parent[j]:parent[j]=parent[parent[j]];j=parent[j]
                return j
            for a,b,c in ids[inds]:
                j=root(a);parent[root(b)]=j;parent[root(c)]=j
            groups=np.array([root(j) for j in ids]);mid={k:abs(pos[groups==k,0].mean()) for k in set(groups)}
            keep=np.array([mid[k]>.285 for k in groups[inds[:,0]]])
        chosen=inds[keep].astype('<u4').ravel()
        while len(data)%4:data.append(0)
        doc['bufferViews'].append(dict(buffer=0,byteOffset=len(data),byteLength=chosen.nbytes,target=34963))
        data.extend(chosen.tobytes())
        doc['accessors'].append(dict(bufferView=len(doc['bufferViews'])-1,componentType=5125,count=len(chosen),type='SCALAR',min=[int(chosen.min())],max=[int(chosen.max())]))
        prim['indices']=len(doc['accessors'])-1
doc['buffers'][0]['byteLength']=len(data)
header=json.dumps(doc,separators=(',',':')).encode();header+=b' '*(-len(header)%4);data.extend(b'\0'*(-len(data)%4))
(assets/'night-car-v28.glb').write_bytes(struct.pack('<4sIIII',b'glTF',2,28+len(header)+len(data),len(header),0x4e4f534a)+header+struct.pack('<II',len(data),0x004e4942)+data)
