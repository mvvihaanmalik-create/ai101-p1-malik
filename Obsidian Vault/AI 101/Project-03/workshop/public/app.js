(() => {
  'use strict';
  const $=s=>document.querySelector(s),root=$('#workshop');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const roles={chief:{name:'Chief of Staff',job:'Coordinates'},creative:{name:'Creative Partner',job:'Designer'},tech:{name:'Technologist',job:'Architect'},pip:{name:'Pip (Design Shelf)',job:'References'},programmer:{name:'Programmer',job:'Builds'},auditor:{name:'Auditor',job:'Checks'}};
  // Shelf objects: individual material colours, a shaded edge, and a glazed face.
  // Geometry is drawn for this interface; no external icon font or sprite fetch.
  const shelfObjects={
    spark:'<path fill="@edge" d="m14 3 3.4 8.2L25 15l-7.6 3.8L14 27l-3.4-8.2L3 15l7.6-3.8Z"/><path fill="@face" d="m14 1 3.4 8.2L25 13l-7.6 3.8L14 25l-3.4-8.2L3 13l7.6-3.8Z"/><path fill="@glint" d="m14 3-2.1 9.1L6 13l5.7-4Z"/>',
    grid:'<g fill="@edge"><rect x="3" y="5" width="10" height="10" rx="3"/><rect x="16" y="5" width="10" height="10" rx="3"/><rect x="3" y="18" width="10" height="10" rx="3"/><rect x="16" y="18" width="10" height="10" rx="3"/></g><g fill="@face"><rect x="3" y="3" width="10" height="10" rx="3"/><rect x="16" y="3" width="10" height="10" rx="3"/><rect x="3" y="16" width="10" height="10" rx="3"/><rect x="16" y="16" width="10" height="10" rx="3"/></g><path d="M6 5h4M19 5h4M6 18h4M19 18h4" stroke="@glint" stroke-width="1.3" stroke-linecap="round"/>',
    plugin:'<path fill="@edge" d="M8 9V5a2 2 0 0 1 4 0v4h5V5a2 2 0 0 1 4 0v4h2v7a9 9 0 0 1-7 8v3h-4v-3a9 9 0 0 1-7-8V9Z"/><path fill="@face" d="M8 7V3a2 2 0 0 1 4 0v4h5V3a2 2 0 0 1 4 0v4h2v7a9 9 0 0 1-18 0V7Z"/><path d="M8 10h12" stroke="@glint" stroke-width="1.4" stroke-linecap="round"/><path fill="@ink" d="m15 11-4 5h3l-1 4 5-6h-3l1-3Z"/>',
    game:'<path fill="@edge" d="M9 8h12c5 0 7 14 5 17s-5-2-7-3H11c-2 1-5 6-7 3S4 8 9 8Z"/><path fill="@face" d="M9 5h12c5 0 7 14 5 17s-5-2-7-3H11c-2 1-5 6-7 3S4 5 9 5Z"/><path d="M10 10v6m-3-3h6" stroke="@ink" stroke-width="2.3" stroke-linecap="round"/><circle cx="21" cy="11" r="1.6" fill="@ink"/><circle cx="18" cy="15" r="1.6" fill="@ink"/><path d="M9 7h10" stroke="@glint" stroke-width="1.3" stroke-linecap="round"/>',
    globe:'<circle cx="15" cy="16" r="12" fill="@edge"/><circle cx="15" cy="14" r="12" fill="@face"/><path d="M4 12h22M5 19h20M15 2c-8 7-8 17 0 24M15 2c8 7 8 17 0 24" stroke="@ink" stroke-width="1.25" opacity=".7"/><path d="M8 6c2-2 5-3 8-3" stroke="@glint" stroke-width="1.7" stroke-linecap="round"/>',
    apps:'<rect x="3" y="5" width="24" height="23" rx="5" fill="@edge"/><rect x="3" y="2" width="24" height="23" rx="5" fill="@face"/><path d="M4 9h22M11 10v14" stroke="@ink" stroke-width="1.4" opacity=".6"/><circle cx="7" cy="6" r="1" fill="@glint"/><circle cx="10.5" cy="6" r="1" fill="@glint"/><rect x="14" y="12" width="9" height="4" rx="1.5" fill="@glint" opacity=".7"/>',
    agent:'<path d="M15 3v5" stroke="@edge" stroke-width="3"/><circle cx="15" cy="3" r="2.5" fill="@face"/><rect x="2" y="13" width="26" height="9" rx="4" fill="@edge"/><rect x="5" y="9" width="20" height="19" rx="6" fill="@edge"/><rect x="5" y="6" width="20" height="19" rx="6" fill="@face"/><rect x="9" y="12" width="3" height="5" rx="1.5" fill="@ink"/><rect x="18" y="12" width="3" height="5" rx="1.5" fill="@ink"/><path d="M12 20h6" stroke="@ink" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8h9" stroke="@glint" stroke-width="1.3" stroke-linecap="round"/>',
    creative:'<path fill="@edge" d="M15 4C7 4 2 9 2 16c0 8 6 12 12 12 4 0 5-2 3-5-1-2 1-3 4-3h2c5 0 7-6 3-11-2-3-6-5-11-5Z"/><path fill="@face" d="M15 2C7 2 2 7 2 14c0 8 6 12 12 12 4 0 5-2 3-5-1-2 1-3 4-3h2c5 0 7-6 3-11-2-3-6-5-11-5Z"/><g fill="@ink" opacity=".8"><circle cx="8" cy="11" r="2"/><circle cx="14" cy="7" r="2"/><circle cx="21" cy="10" r="2"/></g><circle cx="8" cy="18" r="2" fill="@glint"/>',
    bookmark:'<path fill="@edge" d="M6 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v22l-9-5-9 5Z"/><path fill="@face" d="M6 4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v22l-9-5-9 5Z"/><path d="M10 4h10" stroke="@glint" stroke-width="1.5" stroke-linecap="round"/>',
    archive:'<rect x="5" y="10" width="20" height="18" rx="3" fill="@edge"/><rect x="5" y="8" width="20" height="17" rx="3" fill="@face"/><rect x="3" y="5" width="24" height="7" rx="2.5" fill="@edge"/><rect x="3" y="3" width="24" height="7" rx="2.5" fill="@face"/><path d="M12 16h6" stroke="@ink" stroke-width="2.5" stroke-linecap="round"/><path d="M7 5h16" stroke="@glint" stroke-width="1.3" stroke-linecap="round"/>',
    notebook:'<rect x="6" y="4" width="20" height="24" rx="4" fill="@edge"/><rect x="6" y="2" width="20" height="24" rx="4" fill="@face"/><path d="M11 3v22" stroke="@ink" stroke-width="1.3" opacity=".55"/><path d="M4 8h4m-4 7h4m-4 7h4" stroke="@edge" stroke-width="2.8" stroke-linecap="round"/><path d="M15 9h7m-7 5h5" stroke="@glint" stroke-width="1.6" stroke-linecap="round"/>',
    folder:'<path fill="@edge" d="M3 7a3 3 0 0 1 3-3h6l3 4h9a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"/><path fill="@face" d="M3 5a3 3 0 0 1 3-3h6l3 4h9a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"/><path d="M5 11h20" stroke="@glint" stroke-width="1.5"/>',
    shelf:'<path fill="@edge" d="m3 19 12-4 12 4v4l-12 5-12-5Z"/><path fill="@face" d="m3 17 12-4 12 4-12 5Z"/><path fill="@edge" d="m3 12 12-4 12 4v4l-12 5-12-5Z"/><path fill="@face" d="m3 10 12-4 12 4-12 5Z"/><path fill="@edge" d="m3 6 12-4 12 4v4l-12 5-12-5Z"/><path fill="@face" d="m3 4 12-4 12 4-12 5Z"/><path d="m5 4 10 4 10-4" stroke="@glint" stroke-width="1" fill="none"/>',
    sun:'<path d="M15 2v3m0 20v3M2 15h3m20 0h3M6 6l2 2m14 14 2 2M6 24l2-2M22 8l2-2" stroke="@edge" stroke-width="3" stroke-linecap="round"/><circle cx="15" cy="16" r="7.5" fill="@edge"/><circle cx="15" cy="14" r="7.5" fill="@face"/><path d="M11 10c1-1 3-2 5-1" stroke="@glint" stroke-width="1.5" stroke-linecap="round"/>',
    moon:'<path fill="@edge" d="M18 4C8 1 1 12 5 21c4 9 18 10 23-1-9 5-18-7-10-16Z"/><path fill="@face" d="M18 2C8-1 1 10 5 19c4 9 18 10 23-1C19 23 10 11 18 2Z"/><path d="M9 7c-2 2-3 5-2 8" stroke="@glint" stroke-width="1.7" stroke-linecap="round"/>',
    search:'<path d="m20 21 6 6" stroke="@edge" stroke-width="5" stroke-linecap="round"/><path d="m20 19 6 6" stroke="@face" stroke-width="4.5" stroke-linecap="round"/><circle cx="12.5" cy="13.5" r="9" fill="@edge"/><circle cx="12.5" cy="11.5" r="9" fill="@face"/><circle cx="12.5" cy="11.5" r="5.5" fill="@ink" opacity=".6"/><path d="M8 7c2-2 4-2 6-1" stroke="@glint" stroke-width="1.6" stroke-linecap="round"/>',
    play:'<path fill="@edge" d="M8 5c0-2 2-3 4-2l15 11c2 1 2 3 0 4L12 29c-2 1-4 0-4-2Z"/><path fill="@face" d="M8 3c0-2 2-3 4-2l15 11c2 1 2 3 0 4L12 27c-2 1-4 0-4-2Z"/>',
    plus:'M15 5v20M5 15h20',close:'m7 7 16 16M7 23 23 7',check:'m5 15 7 7L26 7',menu:'M5 7h20M5 15h20M5 23h14',
    refresh:'M25 10A11 11 0 0 0 7 5l-4 5m0-6v6h6M5 20a11 11 0 0 0 18 5l4-5m0 6v-6h-6',
    chevrons:'m12 9 3-4 3 4m-6 12 3 4 3-4','chevron-left':'m19 5-10 10 10 10','chevron-right':'m11 5 10 10-10 10',
    'arrow-up-right':'M7 23 23 7M8 7h15v15',link:'m12 18 6-6M10 21l-2 2a5 5 0 0 1-7-7l6-6a5 5 0 0 1 7 0m2 10a5 5 0 0 0 7 0l6-6a5 5 0 0 0-7-7l-2 2'
  };
  const iconMaterials={
    gold:['#fff3b7','#edbd55','#bc792e','#875222','#fff9df','#774a20'],
    blue:['#c4e9ff','#61abe7','#3474b7','#26578b','#f0faff','#214b78'],
    violet:['#ecdcff','#af86db','#7952b0','#543579','#fff5ff','#50336d'],
    coral:['#ffd6c3','#ee967f','#cb5f57','#8e3e3c','#fff3e8','#6c3435'],
    teal:['#c5f4eb','#65beb3','#33877f','#245c5b','#effff8','#204b4a'],
    silver:['#f2f4f7','#bbc6d2','#7c8d9f','#4e6073','#fff','#394e63'],
    cream:['#fff9df','#f1dfb0','#c9ab70','#8d743f','#fffef3','#705c34'],
    kraft:['#f7dfbd','#cba47a','#a27751','#735039','#fff3df','#68432c'],
    green:['#daf5c3','#8dbb6f','#508448','#355c34','#f6ffe8','#2a4b2b']
  };
  const iconMaterialNames={spark:'gold',grid:'blue',plugin:'violet',game:'coral',globe:'blue',apps:'blue',agent:'teal',creative:'coral',bookmark:'gold',archive:'kraft',notebook:'blue',folder:'gold',shelf:'kraft',sun:'gold',moon:'cream',search:'silver',play:'cream',plus:'blue',close:'silver',check:'green',menu:'silver',refresh:'teal',chevrons:'silver','chevron-left':'silver','chevron-right':'silver','arrow-up-right':'blue',link:'blue'};
  let shelfIconSequence=0;
  function glassIcon(name){

    const id='workshop-glass-'+(++shelfIconSequence),object=shelfObjects[name]||shelfObjects.grid,colors=iconMaterials[iconMaterialNames[name]||'silver'];
    const geometry=object.startsWith('<')?object:'<path d="'+object+'" stroke="@edge" stroke-width="3.9" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(0 1.3)"/><path d="'+object+'" stroke="@face" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
    return '<svg class="shelf-icon" data-object="'+name+'" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><defs><linearGradient id="'+id+'f" x1=".15" y1="0" x2=".8" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="'+colors[0]+'"/><stop offset=".48" stop-color="'+colors[1]+'"/><stop offset="1" stop-color="'+colors[2]+'"/></linearGradient></defs>'+geometry.replaceAll('@face','url(#'+id+'f)').replaceAll('@edge',colors[3]).replaceAll('@glint',colors[4]).replaceAll('@ink',colors[5])+'</svg>';
  }

  shelfObjects.quest='<path d="M8 8h14v3l3 4v10q0 4-4 4H9q-4 0-4-4V15l3-4Z" fill="@edge"/><path d="M8 6h14v3l3 4v10q0 4-4 4H9q-4 0-4-4V13l3-4Z" fill="@face" opacity=".85"/><path d="M8 17q7-3 14 0v6q0 2-2 2H10q-2 0-2-2Z" fill="@glint" opacity=".45"/><rect x="8" y="2" width="14" height="5" rx="2" fill="#cba47a"/><path d="M9 11v9" stroke="@glint" stroke-width="1.6" stroke-linecap="round"/>';
  iconMaterialNames.quest='green';
  const roleIcons={chief:'notebook',creative:'creative',tech:'plugin',pip:'shelf',programmer:'apps',auditor:'search'};

  document.querySelector('.workshop-symbol').innerHTML=glassIcon('spark');
  document.querySelector('.quest-symbol').innerHTML=glassIcon('quest');
  document.querySelector('.shelf-symbol').innerHTML=glassIcon('folder');
  document.querySelector('.iq-brand .iq-jar').innerHTML=glassIcon('quest');
  let portraitSerial=0;
  function person(id,mini=false){
    if(mini)return `<span class="role-glass-icon">${glassIcon(roleIcons[id])}</span>`;
    const uid='sculpt-'+(++portraitSerial),palettes={chief:['#b2dac3','#3c8b78','#203f4c'],creative:['#ffd2ac','#e47b83','#a54770'],tech:['#ffe5a0','#e9a440','#985c29'],pip:['#b2a5f1','#7651be','#49358a'],programmer:['#c5e9f2','#5cabc3','#365f8b'],auditor:['#f6edda','#bdd8ca','#5b9c91']},c=palettes[id];
    const glow={chief:['#78e1bf','#6477c1'],creative:['#ffb86b','#e35ca8'],tech:['#ffda6e','#ed7552'],pip:['#ea8cc4','#5c9ee9'],programmer:['#6ce0d0','#7376cd'],auditor:['#f7dca4','#59b7ae']}[id];
    const shape=id==='chief'?'M29 50 Q18 6 35 16 L51 35 Q64 51 76 35 L92 16 Q106 7 99 54 Q114 79 100 111 Q96 124 65 125 Q32 124 27 108 Q16 80 29 50Z':id==='pip'?'M63.5 29 C77.25 22.75 92.25 30.25 97.25 44 C116 42.75 126 59 117.25 74 C126 90.25 116 106.5 98.5 107.75 C93.5 125.25 73.5 131.5 61 120.25 C44.75 129 27.25 119 27.25 102.75 C9.75 97.75 6 77.75 19.75 66.5 C14.75 49 31 35.25 47.25 39 C51 32.75 56 30.25 63.5 29Z':id==='programmer'?'M34 33 Q64 24 97 35 Q109 39 110 59 L107 104 Q104 124 86 126 L43 124 Q25 121 23 103 L20 62 Q19 40 34 33Z':id==='tech'?'M36 40 Q63 29 94 42 Q110 48 109 74 L106 103 Q103 124 84 126 L44 123 Q25 119 24 102 L22 73 Q21 47 36 40Z':id==='auditor'?'M66 29 C79 29 83 40 98 40 Q113 40 111 57 L106 83 C103 103 87 120 73 127 Q66 131 59 127 C45 120 29 103 26 83 L21 57 Q19 40 34 40 C49 40 53 29 66 29Z':'M65 27 C94 26 109 52 108 80 C111 109 93 126 63 125 C30 126 19 106 23 80 C21 51 39 28 65 27Z';
    const hat=id==='creative'?`<g class="sculpt-prop"><path d="M25 43 Q32 24 66 24 Q96 23 105 35 Q104 47 66 48 Q35 51 25 43" fill="url(#${uid}-gold)"/><path d="M65 25 Q62 14 69 16" fill="none" stroke="#d8af58" stroke-width="5" stroke-linecap="round"/></g>`:id==='tech'?`<g class="sculpt-prop"><path d="M65 38V19" stroke="#bd8741" stroke-width="4"/><circle class="antenna" cx="65" cy="16" r="6" fill="#ffdf8e"/></g>`:'';
    const visor=['tech','programmer'].includes(id)?`<rect x="33" y="57" width="65" height="43" rx="17" fill="url(#${uid}-visor)" stroke="#e5ffff" stroke-opacity=".3"/><path d="M42 64Q62 58 87 64" stroke="#fff" stroke-opacity=".2" fill="none" stroke-width="2"/>`:'';
    const eyes=id==='pip'?'<g class="sculpt-face" transform="rotate(-17 71 60)"><g class="sculpt-blink" stroke="#fffaef" stroke-width="5" stroke-linecap="round"><path d="M65 53v14M79 53v14"/></g></g>':id==='auditor'?'<g class="sculpt-face"><g class="sculpt-blink" fill="#233b40"><ellipse cx="51" cy="76" rx="4" ry="7"/><ellipse cx="79" cy="76" rx="4" ry="7"/></g><path d="M62 99q6 5 11-1" fill="none" stroke="#4c5454" stroke-width="2" stroke-linecap="round"/></g>':id==='programmer'?'<g class="sculpt-face"><path d="m48 73 7 6-7 6" fill="none" stroke="#d4f5ef" stroke-width="3" stroke-linecap="round"/><path class="cursor" d="M65 87h12" stroke="#d4f5ef" stroke-width="3" stroke-linecap="round"/></g>':`<g class="sculpt-face" fill="${['chief','pip','tech'].includes(id)?'#fff4cd':'#343d40'}"><g class="sculpt-blink"><ellipse cx="51" cy="77" rx="4" ry="7"/><ellipse cx="79" cy="75" rx="4" ry="7"/></g><path d="M61 91q5 4 10-1" fill="none" stroke="${id==='pip'?'#fff0e7':'#4e4641'}" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/></g>`;
    const prop=id==='auditor'?`<g class="sculpt-prop lens"><path d="m94 90 12 16" stroke="url(#${uid}-gold)" stroke-width="5" stroke-linecap="round"/><circle cx="82" cy="78" r="18" fill="#d7fff4" fill-opacity=".1" stroke="url(#${uid}-gold)" stroke-width="3"/><path d="M68 78q0-9 8-12" fill="none" stroke="#effff7" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/></g>`:'';
    return `<span class="${mini?'iq-avatar-wrap':'iq-portrait'}" aria-hidden="true"><span class="iq-person sculpt ${id}" data-agent="${id}"><svg viewBox="0 0 132 145" focusable="false"><defs><radialGradient id="${uid}-volume" cx=".38" cy=".34" r=".66"><stop offset=".45" stop-color="#0b1930" stop-opacity="0"/><stop offset=".83" stop-color="#15202e" stop-opacity=".12"/><stop offset="1" stop-color="#081526" stop-opacity=".42"/></radialGradient><radialGradient id="${uid}-softbox" cx=".31" cy=".23" r=".44"><stop stop-color="#fff" stop-opacity=".42"/><stop offset=".48" stop-color="#fff" stop-opacity=".13"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><radialGradient id="${uid}-warm" cx=".3" cy=".55" r=".55"><stop stop-color="${glow[0]}" stop-opacity=".8"/><stop offset=".45" stop-color="${glow[0]}" stop-opacity=".4"/><stop offset="1" stop-color="${glow[0]}" stop-opacity="0"/></radialGradient><radialGradient id="${uid}-cool" cx=".76" cy=".77" r=".6"><stop stop-color="${glow[1]}" stop-opacity=".85"/><stop offset=".5" stop-color="${glow[1]}" stop-opacity=".35"/><stop offset="1" stop-color="${glow[1]}" stop-opacity="0"/></radialGradient><radialGradient id="${uid}-body" cx=".29" cy=".19" r=".88"><stop stop-color="${c[0]}"/><stop offset=".42" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></radialGradient><linearGradient id="${uid}-gold" x2=".8" y2="1"><stop stop-color="#fff1b2"/><stop offset=".5" stop-color="#d9b76a"/><stop offset="1" stop-color="#987345"/></linearGradient><linearGradient id="${uid}-visor" x2=".8" y2="1"><stop stop-color="#122d39"/><stop offset="1" stop-color="#456975"/></linearGradient><linearGradient id="${uid}-depth" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#fff" stop-opacity=".17"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#071f2c" stop-opacity=".32"/></linearGradient><radialGradient id="${uid}-shine" cx=".25" cy=".12" r=".85"><stop stop-color="#fff" stop-opacity=".8"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".19"/></radialGradient></defs><ellipse class="sculpt-shadow" cx="66" cy="134" rx="35" ry="6" fill="#071914" opacity=".25"/><g class="sculpt-body"><ellipse cx="45" cy="123" rx="12" ry="7" fill="${c[1]}"/><ellipse cx="86" cy="123" rx="12" ry="7" fill="${c[2]}"/><path d="${shape}" fill="url(#${uid}-body)" stroke="${c[0]}" stroke-opacity=".3"/><path d="${shape}" fill="url(#${uid}-depth)"/><path d="${shape}" fill="url(#${uid}-warm)"/><path d="${shape}" fill="url(#${uid}-cool)"/><path d="${shape}" fill="url(#${uid}-shine)"/><path d="${shape}" fill="url(#${uid}-volume)"/><path d="${shape}" fill="url(#${uid}-softbox)"/><path d="M31 64Q30 46 44 42" fill="none" stroke="#fff" stroke-opacity=".33" stroke-width="3" stroke-linecap="round"/>${hat}${visor}<ellipse cx="40" cy="89" rx="7" ry="3.5" fill="${glow[0]}" opacity=".3"/><ellipse cx="91" cy="87" rx="7" ry="3.5" fill="${glow[0]}" opacity=".22"/>${eyes}${prop}</g></svg></span></span>`;
  }
  function agentMood(id){
    const s=state.run;if(!s)return ['idle',''];
    if(s.paused)return ['paused','Paused'];
    const job=s.jobs.filter(j=>j.role===id).at(-1);
    if(job&&['running','queued'].includes(job.status))return ['working',id==='pip'?'Searching':id==='programmer'?'Building':id==='auditor'?'Checking':'Thinking'];
    if(s.decision)return ['resting','Resting'];
    if(s.contextChanged&&s.approvals[0])return ['waiting','Review needed'];
    const failed=s.audit?.checks.some(c=>c.status==='fail')||s.artifact?.checks.some(c=>c.status==='fail');
    if(failed&&id!=='chief'&&!(id==='programmer'&&s.fixAuthorized))return ['blocked','Needs a decision'];
    if(job&&['failed','interrupted','cancelled'].includes(job.status))return ['blocked','Request stopped'];
    if(id!=='chief'&&!s.approvals[0])return ['waiting','After your goal'];
    if(['pip','creative'].includes(id)&&s.refs.length&&!s.referenceApproval)return ['waiting','Approve references'];
    if(id==='programmer'&&!s.approvals[1])return ['waiting','After your plan'];
    if(id==='auditor'&&(!s.artifact||s.pending))return ['waiting','After the build'];
    if(id==='programmer'&&s.pending)return ['ready','Files to review'];
    if(s.outputs[id])return ['ready','Reply ready'];
    return ['idle','Ready when you are'];
  }
  function updateMoods(){
    root.querySelectorAll('[data-agent]').forEach(el=>{const [mood]=agentMood(el.dataset.agent);el.dataset.mood=mood;});
    root.querySelectorAll('.iq-station').forEach(el=>{const [mood,label]=agentMood(el.dataset.role);el.dataset.mood=mood;el.querySelector('.iq-station-job').textContent=label;el.setAttribute('aria-label','Open '+roles[el.dataset.role].name+'. '+label);});
    if(state.run&&state.view==='room'){
      const m=mapState(),status=root.querySelector('.map-status');
      const room=root.querySelector('.iq-room');
      if(room)room.dataset.flow=m.gate?'waiting':['complete','offline'].includes(m.tone)?'complete':'moving';
      root.querySelectorAll('.map-edge[data-to]').forEach(el=>el.classList.toggle('is-next',m.role===el.dataset.to));
      root.querySelectorAll('.iq-station').forEach(el=>{el.dataset.next=String(m.role===el.dataset.role);el.dataset.gate=String(m.gate&&m.role===el.dataset.role);if(m.gate&&m.role===el.dataset.role)el.setAttribute('aria-label','Open '+roles[el.dataset.role].name+'. Waiting for your '+(m.tone==='decision'?'decision.':'approval.'));});
      if(status){status.classList.toggle('needs-you',m.gate);status.querySelector('span:nth-child(2)').textContent=m.label;const action=status.querySelector('button');action.dataset.action='go:'+m.target;action.textContent=(m.gate?'Review':'Open')+' →';}
    }
    root.dataset.connected=String(state.engine.connected);
  }
  const button=(label,action,disabled=false,primary=false)=>`<button type="button" class="iq-button ${primary?'primary':''}" data-action="${esc(action)}" ${disabled?'disabled':''}>${esc(label)}</button>`;
  const stored=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const state={projectId:stored('workshop-project',null),view:stored('workshop-view','room'),projects:[],run:null,library:[],saved:[],token:'',engine:{connected:false},loading:true,pending:false,epoch:0,search:'',filter:'fit',drafts:stored('workshop-drafts',{}),form:stored('workshop-forms',{})};
  let toastTimer,polling=false;
  let savedRuns={projectId:null,runs:[],run:null,loading:false,error:''},historyRequest=0;
  const savedLink=!window.WorkshopCloud?new URLSearchParams(location.search):null;
  if(savedLink?.get('history')){state.projectId=savedLink.get('project')||state.projectId;state.view='history';}
  async function loadHistory(cycle){
    const id=state.projectId,request=++historyRequest;savedRuns={projectId:id,runs:[],run:null,loading:true,error:''};render();
    try{const list=await api('/api/project/'+encodeURIComponent(id)+'/history');if(request!==historyRequest||state.projectId!==id)return;
      const selected=cycle||list.runs.find(r=>r.hasPrototype)?.cycle||list.runs[0]?.cycle;
      const detail=selected?await api('/api/project/'+encodeURIComponent(id)+'/history/'+encodeURIComponent(selected)):null;
      if(request!==historyRequest||state.projectId!==id)return;savedRuns={projectId:id,runs:list.runs,run:detail?.run||null,loading:false,error:''};
    }catch(error){if(request!==historyRequest||state.projectId!==id)return;savedRuns={projectId:id,runs:[],run:null,loading:false,error:error.message};}
    if(state.view==='history')render();
  }
  function history(){
    const data=savedRuns.projectId===state.projectId?savedRuns:null,s=data?.run;
    if(!data||data.loading)return '<section class="iq-pane">Opening saved runs…</section>';
    if(data.error)return '<section class="iq-pane"><p>'+esc(data.error)+'</p>'+button('Retry saved runs','history-refresh')+'</section>';
    const date=value=>value?new Date(value).toLocaleString():'Not recorded';
    const choose='<section class="iq-pane saved-run-tools"><div><h2>Saved run</h2><p>Read only. No agents will run.</p></div><label>Choose a run<select id="saved-run-cycle">'+data.runs.map(r=>'<option value="'+esc(r.cycle)+'" '+(r.cycle===s?.cycle?'selected':'')+'>'+esc(date(r.at)+' · '+(r.hasPrototype?'Prototype · ':'')+(r.goal||'Untitled run').slice(0,95))+'</option>').join('')+'</select></label></section>';
    if(!s)return choose+'<section class="iq-pane">No saved runs yet.</section>';
    const approvals=['Goal','Plan','Prototype','Human check','Decide'].map((name,i)=>{const a=s.approvals[i];return '<div class="saved-approval"><strong>'+name+'</strong><span>'+esc(a?date(a.at):'Not approved')+'</span><p>'+esc(a?.note||'')+'</p></div>';}).join('');
    const replies=Object.entries(roles).map(([role,r])=>'<details class="saved-agent"><summary>'+esc(r.name)+' <span>'+((s.messages[role]||[]).filter(m=>m.role==='assistant').length)+' replies</span></summary><div class="conversation">'+(s.messages[role]||[]).map(m=>'<article class="message '+(m.role==='user'?'user':'assistant')+'"><strong class="speaker">'+esc(m.role==='user'?'You':r.name)+'</strong><div class="message-text">'+esc(m.text)+'</div></article>').join('')+(!s.messages[role]?.length?'<p>No conversation recorded.</p>':'')+'</div></details>').join('');
    const prototype=s.artifact?'<section class="iq-pane"><h2>Saved prototype</h2><iframe class="prototype" title="Saved run prototype" sandbox="allow-scripts" src="/prototype/'+encodeURIComponent(s.id)+'/'+s.cycle+'/'+s.artifact.id+'/index.html"></iframe></section>':'';
    return choose+'<section class="iq-pane"><h2>'+esc(s.goal||'Saved project run')+'</h2><details class="saved-plan"><summary>Plan and small test</summary><h3>Direction</h3><p>'+esc(s.direction)+'</p><h3>Route</h3><p>'+esc(s.route)+'</p><h3>Test</h3><p>'+esc(s.test)+'</p></details></section><section class="iq-pane"><h2>Recorded approvals · '+s.approvals.filter(Boolean).length+'/5</h2><div class="saved-approvals">'+approvals+'</div></section><section class="iq-pane"><h2>Agent replies</h2>'+replies+'</section>'+prototype+'<section class="iq-pane"><details><summary>Full timeline</summary><ol class="history">'+s.events.map(e=>'<li><time>'+esc(date(e.at))+'</time> '+esc(e.text)+'</li>').join('')+'</ol></details></section>';
  }
  const project=()=>state.projects.find(p=>p.id===state.projectId);
  const running=()=>state.run?.jobs.find(j=>j.status==='running'||j.status==='queued');
  const count=()=>state.run?.approvals.filter(Boolean).length||0;
  const busy=()=>state.pending||!!running();
  function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,6000);}
  function persist(){try{localStorage.setItem('workshop-project',JSON.stringify(state.projectId));localStorage.setItem('workshop-view',JSON.stringify(state.view));localStorage.setItem('workshop-drafts',JSON.stringify(state.drafts));localStorage.setItem('workshop-forms',JSON.stringify(state.form));}catch{toast('Browser draft storage is full. Save your draft before leaving.');}}
  async function api(url,body){const res=await fetch(url,{method:body?'POST':'GET',headers:body?{'content-type':'application/json','x-workshop-token':state.token}:{},...(body?{body:JSON.stringify(body)}:{})});const data=await res.json();if(!res.ok)throw Error(data.error||'Could not complete the request.');return data;}
  function stash(){if(!state.run)return;const key=state.projectId+'|'+state.view;const input=$('#prompt');if(input)state.drafts[key]=input.value;const form=state.form[state.projectId]||={};for(const id of ['goal','direction','route','small-test','review-notes'])if($('#'+id))form[id]=$('#'+id).value;persist();}
  async function loadProject(id){stash();const epoch=++state.epoch;state.projectId=id;state.loading=true;state.run=null;persist();render();try{const result=await api('/api/project/'+encodeURIComponent(id));if(epoch!==state.epoch)return;state.run=result.run;state.projects=state.projects.map(p=>p.id===id?result.project:p);state.loading=false;render();syncSuite();if(state.view==='history')void loadHistory(savedLink?.get('project')===id?savedLink.get('history'):undefined);}catch(e){if(epoch===state.epoch){state.loading=false;$('#content').innerHTML=`<section class="iq-pane"><p>${esc(e.message)}</p>${button('Retry','reload',false,true)}</section>`;}}}
  function go(view){stash();state.view=view;persist();render();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('#content').animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.75,.25,1)'});$('#title').focus({preventScroll:true});}
  async function change(action,extra={},endpoint='action'){
    const id=state.projectId,epoch=state.epoch;state.pending=true;renderChrome();
    try{const data=await api('/api/project/'+encodeURIComponent(id)+'/'+endpoint,{action,revision:state.run.revision,...extra});if(state.epoch===epoch&&data.run){state.run=data.run;}return data;}
    catch(e){toast(e.message);if(state.epoch===epoch){const data=await api('/api/project/'+encodeURIComponent(id)).catch(()=>null);if(data){stash();state.run=data.run;render();}}return null;}
    finally{state.pending=false;if(state.epoch===epoch)render();else renderChrome();}
  }
  function next(){const s=state.run;if(s.paused)return ['review','Run paused'];if(s.contextChanged&&s.approvals[0])return ['review','Review changed context'];if(s.decision)return ['review','Open the decision'];if(s.audit?.checks.some(c=>c.status==='fail')||s.artifact?.checks.some(c=>c.status==='fail'))return ['auditor',s.fixAuthorized?'Open requested fix':'Review the failed check'];if(!s.approvals[0])return ['chief','Set your goal'];if(!s.direction)return ['creative','Meet your Designer'];if(!s.approvals[1])return ['tech','Review the route'];if(!s.artifact||s.pending)return ['programmer','Open the build bench'];if(!s.approvals[2])return ['review','Review the prototype'];if(!s.audit)return ['auditor','Ask for an audit'];return ['review','Your final review'];}
  function packet(){const p=project(),s=state.run;return `<aside class="iq-packet"><details><summary>Project context</summary><div><span class="iq-label">Goal</span><p>${esc(s.goal||p.goal)}</p></div>${s.direction?`<div><span class="iq-label">Direction</span><p>${esc(s.direction)}</p></div>`:''}${s.refs.length?`<p>${s.refs.length} references selected</p>`:''}<a href="${esc(p.obsidianUrl)}">Project note ↗</a><details><summary>Original workflow</summary><p>${p.gates.known?p.gates.approved+'/'+p.gates.total+' historical gates':'No class gate record'}</p><p>${esc(p.next)}</p><span class="iq-note">This workspace uses a new cycle for new work.</span></details></details></aside>`;}
  function workstation(id){
    const uid='desk-'+id,tones={chief:['#b5cbb9','#597565'],creative:['#f2c3af','#ad7781'],tech:['#e5cb8c','#9f8050'],pip:['#cbb9f0','#8675a9'],programmer:['#b3d9e3','#608998'],auditor:['#c3d6ad','#749780']},c=tones[id];
    const objects={
      chief:`<g class="desk-detail"><path d="m43 41 25-9 30 9-25 10Z" fill="#e6e7d7"/><path d="m52 41 13-5m-5 9 17-6" stroke="#7e9685" stroke-width="2"/><circle cx="94" cy="46" r="4" fill="#d9bd83"/></g>`,
      creative:`<g class="desk-detail"><path d="m39 41 23-8 27 9-23 8Z" fill="#f5e5d3"/><path d="m49 41 12-4 11 4-11 4Z" fill="#c79ca3"/><path d="m80 47 17-7 7 3-17 7Z" fill="#98bdc6"/><path d="m84 51 17-7 6 3-17 7Z" fill="#e0bc79"/><path d="m92 32 14-5" stroke="#e8cf9f" stroke-width="3" stroke-linecap="round"/></g>`,
      tech:`<g class="desk-detail"><path d="m40 39 13-5 13 5-13 5Z" fill="#f1dbab"/><path d="M40 39v11l13 5V44m0 0 13-5v11l-13 5" fill="#b99762"/><path d="m85 38 13-5 13 5-13 5Z" fill="#dfd6b1"/><path d="M85 38v11l13 5V43m0 0 13-5v11l-13 5" fill="#a39b78"/><path class="desk-signal" d="m66 47 10 4 9-4" fill="none" stroke="#e4cca2" stroke-width="2" stroke-dasharray="3 3"/></g>`,
      pip:`<g class="desk-detail"><path d="m37 43 3-27 22 5-3 27Z" fill="#b7cfe1" stroke="#edf2ff" stroke-opacity=".4"/><path d="m44 34 7-6 6 10" fill="#839eb9"/><path d="m86 45 3-30 24 5-3 30Z" fill="#d6b8c9" stroke="#fff0fb" stroke-opacity=".4"/><circle cx="101" cy="29" r="5" fill="#f2dbc0"/><path d="m63 52 15-5 13 5-15 5Z" fill="#b9cba9"/></g>`,
      programmer:`<g class="desk-detail"><path d="m38 43 1-24 29 6-1 24Z" fill="#416578" stroke="#accad5" stroke-width="2"/><path d="m45 29 5 5-5 3" fill="none" stroke="#c8e9d9" stroke-width="2"/><path class="desk-cursor" d="m54 38 6 1" stroke="#c8e9d9" stroke-width="2"/><path d="m75 48 20-6 15 5-20 6Z" fill="#a1bbc4"/><path d="m83 48 12-3" stroke="#617f8c" stroke-width="2"/></g>`,
      auditor:`<g class="desk-detail"><path d="m38 44 23-9 25 9-23 9Z" fill="#e2e6cd"/><path d="m48 43 3 2 5-5m3 7 3 2 5-5" fill="none" stroke="#7e9c7b" stroke-width="2"/><g class="desk-lens"><ellipse cx="99" cy="35" rx="10" ry="7" fill="#cee7d9" fill-opacity=".35" stroke="#c8bc8f" stroke-width="3"/><path d="m105 40 8 7" stroke="#c8bc8f" stroke-width="4" stroke-linecap="round"/></g></g>`
    };
    return `<span class="agent-workstation" aria-hidden="true"><svg viewBox="0 0 150 90"><defs><linearGradient id="${uid}-top" x2=".8" y2="1"><stop stop-color="${c[0]}" stop-opacity=".85"/><stop offset="1" stop-color="${c[1]}" stop-opacity=".72"/></linearGradient><linearGradient id="${uid}-edge" x2="0" y2="1"><stop stop-color="${c[1]}"/><stop offset="1" stop-color="${c[1]}" stop-opacity=".45"/></linearGradient></defs><ellipse cx="75" cy="77" rx="58" ry="7" fill="#05150e" opacity=".12"/><path d="M16 42 75 23l59 19v13q0 4-5 6L81 77q-6 2-12 0L21 61q-5-2-5-6Z" fill="url(#${uid}-edge)"/><path d="m19 39 50-17q6-2 12 0l50 17q7 3 0 6L81 62q-6 2-12 0L19 45q-7-3 0-6Z" fill="url(#${uid}-top)" stroke="${c[0]}" stroke-opacity=".65"/><path d="m23 45 47 16q5 2 10 0l47-16" fill="none" stroke="#fff" stroke-opacity=".22"/>${objects[id]}<circle class="desk-state-light" cx="75" cy="70" r="2.4" fill="${c[0]}"/></svg></span>`;
  }
  function mapState(){
    const s=state.run,j=running(),fallback=next();
    if(window.WorkshopCloud&&!window.WorkshopCloud.online)return {role:null,label:'Connect your PC',tone:'offline',note:'Start Workshop on your PC, then connect.',action:'Connect PC',target:'connection',gate:false};
    if(j)return {role:j.role,label:roles[j.role].name+' is working',tone:'working',note:'',action:'Open agent',gate:false,target:j.role};
    if(s.paused)return {role:null,label:'This run is paused',tone:'paused',note:'Resume when you’re ready.',action:'Resume run',actionId:'resume',gate:true,target:'review'};
    if(s.contextChanged&&s.approvals[0])return {role:null,label:'Review the changed project',tone:'approval',note:'The saved plan needs your review before work continues.',action:'Revisit plan',actionId:'confirm-revisit',gate:true,target:'review'};
    if(s.decision)return {role:null,label:'This cycle is complete',tone:'complete',note:'',action:'View decision',gate:false,target:'review'};
    if(s.pending)return {role:'programmer',label:'Review the proposed files',tone:'approval',note:'Files stay staged until you approve applying them.',action:'Review files',gate:true,target:'programmer'};
    const failed=s.audit?.checks.some(c=>c.status==='fail')||s.artifact?.checks.some(c=>c.status==='fail');
    if(failed)return s.fixAuthorized?{role:'programmer',label:'Fix the failed check',tone:'next',note:'',action:'Open Programmer',gate:false,target:'programmer'}:{role:'auditor',label:'A required check failed',tone:'decision',note:'Choose a fix or revisit the plan before continuing.',action:'Review failure',gate:true,target:'auditor'};
    if(!s.approvals[0]&&s.goal)return {role:'chief',label:'Approve your goal',tone:'approval',note:'The team waits until you approve this goal.',action:'Review goal',gate:true,target:'chief'};
    if(s.approvals[0]&&s.refs.length&&!s.referenceApproval&&!s.approvals[1])return {role:'pip',label:'Choose the references to hand off',tone:'approval',note:'Creative Partner receives only the references you approve.',action:'Review references',gate:true,target:'pip'};
    if(s.approvals[0]&&!s.approvals[1]&&s.direction&&s.route&&s.test)return {role:'tech',label:'Approve the plan and small test',tone:'approval',note:'Building stays blocked until you approve the scope.',action:'Review plan',gate:true,target:'review'};
    if(s.artifact&&!s.approvals[2])return {role:'programmer',label:'Review the prototype',tone:'approval',note:'Try it before accepting this version.',action:'Review prototype',gate:true,target:'review'};
    if(s.audit&&!s.approvals[3])return {role:'auditor',label:'Record your checks',tone:'approval',note:'Confirm what you tried and what happened.',action:'Review checks',gate:true,target:'review'};
    if(s.approvals[3])return {role:'auditor',label:'Finish or continue this cycle',tone:'decision',note:'The next cycle is your choice.',action:'Make your decision',gate:true,target:'review'};
    const actions={chief:['Set your goal','Set goal'],creative:['Choose a design direction','Open Designer'],tech:['Choose a route and small test','Open Technologist'],programmer:['Build the approved prototype','Open Programmer'],auditor:['Check the prototype','Open Auditor'],review:['Review this cycle','Open review']},step=actions[fallback[0]]||[fallback[1],'Open'];
    return {role:fallback[0],label:step[0],tone:'next',note:'',action:step[1],gate:false,target:fallback[0]};
  }
  function renderWorkflowFocus(){
    const m=mapState(),labels={next:'Next step',working:'Working',approval:'Waiting for your approval',decision:'Waiting for your decision',paused:'Paused',complete:'Complete',offline:'PC disconnected'},focus=$('#workflow-focus');
    root.dataset.focus=m.tone;root.dataset.view=state.view;
    const action=m.actionId||(m.target==='connection'?'connect-pc':'go:'+m.target),showAction=!!m.actionId||m.target!==state.view||m.target==='connection';
    const html='<div class="focus-copy"><span class="focus-label"><span class="focus-dot" aria-hidden="true"></span>'+labels[m.tone]+'</span><h2>'+esc(m.label)+'</h2>'+(m.note?'<p>'+esc(m.note)+'</p>':'')+'</div><div class="focus-actions">'+(showAction?button(m.action,action,state.pending,true):'')+(m.tone==='working'?button('Stop','cancel',state.pending):'')+'</div>';
    if(focus.innerHTML!==html)focus.innerHTML=html;
    focus.dataset.tone=m.tone;$('#progress-label').textContent='Progress '+count()+'/5';
    root.querySelectorAll('.iq-nav [data-action]').forEach(el=>{const attention=m.gate&&el.dataset.action==='go:'+m.target;el.classList.toggle('needs-approval',attention);if(attention)el.setAttribute('aria-label',el.textContent.trim()+': waiting for your review');});
  }

  function workflowMap(m){
    const edge=(to,d)=>`<path class="map-edge ${m.role===to?'is-next':''}" data-to="${to}" d="${d}" marker-end="url(#route-arrow)"/>`;
    return `
    <svg class="workflow-routes desktop-routes" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="route-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="m2 1 6 4-6 4" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker></defs>${edge('creative','M300 174H390')}${edge('tech','M610 174H700')}${edge('programmer','M810 287V291Q810 302 799 302H625Q610 302 610 317V375Q610 390 595 390H580')}${edge('auditor','M610 447H700')}<path class="map-edge reference-route" d="M190 334V310Q190 298 202 298H350Q365 298 365 283V254" marker-end="url(#route-arrow)"/></svg>
    <svg class="workflow-routes mobile-routes" viewBox="0 0 300 720" preserveAspectRatio="none" aria-hidden="true">${edge('creative','M133 158H167')}${edge('tech','M222 250V252Q222 258 210 258H90Q78 258 78 270V280')}${edge('programmer','M78 463V479')}${edge('auditor','M133 583H167')}<path class="map-edge reference-route" d="M222 280V250" marker-end="url(#route-arrow)"/></svg>
    `;
  }
  function room(){const s=state.run,n=next(),m=mapState();return `<div class="iq-room" data-flow="${m.gate?'waiting':['complete','offline'].includes(m.tone)?'complete':'moving'}" aria-label="Your agent workshop">${workflowMap(m)}${Object.keys(roles).map(id=>`<button class="iq-station" data-next="${m.role===id}" data-gate="${m.gate&&m.role===id}" data-role="${id}" data-action="go:${id}" aria-label="Open ${roles[id].name}"><span class="map-node-label">${m.role===id?(m.gate?'Your approval':running()?'Working':'Up next'):{chief:'01 · Goal',creative:'02 · Direction',tech:'03 · Plan',pip:'References',programmer:'04 · Build',auditor:'05 · Check'}[id]}</span>${workstation(id)}${person(id)}<span class="iq-station-name">${id==='creative'?'Designer':id==='tech'?'Architect':id==='pip'?'Pip (Design Shelf)':roles[id].name}</span><span class="iq-station-job">${id==='creative'?'Creative Partner':id==='tech'?'Technologist':roles[id].job}</span></button>`).join('')}</div><details class="room-context"><summary>Project context</summary><p>${esc(s.goal||project().goal)}</p><a href="${esc(project().obsidianUrl)}">Open project note ↗</a></details>`;}
  function transcript(role){const messages=state.run.messages[role]||[];return `<div class="conversation" aria-label="Conversation with ${roles[role].name}">${messages.slice(-8).map(m=>`<article class="message ${m.role}"><span class="speaker">${m.role==='user'?'You':roles[role].name}</span><div class="message-text">${esc(m.text)}</div></article>`).join('')}</div>`;}
  function chat(role){const s=state.run,j=running(),failed=s.audit?.checks.some(c=>c.status==='fail')||s.artifact?.checks.some(c=>c.status==='fail');let reason='';if(s.paused)reason='This run is paused.';else if(s.decision)reason='Start a new cycle to continue.';else if(s.contextChanged&&s.approvals[0])reason='Review the changed project context first.';else if(role!=='chief'&&!s.approvals[0])reason='Approve your goal with Chief of Staff first.';else if(failed&&role!=='chief'&&!(role==='programmer'&&s.fixAuthorized))reason='A required check failed. Choose what happens next.';else if(role==='programmer'&&!s.approvals[1])reason='Approve your direction, route, and small test first.';else if(role==='auditor'&&(!s.artifact||s.pending))reason='Apply the current prototype before the audit.';
    const suggestions={chief:'Help me define a small next step for this project.',creative:'Suggest two directions for this goal. Keep it useful and playful.',tech:'Compare practical routes and a small test for the main risk.',pip:'Find a few useful references for this project. Check the original sources.',programmer:s.fixAuthorized?'Fix the failed checks while preserving the approved scope.':'Build the approved small prototype.',auditor:'Audit this prototype against the approved goal and small test.'};
    const value=state.drafts[state.projectId+'|'+role]??s.drafts[role]??'';
    const last=s.jobs.filter(x=>x.role===role).at(-1),failedJob=last&&['failed','interrupted','cancelled'].includes(last.status);
    return `${transcript(role)}${failedJob?`<div class="alert" role="alert"><span>${esc(last.error||'This request was stopped.')}</span>${button('Retry request','retry',!!reason||busy())}</div>`:''}${reason?`<div class="iq-gate-block">${esc(reason)}</div>`:''}${j?`<div class="job"><span class="working-dot"></span><span>${roles[j.role].name} · ${esc(j.progress||'Thinking')}</span>${button('Stop','cancel')}</div>`:''}<form id="chat-form"><label class="sr-only" for="prompt">Message ${roles[role].name}</label><textarea id="prompt" rows="3" maxlength="6000" placeholder="${esc(suggestions[role])}" ${reason?'disabled':''}>${esc(value)}</textarea><div class="chat-actions">${state.engine.connected?'':'<span class="iq-note">Connect agents to send a request</span>'}${button('Save draft','save-draft',!!reason||busy())}<button class="iq-button primary" type="submit" ${reason||busy()?'disabled':''}>Send to ${roles[role].name}</button></div></form>`;}
  function options(role){const o=state.run.outputs[role];if(!o)return '';const field=role==='creative'?'direction':'route';return `<div class="iq-choices">${o.options.map((x,i)=>`<button class="iq-choice" data-action="choose:${role}:${i}" ${state.run.approvals[1]?'disabled':''}><strong>${esc(x.title)}</strong><p>${esc(x.detail)}</p>${x.test?`<small>Test: ${esc(x.test)}</small>`:''}</button>`).join('')}</div>${sources(o)}`;}
  function sources(o){return o.sources.length?`<div class="sources">${o.sources.map((x,i)=>`<article><a href="${esc(x.url)}" target="_blank" rel="noreferrer noopener">${esc(x.title)} ↗</a><p>${esc(x.reason)}</p>${state.view==='pip'?button('Add to Shelf','import:'+i):''}</article>`).join('')}</div>`:'';}
  function field(id,label,value,rows=3){return `<label class="form-field">${label}<textarea id="${id}" rows="${rows}" maxlength="6000" ${id!=='review-notes'&&state.run.approvals[1]?'readonly':''}>${esc(state.form[state.projectId]?.[id]??value??'')}</textarea></label>`;}
  function chief(){const s=state.run;return `<div class="iq-split"><section class="iq-pane"><div class="iq-subhead">${person('chief')}<h3>Set your goal</h3></div><label class="form-field">This cycle’s goal<textarea id="goal" rows="3" maxlength="6000" ${s.approvals[0]?'readonly':''}>${esc(state.form[state.projectId]?.goal??s.goal)}</textarea></label><div class="iq-actions">${!s.approvals[0]?button('Save goal','save-goal',busy())+button('Approve goal','approve:0',busy(),true):button('Meet your Designer →','go:creative',false,true)}</div>${chat('chief')}</section>${packet()}</div>`;}
  function creative(){const s=state.run;return `<div class="iq-split"><section class="iq-pane"><div class="iq-subhead">${person('creative')}<h3>Choose a direction</h3></div>${s.referenceApproval?`<details class="room-context"><summary>${s.referenceApproval.references.length} approved references from Pip (Design Shelf)</summary>${s.referenceApproval.references.map(r=>`<p><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a></p>`).join('')}</details>`:''}${options('creative')}${field('direction','Your direction',s.direction)}<div class="iq-actions">${button('Keep direction','direction',busy()||!!s.approvals[1],true)}${button('Find references','go:pip')}${button('Check feasibility →','go:tech')}</div>${chat('creative')}</section>${packet()}</div>`;}
  function tech(){const s=state.run;return `<div class="iq-split"><section class="iq-pane"><div class="iq-subhead">${person('tech')}<h3>Choose a route</h3></div>${options('tech')}${field('route','Chosen route',s.route)}${field('small-test','Small test and success criteria',s.test)}<div class="iq-actions">${button('Save route + test','route',busy()||!!s.approvals[1])}${!s.approvals[1]?button('Review plan for approval','go:review',!s.direction||!s.route||!s.test,true):button('Open build bench →','go:programmer',false,true)}</div>${chat('tech')}</section>${packet()}</div>`;}
  function fit(r){const p=project();return (r.categories?.some(c=>p.types.includes(c))?5:0)+(r.tags||[]).filter(t=>p.tags.includes(t)).length*2;}
  function referenceCards(){const s=state.run,now=Date.now();const picks=s.outputs.pip?.referenceIds||[];let list=state.library.filter(r=>{if(state.filter==='selected'&&!s.refs.includes(r.id))return false;if(state.filter==='picks'&&!picks.includes(r.id))return false;if(state.filter==='recent'&&(!r.publishedAt||now-new Date(r.publishedAt)>90*86400000))return false;return !state.search||[r.title,r.publisher,...(r.tags||[])].join(' ').toLowerCase().includes(state.search.toLowerCase());}).sort((a,b)=>(picks.includes(b.id)?100:0)+fit(b)-(picks.includes(a.id)?100:0)-fit(a));return list.slice(0,60).map(r=>{const saved=state.saved.some(x=>x.projectId===s.id&&x.referenceId===r.id),chosen=s.refs.includes(r.id);const image=r.preview?.type==='image'?r.preview.url:r.preview?.poster;return `<article class="reference-card"><a class="ref-art" href="${esc(r.url)}" target="_blank" rel="noreferrer noopener">${image?`<img src="${esc(image)}" alt="${esc(r.preview.alt||r.title)}" loading="lazy" referrerpolicy="no-referrer">`:''}<span>${esc(r.publisher)}</span></a><div class="ref-copy"><small>${esc(r.publisher)} · ${esc(r.publishedAt||'Undated')}</small><a href="${esc(r.url)}" target="_blank" rel="noreferrer noopener"><h3>${esc(r.title)}</h3></a><p>${esc((r.summary||'').slice(0,180))}</p><div class="ref-actions"><button class="iq-button ${chosen?'primary':''}" data-ref="${esc(r.id)}" ${s.approvals[1]?'disabled':''} aria-pressed="${chosen}">${chosen?'Shortlisted':'Shortlist'}</button><button class="iq-button" data-save="${esc(r.id)}" aria-pressed="${saved}">${saved?'Saved':'Save'}</button></div></div></article>`;}).join('')||'<p>No references match. Ask Pip (Design Shelf) for a specific search.</p>';}
  function referenceReview(){const s=state.run;return `<section class="iq-pane"><h3>${s.referenceApproval?'References approved':'Your reference shortlist'}</h3>${s.refs.length?`<ul>${s.refs.map(id=>{const r=state.library.find(r=>r.id===id);return `<li><a href="${esc(r?.url||'#')}" target="_blank" rel="noopener noreferrer">${esc(r?.title||id)}</a></li>`;}).join('')}</ul>`:'<p>Shortlist a few references, then approve what Creative Partner can use.</p>'}<div class="iq-actions">${button(s.referenceApproval?'Open Creative Partner →':'Approve references & hand off','handoff-refs',busy()||!s.refs.length||(!s.referenceApproval&&(!s.approvals[0]||!!s.approvals[1])),true)}</div></section>`;}
  function pip(){return `<section class="iq-pane shelf-head"><div class="iq-subhead">${person('pip')}<div><h3>Find references</h3><button type="button" class="shelf-full-link" data-action="full-shelf">Open full Design Shelf</button></div></div><div class="shelf-controls"><label><span class="sr-only">Search references</span><input id="search" type="search" placeholder="Find an interaction, style, or source…" value="${esc(state.search)}"></label><select id="reference-filter" aria-label="Reference view"><option value="fit" ${state.filter==='fit'?'selected':''}>Best fit</option><option value="picks" ${state.filter==='picks'?'selected':''}>Picks from Pip (Design Shelf)</option><option value="recent" ${state.filter==='recent'?'selected':''}>Last 90 days</option><option value="selected" ${state.filter==='selected'?'selected':''}>Selected</option></select>${button('Ask Pip (Design Shelf)','ask-pip',false,true)}${button('Refresh collection','refresh-library')}${button('Review shortlist','review-refs',!state.run.refs.length)}</div></section>${referenceReview()}<div id="reference-grid" class="reference-grid">${referenceCards()}</div><section class="iq-pane pip-chat">${state.run.outputs.pip?sources(state.run.outputs.pip):''}${chat('pip')}</section>`;}
  function checkRows(checks){return checks.map(c=>`<div class="check-row"><div><strong>${esc(c.name)}</strong><p>${esc(c.evidence)}</p></div><span class="check-status ${c.status}">${c.status==='unknown'?'Needs your check':c.status==='pass'?'Pass':'Failed'}</span></div>`).join('');}
  function preview(){const s=state.run;if(!s.artifact)return '';return `<iframe class="prototype" title="${esc(project().title)} prototype" sandbox="allow-scripts" src="/prototype/${encodeURIComponent(s.id)}/${s.cycle}/${s.artifact.id}/index.html"></iframe>`;}
  function programmer(){const s=state.run;return `<div class="iq-split"><section class="iq-pane"><div class="iq-subhead">${person('programmer')}<div><h3>Build the prototype</h3></div></div>${s.pending?`<div class="proposal"><h3>Ready to inspect</h3>${s.pending.files.map(f=>`<details><summary>${esc(f.path)} · ${f.content.length.toLocaleString()} characters</summary><pre>${esc(f.content)}</pre></details>`).join('')}${checkRows(s.pending.checks)}${button('Apply reviewed prototype','apply',busy(),true)}</div>`:''}${preview()}${s.artifact?`<div class="iq-actions">${button('Review prototype','go:review',false,true)}${button('Ask Auditor →','go:auditor')}</div>`:''}${chat('programmer')}</section>${packet()}</div>`;}
  function auditor(){const s=state.run,checks=s.audit?.checks||s.artifact?.checks||[],failed=checks.some(c=>c.status==='fail');return `<div class="iq-split"><section class="iq-pane"><div class="iq-subhead">${person('auditor')}<h3>Check the prototype</h3></div>${checks.length?checkRows(checks):'<p>The audit starts with the applied prototype.</p>'}${failed?`<div class="iq-gate-block">A required check failed. Work pauses for your choice.</div><div class="iq-actions">${button(s.fixAuthorized?'Open requested fix':'Request a fix',s.fixAuthorized?'go:programmer':'request-fix',busy(),true)}${button('Revisit plan','confirm-revisit',busy())}</div>`:button('Your review →','go:review')}${chat('auditor')}</section>${packet()}</div>`;}
  function review(){const s=state.run,gate=s.approvals.findIndex(x=>!x),unknown=s.audit?.checks.filter(c=>c.status==='unknown')||[];const names=['Goal','Route','Prototype','Human check','Decide'];let action='';
    if(s.decision)action=`<p>You chose to ${esc(s.decision)} this pass.</p>${button('Start a fresh cycle','confirm-new',busy(),true)}`;
    else if(gate===0)action=button(s.goal?'Review goal':'Set goal','go:chief',false,true);
    else if(gate===1)action=`<h3>Plan</h3><dl class="plan"><dt>Goal</dt><dd>${esc(s.goal)}</dd><dt>Direction</dt><dd>${esc(s.direction||'Not chosen')}</dd><dt>Route</dt><dd>${esc(s.route||'Not chosen')}</dd><dt>Small test</dt><dd>${esc(s.test||'Not set')}</dd><dt>References</dt><dd>${s.refs.map(id=>esc(state.library.find(r=>r.id===id)?.title||id)).join(', ')||'None selected'}</dd></dl><p class="iq-note">Applies to this cycle’s browser prototype.</p>${button('Approve plan + small test','approve:1',busy()||!s.direction||!s.route||!s.test,true)}`;
    else if(gate===2)action=s.artifact&&!s.pending?`${preview()}${button('Accept this prototype','approve:2',busy()||s.artifact.checks.some(c=>c.status==='fail'),true)}`:button('Open build bench','go:programmer',false,true);
    else if(gate===3)action=!s.audit?button('Ask Auditor first','go:auditor',false,true):s.audit.checks.some(c=>c.status==='fail')?`<p>A required check failed.</p>${button('Review the failure','go:auditor',false,true)}`:`${checkRows(s.audit.checks)}<div class="human-check">${unknown.map((c,i)=>`<label class="ack"><input type="checkbox" name="check" value="${esc(c.name)}"> I checked: ${esc(c.name)}</label>`).join('')}${field('review-notes','What did you try, and what happened?',state.form[state.projectId]?.['review-notes']||'')}<button class="iq-button primary" data-action="approve:3" ${busy()?'disabled':''}>Accept human check</button></div>`;
    else action=`<p>Choose what happens to this pass.</p><div class="iq-actions">${button('Continue in a new cycle','decide:continue',busy(),true)}${button('Finish this pass','decide:stop',busy())}</div>`;
    return `<section class="iq-pane"><div class="review-action">${action}</div><details class="review-details"><summary>Approval record · ${count()}/5</summary><div class="approval-list">${names.map((name,i)=>`<div class="iq-review-row"><span class="iq-review-mark ${s.approvals[i]?'iq-reviewed':''}">${s.approvals[i]?'✓':i+1}</span><div><strong>${name}</strong><span class="iq-note">${esc(s.approvals[i]?.note||'')}</span></div></div>`).join('')}</div></details><details class="review-details"><summary>Run controls</summary><div class="iq-actions">${!s.decision?button(s.paused?'Resume run':'Pause run',s.paused?'resume':'pause',busy()):''}${s.approvals[0]&&!s.decision?button('Revisit plan','confirm-revisit',busy()):''}</div></details><details class="review-details"><summary>Run history</summary><ol class="history">${s.events.map(e=>`<li><time>${esc(new Date(e.at).toLocaleString())}</time> ${esc(e.text)}</li>`).join('')}</ol><p class="iq-note">${esc(s.journalPath)}</p></details></section>`;}
  function renderChrome(){updateMoods();if(state.run)renderWorkflowFocus();const s=state.run;$('#connection').textContent=state.engine.connected?'Agents connected':'Connect agents';$('#connection').disabled=state.pending;$('#project').value=state.projectId||'';if(!s)return;$('#gate-count').textContent='';$('#footer').textContent='Saved locally';const active=s.approvals.findIndex(x=>!x);$('.iq-journey').innerHTML=['Goal','Route','Prototype','Check','Decide'].map((label,i)=>`<span class="iq-step ${s.approvals[i]?'done':i===active?'active':''}"><span class="iq-step-num">${s.approvals[i]?'✓':i+1}</span>${label}</span>`).join('');$('.iq-jar').style.setProperty('--fill',(count()*18+5)+'%');const j=running();$('#alerts').innerHTML='';}
  function render(){
    if(!['room','review','history',...Object.keys(roles)].includes(state.view))state.view='room';
    $('.iq-nav').innerHTML=`<button data-action="go:room" class="iq-nav-home" aria-pressed="${state.view==='room'}"><span class="role-glass-icon">${glassIcon('grid')}</span><span>Workshop</span></button><button data-action="go:review" aria-pressed="${state.view==='review'}"><span class="role-glass-icon">${glassIcon('check')}</span><span>Your review</span></button><details class="agent-nav" ${roles[state.view]?'open':''}><summary>Agents</summary>${Object.entries(roles).map(([id,r])=>`<button data-action="go:${id}" aria-pressed="${state.view===id}">${person(id,true)}<span>${id==='pip'?'Pip (Design Shelf)':id==='creative'?'Designer':r.name}</span></button>`).join('')}</details>`;
    if(state.loading||!state.run){$('#workflow-focus').replaceChildren();$('#progress-label').textContent='Progress';$('#content').innerHTML='<div class="iq-pane loading">Opening your project…</div>';return;}
    if(!window.WorkshopCloud)$('.iq-nav').insertAdjacentHTML('beforeend','<button data-action="open-history" aria-pressed="'+(state.view==='history')+'"><span class="role-glass-icon">'+glassIcon('archive')+'</span><span>Saved runs</span></button>');
    $('#eyebrow').textContent=project().title;$('#title').textContent=state.view==='room'?'Workshop':state.view==='review'?'Your review':state.view==='history'?'Saved runs':roles[state.view].name;
    $('#content').innerHTML=({room,chief,creative,tech,pip,programmer,auditor,review,history}[state.view])();renderChrome();
    $('#content').querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.remove();},{once:true}));
  }
  function dialog(kind){const d=document.createElement('dialog');d.className='confirm-dialog';d.innerHTML=`<h2>${kind==='new'?'Start a fresh cycle?':'Revisit this plan?'}</h2><p>The earlier run stays in your history. This cycle’s approvals will reset so you can change the goal or plan.</p><div class="iq-actions"><button class="iq-button" data-dismiss>Keep working</button><button class="iq-button primary" data-confirm>${kind==='new'?'Start new cycle':'Revisit plan'}</button></div>`;root.append(d);d.querySelector('[data-dismiss]').onclick=()=>d.close();d.addEventListener('close',()=>d.remove());d.querySelector('[data-confirm]').onclick=async()=>{d.close();const result=await change(kind==='new'?'new-cycle':'revisit');if(result){delete state.form[state.projectId];persist();go('chief');}};d.showModal();}
  root.addEventListener('input',e=>{if(e.target.id==='search'){state.search=e.target.value;$('#reference-grid').innerHTML=referenceCards();return;}stash();});
  root.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled||state.loading)return;
    if(b.dataset.ref){const s=state.run;await change('selection',{field:'refs',refs:s.refs.includes(b.dataset.ref)?s.refs.filter(id=>id!==b.dataset.ref):[...s.refs,b.dataset.ref]});return;}
    if(b.dataset.save){const id=b.dataset.save,saved=state.saved.some(x=>x.referenceId===id&&x.projectId===state.projectId);const result=await change('',{id,saved:!saved},'save-reference');if(result){await loadLibrary();render();}return;}
    const a=b.dataset.action;if(!a)return;
    if(a==='open-history'){go('history');return loadHistory();}
    if(a==='history-refresh')return loadHistory();
    if(a==='connect-pc')return $('#connection').click();
    if(a.startsWith('go:'))return go(a.slice(3));
    stash();
    if(a==='full-shelf')return openSuite('shelf');
    if(a==='review-refs'){state.filter='selected';render();return;}
    if(a==='handoff-refs'){
      if(!state.run.referenceApproval&&!(await change('approve-references')))return;
      state.drafts[state.projectId+'|creative']='Use my approved references to suggest two design directions for this project. Explain what each borrows and what should stay original.';persist();go('creative');return;
    }
    if(a==='reload')return loadProject(state.projectId);
    if(a==='ask-pip'){$('#chat-form').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});$('#prompt').focus({preventScroll:true});return;}
    if(a==='save-goal')return change('goal',{goal:$('#goal').value});
    if(a==='direction')return change('selection',{field:'direction',text:$('#direction').value});
    if(a==='route')return change('selection',{field:'route',text:$('#route').value,test:$('#small-test').value});
    if(a.startsWith('choose:')){const [,role,i]=a.split(':'),o=state.run.outputs[role].options[Number(i)];const form=state.form[state.projectId]||={};form[role==='creative'?'direction':'route']=o.title+': '+o.detail;if(role==='tech')form['small-test']=o.test;persist();return change('selection',{field:role==='creative'?'direction':'route',text:o.title+': '+o.detail,test:o.test});}
    if(a.startsWith('approve:')){const gate=Number(a.split(':')[1]);if(gate===0){const value=$('#goal')?.value||state.run.goal;if(value!==state.run.goal){const result=await change('goal',{goal:value});if(!result)return;}}const note=gate===3?$('#review-notes').value:undefined,acknowledged=gate===3?[...document.querySelectorAll('input[name="check"]:checked')].map(x=>x.value):undefined;await change('approve',{gate,note,acknowledged});return;}
    if(a.startsWith('decide:')){const decision=a.split(':')[1];const result=await change('approve',{gate:4,decision});if(result&&decision==='continue')dialog('new');return;}
    if(a==='apply')return change('',{pendingId:state.run.pending.id},'apply');
    if(a==='cancel')return change('',{jobId:running().id},'cancel');
    if(a==='retry'){const last=state.run.jobs.filter(j=>j.role===state.view).at(-1);if(last)await change('',{role:state.view,prompt:last.prompt},'run');return;}
    if(a==='request-fix'){if(await change(a))go('programmer');return;}
    if(a==='pause'||a==='resume')return change(a);
    if(a==='confirm-revisit')return dialog('revisit');if(a==='confirm-new')return dialog('new');
    if(a==='save-draft'){await change('draft',{role:state.view,text:$('#prompt').value});toast('Draft saved with this project.');return;}
    if(a==='refresh-library'){await loadLibrary();render();toast('Collection refreshed. Ask Pip (Design Shelf) to research new references.');return;}
    if(a.startsWith('import:')){const source=state.run.outputs.pip.sources[Number(a.split(':')[1])];b.disabled=true;const result=await change('',{url:source.url},'import-reference');if(result){await loadLibrary();render();toast('Added to your local Shelf.');}return;}
  });
  root.addEventListener('submit',async e=>{if(e.target.id!=='chat-form')return;e.preventDefault();const input=$('#prompt'),prompt=input.value.trim();if(prompt.length<3)return toast('Write a short request first.');stash();const id=state.projectId,role=state.view;const result=await change('',{role,prompt},'run');if(result){state.drafts[id+'|'+role]='';persist();if(state.projectId===id)render();}});
  $('#project').addEventListener('change',e=>loadProject(e.target.value));
  $('#connection').addEventListener('click',async()=>{state.pending=true;renderChrome();$('#connection').textContent='Connecting…';try{state.engine=await api('/api/connect',{});toast('Agents connected to Codex.');}catch(e){toast(e.message);}finally{state.pending=false;renderChrome();}});
  root.addEventListener('change',e=>{if(e.target.id==='saved-run-cycle')return loadHistory(e.target.value);if(e.target.id==='reference-filter'){state.filter=e.target.value;$('#reference-grid').innerHTML=referenceCards();}});
  let themeMode=localStorage.getItem('workshop-theme')||'system';
  const systemTheme=matchMedia('(prefers-color-scheme: dark)');
  function appearance(){
    const dark=themeMode==='dark'||themeMode==='system'&&systemTheme.matches;
    const mode=dark?'dark':'light';root.dataset.theme=mode;document.documentElement.dataset.theme=mode;root.style.colorScheme=mode;document.documentElement.style.colorScheme=mode;
    $('#theme').innerHTML=glassIcon(dark?'sun':'moon');
    $('#theme').setAttribute('aria-label',dark?'Switch to day mode':'Switch to night mode');$('#theme').title=$('#theme').getAttribute('aria-label');
    try{localStorage.setItem('workshop-theme',themeMode);}catch{}
    syncSuite();
  }
  $('#theme').addEventListener('click',()=>{themeMode=root.style.colorScheme==='dark'?'light':'dark';appearance();});
  systemTheme.addEventListener('change',()=>{if(themeMode==='system')appearance();});
  const suiteApps={ideaquest:{origin:'http://127.0.0.1:4188',name:'idea.quest'},shelf:{origin:'http://127.0.0.1:8917',name:'Design Shelf'}};
  const suiteFrames=new Map();let suiteView='workshop';
  function syncSuite(){
    for(const [id,entry] of suiteFrames)entry.frame.contentWindow?.postMessage({type:'workshop:context',projectId:state.projectId,theme:root.style.colorScheme,active:suiteView===id,project:project(),workflow:state.run?{goal:state.run.goal,direction:state.run.direction,goalApproved:!!state.run.approvals[0],approved:count(),total:5,step:mapState()}:null},suiteApps[id].origin);
  }
  function suiteStatus(){
    const entry=suiteFrames.get(suiteView),el=$('#suite-status');
    el.hidden=!entry||entry.ready&&!entry.error;
    if(!entry)return;
    el.replaceChildren();const copy=document.createElement('span');copy.textContent=entry.error||'Opening '+suiteApps[suiteView].name+'…';el.append(copy);
    if(entry.error){const retry=document.createElement('button');retry.className='iq-button';retry.textContent='Retry';retry.onclick=()=>{entry.error='';entry.ready=false;entry.frame.src=entry.frame.src;suiteStatus();armSuiteTimeout(entry);};el.append(retry);}
  }
  function armSuiteTimeout(entry){clearTimeout(entry.timer);entry.timer=setTimeout(()=>{if(!entry.ready){entry.error='This local app is not responding. Start workshop/start.ps1, then retry.';suiteStatus();}},15000);}
  function openSuite(id){
    if(id!=='workshop'&&!suiteApps[id])return;stash();suiteView=id;root.dataset.app=id;try{sessionStorage.setItem('workshop-app',id);}catch{}
    root.querySelectorAll('[data-app]').forEach(b=>{b.classList.toggle('current',b.dataset.app===id);b.setAttribute('aria-pressed',String(b.dataset.app===id));});
    $('.iq-shell').hidden=id!=='workshop';$('#suite-views').hidden=id==='workshop';
    if(id!=='workshop'&&!suiteFrames.has(id)){
      const frame=document.createElement('iframe');frame.className='suite-frame';frame.title=suiteApps[id].name;frame.src=suiteApps[id].origin+'/?suite=1&project='+encodeURIComponent(state.projectId||'');
      const entry={frame,ready:false,error:'',timer:null};suiteFrames.set(id,entry);frame.addEventListener('load',syncSuite);$('#suite-frames').append(frame);armSuiteTimeout(entry);
    }
    for(const [key,entry] of suiteFrames)entry.frame.hidden=key!==id;
    suiteStatus();syncSuite();if(id==='workshop'){loadLibrary().then(()=>{if(suiteView==='workshop'&&state.view==='pip')render();});}
  }
  root.querySelectorAll('[data-app]').forEach(b=>b.addEventListener('click',()=>openSuite(b.dataset.app)));
  $('.iq-brand').addEventListener('click',event=>{event.preventDefault();openSuite('workshop');go('room');});
  window.addEventListener('message',async event=>{
    const pair=[...suiteFrames].find(([id,e])=>event.origin===suiteApps[id].origin&&event.source===e.frame.contentWindow);if(!pair)return;
    const [id,entry]=pair,data=event.data;if(!data||typeof data!=='object')return;
    if(data.type==='workshop:request'&&id==='shelf'){
      const reply=value=>entry.frame.contentWindow?.postMessage({type:'workshop:response',requestId:data.requestId,...value},suiteApps.shelf.origin);
      try{
        if(!entry.ready||suiteView!=='shelf'||data.projectId!==state.projectId||state.loading)throw Error('Project changed. Try again in the current project.');
        const projectId=state.projectId,epoch=state.epoch;
        const fresh=await api('/api/project/'+encodeURIComponent(projectId));
        if(epoch!==state.epoch)throw Error('Project changed. Try again.');
        state.run=fresh.run;
        let result;
        if(data.action==='pip-status'){
          const output=state.run.outputs.pip;
          result={online:true,goal:state.run.goal||project().goal,blocked:!state.run.approvals[0]?'Approve your goal in Workshop before asking Pip (Design Shelf) to research.':state.run.contextChanged?'Your project note changed. Revisit the plan first.':state.run.paused?'Resume the run in Workshop first.':state.run.decision?'Start a new cycle in Workshop first.':'',jobs:state.run.jobs.filter(j=>j.role==='pip').slice(-6).reverse().map(j=>({...j,projectId,createdAt:j.at,reply:j.error||(output?.id===j.id?output.reply:j.status==='completed'?'Earlier reply is in Workshop.':''),referenceIds:output?.id===j.id?output.referenceIds:[],sources:output?.id===j.id?output.sources:[]}))};
        }else if(data.action==='pip-run'){
          result=await api('/api/project/'+encodeURIComponent(projectId)+'/run',{revision:state.run.revision,role:'pip',prompt:data.prompt});if(epoch===state.epoch)state.run=result.run;
        }else if(data.action==='pip-cancel'){
          const job=state.run.jobs.find(j=>j.id===data.jobId&&j.role==='pip');if(!job)throw Error('Pip (Design Shelf) request not found.');
          result=await api('/api/project/'+encodeURIComponent(projectId)+'/cancel',{jobId:job.id});if(epoch===state.epoch)state.run=result.run;
        }else if(data.action==='import-source'){
          const source=state.run.outputs.pip?.sources?.find(x=>x.url===data.url);if(!source)throw Error('This source is no longer in Pip (Design Shelf)’s latest reply.');
          result=await api('/api/project/'+encodeURIComponent(projectId)+'/import-reference',{url:source.url});await loadLibrary();
        }else if(data.action==='review-board'){
          await loadLibrary();const ids=state.saved.filter(x=>x.projectId===projectId).map(x=>x.referenceId).filter(id=>state.library.some(r=>r.id===id));
          if(epoch!==state.epoch)throw Error('Project changed. Try again.');
          if(!ids.length)throw Error('Save references to this project’s board first.');
          result=await api('/api/project/'+encodeURIComponent(projectId)+'/action',{action:'selection',field:'refs',refs:ids,revision:state.run.revision});if(epoch!==state.epoch)throw Error('Project changed. Open the original project to review its shortlist.');state.run=result.run;state.filter='selected';openSuite('workshop');go('pip');
        }else throw Error('Unknown Shelf action.');
        reply({result});
      }catch(error){reply({error:error.message});}
      return;
    }
    if(data.type==='workshop:open-step'&&id==='ideaquest'){
      if(data.projectId!==state.projectId||!state.run)return;
      const step=mapState();openSuite('workshop');if(step.target==='connection')$('#connection').click();else go(step.target);
      return;
    }
    if(data.type==='workshop:ready'){entry.ready=true;entry.error='';clearTimeout(entry.timer);suiteStatus();syncSuite();}
    if(data.type==='workshop:applied'){entry.error='';suiteStatus();}
    if(data.type==='workshop:missing'){entry.error='This project is not available in '+suiteApps[id].name+'.';suiteStatus();}
    if(data.type==='workshop:selected'&&entry.ready&&id===suiteView&&typeof data.projectId==='string'&&data.projectId!==state.projectId){
      if(!state.projects.some(p=>p.id===data.projectId)){try{const fresh=await api('/api/state');state.projects=fresh.projects;$('#project').innerHTML=state.projects.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');}catch{return;}}
      if(state.projects.some(p=>p.id===data.projectId))await loadProject(data.projectId);
    }
  });
  appearance();
  async function loadLibrary(){try{const data=await api('/api/library');state.library=data.references||[];state.saved=data.saved||[];}catch(e){toast('Shelf: '+e.message);}}
  async function init(){try{const data=await api('/api/state');state.token=data.token;state.projects=data.projects;state.engine=data.engine;$('#project').innerHTML=data.projects.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');if(!data.projects.some(p=>p.id===state.projectId))state.projectId=data.activeProjectId||data.projects[0]?.id;await loadLibrary();if(state.projectId){await loadProject(state.projectId);let savedView;try{savedView=sessionStorage.getItem('workshop-app');}catch{}if(suiteApps[savedView])openSuite(savedView);}else{state.loading=false;$('#content').textContent='No project summaries are connected.';}}catch(e){$('#content').innerHTML=`<section class="iq-pane"><p>${esc(e.message)}</p><a href="/">Reload workshop</a></section>`;}}
  setInterval(async()=>{if(polling||state.loading||state.pending||document.hidden||!state.run)return;polling=true;const epoch=state.epoch;try{const data=await api('/api/project/'+encodeURIComponent(state.projectId));if(epoch!==state.epoch)return;const changed=data.run.revision!==state.run.revision||data.run.contextChanged!==state.run.contextChanged;if(changed){stash();const oldJob=running();state.run=data.run;state.projects=state.projects.map(p=>p.id===data.project.id?data.project:p);if(!['TEXTAREA','INPUT','SELECT'].includes(document.activeElement?.tagName)||oldJob&&!running())render();else renderChrome();}}catch{/* A temporary connection loss must not replace the current draft. */}finally{polling=false;}},2000);
  
  window.addEventListener('beforeunload',stash);init();
  setInterval(async()=>{if(document.hidden||state.pending)return;try{const data=await api('/api/state');state.token=data.token;state.engine=data.engine;const before=state.projects.map(p=>p.id+':'+p.title).join('|'),after=data.projects.map(p=>p.id+':'+p.title).join('|');state.projects=data.projects;if(before!==after){$('#project').innerHTML=data.projects.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');if(!data.projects.some(p=>p.id===state.projectId)){await loadProject(data.activeProjectId||data.projects[0]?.id);return;}}renderChrome();}catch{/* Keep drafts while the local server is unavailable. */}},15000);
})();
