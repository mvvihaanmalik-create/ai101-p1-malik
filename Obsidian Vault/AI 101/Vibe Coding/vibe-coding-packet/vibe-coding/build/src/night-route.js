// The register describes ordinary conditions. It is identical for both versions of a scene.
export const STAIR=['C3','C4','E5'], HALL=['C1','C2','C5','C6','E1','E2','E4','E6'];
export const REGISTER={
 C1:'The butler holds the bell in his hand.',C2:'The silver lid rests quietly on its tray.',
 C3:'Two children roll a red rubber ball across the landing.',C4:'The dog stands. So does its shadow.',
 C5:'The glass travels from hand to hand.',C6:'The traveller and his reflection move together.',
 E1:'The founder looks away from the hall.',E2:'Rain runs down all three windows.',
 E3:'The broken lift stays shut.',E4:'The gilt mirror shows the gallery opposite.',
 E5:'An empty coat hangs straight down.',E6:'The runner lies flat underfoot.'
};
export const SHOTS={C2:'service',C3:'children',C4:'dog',C5:'bar',C6:'luggage',E1:'portrait',E2:'rain',E3:'lift',E4:'mirror',E5:'coat'};
export const floorName=n=>['GROUND','FIRST','SECOND','THIRD','FOURTH'][Math.max(0,Math.min(4,n))];
export const orientationFocus=y=>y<9?'C2':y<12.1?'C3':y<15.45?'C4':y<18.85?'C5':'C6';
export function stairDecision(before,after){
 if(before>2.82&&after<=2.82)return 'return';
 if(before<9.35&&after>=9.35)return 'continue';
 return null;
}
export function chooseShot(room,y,focus,raw,watch){
 if(room==='stairs')return watch&&y>5.15&&y<9.28?{key:'stair',label:'Study the upper landing'}:null;
 if(room==='landing')return raw;
 if(room!=='corridor')return null;
 if(focus==='C1'&&y>10.4&&y<14.4)return {key:'bell',label:'Watch the bell'};
 if(focus==='E6'&&y>9.1&&y<15)return {key:'runner',label:'Look along the runner'};
 return raw&&raw.key===SHOTS[focus]?raw:null;
}
