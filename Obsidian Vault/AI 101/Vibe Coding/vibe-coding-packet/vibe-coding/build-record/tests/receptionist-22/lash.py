import bpy,numpy as np
for n in ['eyelashes01','eyebrow001']:
 a=np.array([v.co[:] for v in bpy.data.objects['Receptionist '+n].data.vertices])
 for x in np.arange(.009,.061,.003):
  s=a[abs(a[:,0]-x)<.0018]
  if len(s):print(n,round(x,3),np.round(s.min(axis=0),4),np.round(s.max(axis=0),4))
