  let extraCategories=[];
  try{const stored=JSON.parse(localStorage.getItem('design-shelf-categories')||'[]');if(Array.isArray(stored))extraCategories=stored.filter(c=>c&&/^custom-[\w-]+$/.test(c.id)&&typeof c.label==='string'&&Array.isArray(c.keywords)).slice(0,24).map(c=>({id:c.id,label:c.label.slice(0,40),keywords:c.keywords.filter(k=>typeof k==='string').slice(0,6).map(k=>k.slice(0,32))}));}catch{}
  const categoryOptions=()=>[
    ['plugins','Plugins'],['games','Games'],['ux-ui','UX/UI'],['motion','Motion design'],
    ...SECTIONS.filter(([id])=>!['all','plugins','games'].includes(id)),
    ...extraCategories.map(c=>[c.id,c.label])
  ];
  const categoryLabel=id=>categoryOptions().find(([key])=>key===id)?.[1];
  const isCategory=id=>categoryOptions().some(([key])=>key===id);
  const isTopic=id=>id==='motion'||id==='ux-ui'||extraCategories.some(c=>c.id===id);
  function keywordMatches(reference,custom){
    const normalize=text=>text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
    const words=' '+normalize([reference.title,reference.summary,...reference.tags,...reference.focus].join(' '))+' ';
    return custom.keywords.some(k=>words.includes(' '+normalize(k)+' '));
  }
  function categoryHome(reference){return extraCategories.find(c=>keywordMatches(reference,c))?.id||assetHomeCategory(reference);}
  function categoryMatches(reference,id){return categoryHome(reference)===id;}
  function openCategoryForm(){
    $('#category-form').reset();$('#category-error').textContent='';openDialog($('#category-dialog'));
  }
  function initCategories(){
    $('#category-form').addEventListener('submit',event=>{
      event.preventDefault();const form=event.currentTarget,label=form.elements.label.value.trim().replace(/\s+/g,' '),raw=form.elements.keywords.value.trim();
      if(!label)return;
      if(categoryOptions().some(([,name])=>name.toLowerCase()===label.toLowerCase())){$('#category-error').textContent='That category is already here.';return;}
      if(extraCategories.length>=24){$('#category-error').textContent='You can add up to 24 categories on this device.';return;}
      const keywords=[...new Set((raw||label).split(',').map(k=>k.trim().slice(0,32)).filter(Boolean))].slice(0,6);
      if(!keywords.length){$('#category-error').textContent='Add a word to match.';return;}
      const category={id:'custom-'+crypto.randomUUID(),label,keywords};
      try{localStorage.setItem('design-shelf-categories',JSON.stringify([...extraCategories,category]));}
      catch{$('#category-error').textContent='This browser could not save the category.';return;}
      extraCategories.push(category);closeDialog($('#category-dialog'));goToSection(category.id);toast('Category added');
      requestAnimationFrame(()=>$('#mobile-categories [data-category="'+category.id+'"]').scrollIntoView({behavior:motionPreference.matches?'instant':'smooth',block:'nearest',inline:'nearest'}));
    });
  }
