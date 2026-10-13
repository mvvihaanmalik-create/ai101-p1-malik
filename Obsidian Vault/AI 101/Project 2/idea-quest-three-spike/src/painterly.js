import * as THREE from 'three';

let brushMap;
function brushes() {
  if(brushMap)return brushMap;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const c=canvas.getContext('2d');c.fillStyle='#aaa49a';c.fillRect(0,0,512,512);
  let seed=821;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  // Layered opaque gouache strokes, with broken bristle edges. Baked once.
  for(let i=0;i<950;i++){
    const x=rand()*512,y=rand()*512,w=12+rand()*60,h=5+rand()*19,a=rand()*2.2-1.1;
    const value=Math.floor(100+rand()*113);
    for(const dx of [-512,0,512])for(const dy of [-512,0,512]){
      c.save();c.translate(x+dx,y+dy);c.rotate(a);
      c.fillStyle=`rgba(${value+9},${value+3},${value-8},0.52)`;
      c.beginPath();c.moveTo(-w/2,-h*.35);c.lineTo(w*.38,-h*.5);c.lineTo(w*.5,h*.17);c.lineTo(w*.3,h*.48);c.lineTo(-w*.45,h*.35);c.closePath();c.fill();
      c.strokeStyle=`rgba(${value+18},${value+12},${value},0.25)`;c.lineWidth=.7;
      for(let j=0;j<4;j++){const yy=(j/4-.4)*h;c.beginPath();c.moveTo(-w*.4,yy);c.lineTo(w*.35,yy+h*.10);c.stroke();}c.restore();
    }
  }
  brushMap=new THREE.CanvasTexture(canvas);brushMap.wrapS=brushMap.wrapT=THREE.RepeatWrapping;
  brushMap.colorSpace=THREE.NoColorSpace;brushMap.anisotropy=4;
  return brushMap;
}

export function painterly(material, scale=1.4, strength=.85) {
  if(!material.isMeshStandardMaterial || material.userData.painted)return material;
  material.userData.painted=true;material.envMapIntensity=material.metalness>.1?.4:.12;
  const oldCompile=material.onBeforeCompile;
  material.onBeforeCompile=(shader,renderer)=>{
    oldCompile.call(material,shader,renderer);
    shader.uniforms.paintBrushes={value:brushes()};shader.uniforms.paintScale={value:scale};shader.uniforms.paintStrength={value:strength};
    shader.vertexShader='varying vec3 paintPosition; varying vec3 paintNormal;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\npaintPosition=position;paintNormal=normal;');
    shader.fragmentShader='varying vec3 paintPosition; varying vec3 paintNormal; uniform sampler2D paintBrushes; uniform float paintScale; uniform float paintStrength;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec3 pw=pow(abs(normalize(paintNormal)),vec3(5.0));pw/=max(.001,pw.x+pw.y+pw.z);
      vec3 pp=paintPosition*paintScale;
      vec3 pigment=texture2D(paintBrushes,pp.yz).rgb*pw.x+texture2D(paintBrushes,pp.xz).rgb*pw.y+texture2D(paintBrushes,pp.xy).rgb*pw.z;
      vec3 underpaint=mix(vec3(.53,.67,.70),vec3(1.42,1.26,1.00),smoothstep(.37,.76,pigment.r));
      diffuseColor.rgb*=mix(vec3(1.),underpaint,paintStrength);
    `);
    // Broad painted planes interrupt perfectly smooth spherical shading.
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      vec3 brushTangent=normalize(dFdx(vViewPosition)+vec3(.00001));
      vec3 brushBitangent=normalize(dFdy(vViewPosition)+vec3(.00001));
      normal=normalize(normal+(pigment.r-.61)*.22*brushTangent+(pigment.b-.56)*.22*brushBitangent);
    `);
  };
  material.customProgramCacheKey=()=>`gouache-${scale}-${strength}`;
  return material;
}
