// A stable four-storey layout, separate from the story's randomized visits.
export const EXPLORE_WINGS=[
 ['pantry','lounge','baggage','bathroom','corridor'],
 ['corridor','bathroom'],
 ['corridor','baggage'],
 ['corridor','suite']
];
export const EXPLORE_FLOORS=['Ground floor','First floor','Second floor','Third floor'];
export function wingExit(floor,room,direction){
 const wing=EXPLORE_WINGS[floor],i=wing.indexOf(room);
 if(i<0)return direction>0?wing[0]:wing.at(-1);
 return wing[i+direction]||'landing';
}
export const EXPLORE_PLAN='GROUND · Reception, pantry, Night Bar, baggage office, left luggage, washroom, west gallery.\nFIRST · Guest gallery and washroom.\nSECOND · Guest gallery and baggage office.\nTHIRD · Gallery and honeymoon-suite approach.\n\nThe east stair joins all four floors. At a landing: E goes up, the red door enters that floor, and walking back goes downstairs. Ground reception leads outside.';
