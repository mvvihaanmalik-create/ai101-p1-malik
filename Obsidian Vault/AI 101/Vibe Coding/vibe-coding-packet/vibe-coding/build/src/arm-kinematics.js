import * as THREE from 'three';
// Reach stays inside the arm's workspace, avoiding locked elbows and unstable flips.
export function solveArm(shoulder,target,upper,lower,pole){
 const axis=target.clone().sub(shoulder);const distance=THREE.MathUtils.clamp(axis.length(),Math.abs(upper-lower)+.025,(upper+lower)*.96);
 if(axis.lengthSq()<1e-10)axis.set(0,-1,0);else axis.normalize();
 const wrist=shoulder.clone().addScaledVector(axis,distance);
 const along=(upper*upper-lower*lower+distance*distance)/(2*distance);
 const height=Math.sqrt(Math.max(0,upper*upper-along*along));
 const bend=pole.clone().addScaledVector(axis,-pole.dot(axis));
 if(bend.lengthSq()<1e-6){bend.set(1,0,0).addScaledVector(axis,-axis.x);if(bend.lengthSq()<1e-6)bend.set(0,0,1);}
 bend.normalize();
 return {elbow:shoulder.clone().addScaledVector(axis,along).addScaledVector(bend,height),wrist};
}
