export const CYCLES={Walk:1.04,WalkBack:.7626666666666667,StepLeft:.52,StepRight:.52};
export function createLocomotion(){return {stride:1,held:0,driveX:0,driveZ:0,vx:0,vz:0,phase:0,gait:0,weights:{Walk:1,WalkBack:0,StepLeft:0,StepRight:0}};}
export function steerMotion(m,x,z,dt,scale=1,brisk=true){
 const length=Math.hypot(x,z);if(length>1){x/=length;z/=length;}
 const sameHeading=x*m.driveX+z*m.driveZ>.62;
 m.held=length&&brisk?(sameHeading?m.held+dt:dt):0;m.driveX=x;m.driveZ=z;
 const t=Math.max(0,Math.min(1,(m.held-.28)/.92));
 const pace=1+.94*t*t*(3-2*t);
 const tx=x*.78*scale*pace,tz=z*(z<0?1.12:.86)*scale*pace;
 const dx=tx-m.vx,dz=tz-m.vz,d=Math.hypot(dx,dz),limit=(length?7:19)*dt;
 const amount=d?Math.min(1,limit/d):0;m.vx+=dx*amount;m.vz+=dz*amount;
 return {x:m.vx*dt,z:m.vz*dt};
}
export function measureMotion(m,dx,dz,dt){
 const demands={Walk:Math.max(0,-dz)/CYCLES.Walk,WalkBack:Math.max(0,dz)/CYCLES.WalkBack,StepLeft:Math.max(0,-dx)/CYCLES.StepLeft,StepRight:Math.max(0,dx)/CYCLES.StepRight};
 const speed=Math.hypot(dx,dz)/Math.max(dt,1e-6);
 const brisk=Math.max(0,Math.min(1,(speed-1.15)/.95));
 m.stride=1+.34*brisk*brisk*(3-2*brisk);
 const total=Object.values(demands).reduce((a,b)=>a+b,0);m.phase+=total/m.stride;
 if(total>1e-8)for(const key of Object.keys(demands))m.weights[key]=demands[key]/total;
 const blend=1-Math.exp(-20*dt);
 m.gait+=((speed>.015?Math.min(1,speed/.22):0)-m.gait)*blend;
 if(m.gait<.001)m.gait=0;
 return m;
}
