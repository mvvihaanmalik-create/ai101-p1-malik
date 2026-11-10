export const CATALOGUE=Object.freeze({
 C1:{name:'The butler',normal:'A bell held in his hand.',changed:'The bell floats. Its owner approaches.',kind:'character'},
 C2:{name:'Room service',normal:'A closed silver cloche on its tray.',changed:'The cloche hangs above the empty tray.',kind:'character'},
 C3:{name:'The children',normal:'A red ball rolls and bounces.',changed:'The ball stays suspended between them.',kind:'character'},
 C4:{name:'The abandoned dog',normal:'The standing dog casts a matching shadow.',changed:'The dog stands. Its shadow sits.',kind:'character'},
 C5:{name:'The last order',normal:'A glass passes between two hands.',changed:'A released glass rises into a waiting hand.',kind:'character'},
 C6:{name:'The late guest',normal:'A suitcase held by its handle.',changed:'The suitcase follows without contact.',kind:'character'},
 E1:{name:'The founder',normal:'The portrait looks away.',changed:'He faces you. A human shadow escapes the frame.',kind:'environment'},
 E2:{name:'The rain',normal:'Rain runs down the glass.',changed:'The middle window rains upward.',kind:'environment'},
 E3:{name:'The lift',normal:'The bronze doors are closed.',changed:'A gap reveals the same wallpaper inside.',kind:'environment'},
 E4:{name:'The mirror',normal:'The gilt mirror reflects the corridor.',changed:'An extra stair flight appears in the reflection.',kind:'environment'},
 E5:{name:'The coat',normal:'An empty coat hangs from a stand.',changed:'It stretches horizontally from the hanger.',kind:'environment'},
 E6:{name:'The runner',normal:'The carpet is flat.',changed:'The carpet rises and falls as if breathing.',kind:'environment'},
});
export const ANOMALIES=Object.freeze(Object.keys(CATALOGUE));
export const CHARACTERS=Object.freeze(ANOMALIES.filter(id=>CATALOGUE[id].kind==='character'));
export function inspectionAt(room,x,y){
 if(room==='landing'&&y>6.3&&x<60.15)return {key:'lift',label:'Inspect the lift'};
 if(room!=='corridor')return null;
 if(y>6.1&&y<9.3&&x<.25)return {key:'portrait',label:'Inspect the founder portrait'};
 if(y>13.8&&y<17.8&&x<.1)return {key:'mirror',label:'Inspect the gilt mirror'};
 if(y>10.4&&y<14.2&&x<-.7)return {key:'coat',label:'Inspect the coat stand'};
 if(y>10.5&&y<14.6&&x>.65)return {key:'rain',label:'Inspect the window'};
 if(y>10&&y<15.4)return {key:'vignette',label:'Look closer at the guests'};
 return null;
}
