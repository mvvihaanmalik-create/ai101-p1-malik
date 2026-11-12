export const CATALOGUE=Object.freeze({
 C1:{name:'The butler',normal:'A bell held in his hand.',changed:'The bell floats. Its owner approaches.',kind:'character'},
 C2:{name:'Room service',normal:'A closed silver cloche on its tray.',changed:'Something knocks beneath the closed cloche.',kind:'character'},
 C3:{name:'The children',normal:'Two children roll a red rubber ball.',changed:'A porcelain likeness of a third child rolls between them and stops face up.',kind:'character'},
 C4:{name:'The abandoned dog',normal:'The standing dog casts a matching shadow.',changed:'The dog stands. Its shadow sits.',kind:'character'},
 C5:{name:'The last order',normal:'The server sets the glass down. Then the bartender picks it up.',changed:'A released glass rises into a waiting hand.',kind:'character'},
 C6:{name:'The late guest',normal:'The guest and his reflection move together.',changed:'His reflection stays behind, then turns as you retreat.',kind:'character'},
 E1:{name:'The founder',normal:'The portrait looks away.',changed:'He faces you. A human shadow escapes the frame.',kind:'environment'},
 E2:{name:'The rain',normal:'Rain runs down the glass.',changed:'The middle window rains upward.',kind:'environment'},
 E3:{name:'The lift',normal:'The bronze doors are closed.',changed:'A gap reveals the same wallpaper inside.',kind:'environment'},
 E4:{name:'The bathroom mirror',normal:'Your face and collar are clean in the glass.',changed:'Blood runs down your reflected face and into your collar.',kind:'environment'},
 E5:{name:'The coat',normal:'An empty coat hangs from a stand.',changed:'It stretches horizontally from the hanger.',kind:'environment'},
 E6:{name:'The runner',normal:'The carpet is flat.',changed:'The carpet rises and falls as if breathing.',kind:'environment'},
});
export const ANOMALIES=Object.freeze(Object.keys(CATALOGUE));
export const CHARACTERS=Object.freeze(ANOMALIES.filter(id=>CATALOGUE[id].kind==='character'));
export function inspectionAt(room,x,y){
 if(room==='landing'&&y>6.3&&x<59.8)return {key:'lift',label:'Inspect the lift'};
 if(room==='bathroom'&&y>4.25&&y<6.78)return {key:'mirror',label:'Look at yourself'};
 const study={pantry:['service','Watch the silver lid'],lounge:['bar','Watch the last order'],baggage:['luggage','Check the luggage mirror']}[room];
 if(study&&y>3.8&&y<(room==='lounge'?5.35:7.6))return {key:study[0],label:study[1]};
 if(room!=='corridor')return null;
 if(y>6.1&&y<9.3&&x<-.55)return {key:'portrait',label:'Inspect the founder portrait'};
 if(y>10.5&&y<14.6&&x>.65)return {key:'rain',label:'Inspect the window'};
 return null;
}
