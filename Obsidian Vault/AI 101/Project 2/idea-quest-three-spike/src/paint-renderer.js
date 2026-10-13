import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Variance-weighted paint blending: joins neighboring colors into soft strokes
// with most original detail retained. Only the 3D scene goes through this pass.
export function createPaintRenderer(renderer,scene,camera){
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});target.samples=0;
  const composer=new EffectComposer(renderer,target);
  composer.addPass(new RenderPass(scene,camera));
  const pass=new ShaderPass({
    uniforms:{tDiffuse:{value:null},resolution:{value:new THREE.Vector2(1,1)},radius:{value:1.7}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float radius;varying vec2 vUv;
    void main(){
      vec2 pixel=1./resolution;
      vec3 original=texture2D(tDiffuse,vUv).rgb;
      vec3 total=original*2.;float totalWeight=2.;
      for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
        if(x==0&&y==0)continue;
        vec3 color=texture2D(tDiffuse,vUv+vec2(float(x),float(y))*pixel*radius).rgb;
        vec3 delta=color-original;float weight=1./(1.+dot(delta,delta)*35.);
        total+=color*weight;totalWeight+=weight;
      }
      vec3 paint=total/totalWeight;
      // Preserve fine model detail; a light paint blend still joins neighbouring tones.
      vec3 color=mix(paint,original,.78);
      // Subtle paper tooth, fixed in place rather than animated film grain.
      float tooth=fract(sin(dot(floor(vUv*resolution),vec2(12.9898,78.233)))*43758.5453);
      color*=.988+tooth*.024;
      gl_FragColor=vec4(color,1.);
    }`
  });
  composer.addPass(pass);
  composer.addPass(new OutputPass());
  return {render:()=>composer.render(),setLight(light){pass.enabled=!light;},resize(w,h){const d=renderer.getPixelRatio();composer.setPixelRatio(d);composer.setSize(w,h);pass.uniforms.resolution.value.set(w*d,h*d);pass.uniforms.radius.value=w<700?.65:.85;}};
}
