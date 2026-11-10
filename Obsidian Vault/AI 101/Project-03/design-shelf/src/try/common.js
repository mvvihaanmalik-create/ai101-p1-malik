export const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
export function ready(){parent.postMessage({type:'shelf:preview-ready'},'*');}
