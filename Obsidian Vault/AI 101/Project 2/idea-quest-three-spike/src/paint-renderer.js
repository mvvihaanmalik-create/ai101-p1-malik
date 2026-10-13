import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Variance-weighted paint blending: joins neighboring colors into soft strokes
// with most original detail retained. Only the 3D scene goes through this pass.
export function createPaintRenderer(renderer,scene,camera){
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});target.samples=4;
  const composer=new EffectComposer(renderer,target);
  composer.addPass(new RenderPass(scene,camera));
  const pass=new ShaderPass({
    uniforms:{tDiffuse:{value:null},resolution:{value:new THREE.Vector2(1,1)},radius:{value:1.7}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float radius;varying vec2 vUv;
    void main(){
      vec2 pixel=1./resolution;
      vec3 total=vec3(0.);float totalWeight=0.;
      for(int region=0;region<4;region++){
        vec2 direction=vec2(region==0||region==2?-1.:1.,region<2?-1.:1.);
        vec3 mean=vec3(0.),squares=vec3(0.);
        for(int x=0;x<3;x++)for(int y=0;y<3;y++){
          vec2 offset=vec2(float(x),float(y))*direction*pixel*radius;
          vec3 color=textureLod(tDiffuse,vUv+offset,0.).rgb;
          mean+=color;squares+=color*color;
        }
        mean/=9.;vec3 variance=abs(squares/9.-mean*mean);
        float weight=1./pow(.006+dot(variance,vec3(.299,.587,.114)),1.7);
        total+=mean*weight;totalWeight+=weight;
      }
      vec3 paint=total/totalWeight;
      vec3 original=texture2D(tDiffuse,vUv).rgb;
      // Preserve fine model detail; a light paint blend still joins neighbouring tones.
      vec3 color=mix(paint,original,.78);
      // Subtle paper tooth, fixed in place rather than animated film grain.
      float tooth=fract(sin(dot(floor(vUv*resolution),vec2(12.9898,78.233)))*43758.5453);
      color*=.988+tooth*.024;
      gl_FragColor=vec4(color,1.);
    }`
  });
  composer.addPass(pass);
  const glow=new UnrealBloomPass(new THREE.Vector2(1,1),.16,.35,1.45);composer.addPass(glow);
  composer.addPass(new OutputPass());
  return {render:()=>composer.render(),resize(w,h){const d=renderer.getPixelRatio();composer.setPixelRatio(d);composer.setSize(w,h);pass.uniforms.resolution.value.set(w*d,h*d);pass.uniforms.radius.value=w<700?.6:.75;}};
}
