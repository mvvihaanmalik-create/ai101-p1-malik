// The register describes ordinary conditions. It is identical for both versions of a scene.
export const STAIR=['C3','C4','E5'], HALL=['C1','C2','C5','C6','E1','E2','E4','E6'];
export const REGISTER={
 C1:'The butler holds the bell in his hand.',C2:'The silver lid rests quietly on its tray.',
 C3:'Two children roll a red rubber ball across the landing.',C4:'The dog stands. So does its shadow.',
 C5:'The server puts the glass down before the bartender picks it up.',C6:'The traveller and his reflection move together.',
 E1:'The founder looks away from the hall.',E2:'Rain runs down all three windows.',
 E3:'The broken lift stays shut.',E4:'The bathroom mirror shows your face and clean clothes.',
 E5:'An empty coat hangs straight down.',E6:'The runner lies flat underfoot.'
};
export const GREETINGS={
 C1:'Butler: \u201cGood evening. If you need me, listen for my bell.\u201d',
 C2:'Room service: \u201cCareful of the lid, love. The plates are still warm.\u201d',
 C3:'Child: \u201cRoll it back if it gets past you, okay?\u201d',
 C4:'A collar tag reads BEAU. He turns one ear toward your footsteps.',
 C5:'Server: \u201cThere\u2019s a place for you at the bar. What will you have?\u201d',
 C6:'Traveller: \u201cWould you mind the case? I\u2019d hate to lose sight of it.\u201d'
};
// Quiet callbacks on return visits, shared by ordinary and changed encounters.
const upperFloorLines={
 C1:['Butler: Your key again? Of course.','Butler: I remember your hand better than your name.'],
 C2:['Room service: One more place to lay.','Room service: Your supper keeps going cold upstairs.'],
 C3:['Child: You came back! We kept your turn.','Child: Close your eyes. We know where you are.'],
 C4:['Beau waits for you to pass before he moves his ears.','Beau listens to a footstep after yours has stopped.'],
 C5:['Server: Shall I keep your seat?','Bartender: I washed your glass this morning.'],
 C6:['Traveller: I thought we were on the same floor.','Traveller: Would you look inside? I can hear my watch.']
};
export const floorGreeting=(id,floor)=>floor<2?GREETINGS[id]:upperFloorLines[id]?.[floor>=4?1:0];
export const SHOTS={C2:'service',C3:'children',C4:'dog',C5:'bar',C6:'luggage',E1:'portrait',E2:'rain',E3:'lift',E4:'mirror',E5:'coat'};
export const floorName=n=>['GROUND','FIRST','SECOND','THIRD','FOURTH'][Math.max(0,Math.min(4,n))];
export const westRooms={C2:'pantry',C5:'lounge',C6:'baggage',E4:'bathroom'};
export const westTour=['pantry','lounge','baggage','bathroom','corridor'];
export const westDestination=id=>westRooms[id]||'corridor';
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
