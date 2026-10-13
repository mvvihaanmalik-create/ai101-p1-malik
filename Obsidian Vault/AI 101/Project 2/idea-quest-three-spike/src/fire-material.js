import * as THREE from 'three';

// Layered luminous colour gives each flame a hot core and an amber edge.
export function fireMaterial(height,phase) {
  return new THREE.ShaderMaterial({
    uniforms:{fireTime:{value:0},fireHeight:{value:height},firePhase:{value:phase}},
    transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`uniform float fireTime,fireHeight,firePhase;varying vec3 flamePosition;
      void main(){vec3 p=position;float tip=clamp(p.y/fireHeight,0.,1.);
      p.x+=sin(p.y*6.+fireTime*3.+firePhase)*tip*tip*.027;
      flamePosition=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader:`uniform float fireTime,fireHeight,firePhase;varying vec3 flamePosition;
      void main(){float height=clamp(flamePosition.y/fireHeight,0.,1.);
      float core=pow(1.-clamp(abs(flamePosition.x)/.16,0.,1.),1.8)*(1.-height*.55);
      vec3 colour=mix(vec3(1.15,.17,.025),vec3(1.85,1.04,.35),core);
      colour*=.95+.05*sin(fireTime*3.8+firePhase+height*7.);
      gl_FragColor=vec4(colour,.94);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`
  });
}
