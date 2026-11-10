  let categoryDrag=null,suppressCategoryClick=false;
  function positionCategorySlider(id=state.section){
    const nav=$('#mobile-categories'),thumb=nav.querySelector('.category-thumb'),selected=[...nav.querySelectorAll('[data-category]')].find(b=>b.dataset.category===id);
    if(!thumb)return;thumb.hidden=!selected;if(!selected)return;
    thumb.style.width=selected.offsetWidth+'px';thumb.style.transform='translateX('+selected.offsetLeft+'px)';
  }
  function initCategorySlider(){
    const nav=$('#mobile-categories');
    new ResizeObserver(()=>positionCategorySlider()).observe(nav);
    document.fonts.ready.then(()=>positionCategorySlider());
    nav.addEventListener('click',event=>{if(suppressCategoryClick){event.preventDefault();event.stopImmediatePropagation();suppressCategoryClick=false;}},true);
    nav.addEventListener('pointerdown',event=>{
      const target=event.target.closest('[data-category]');if(!target||event.button!==0)return;
      // Touch scrolls the rail normally; its selected segment can be dragged.
      const selecting=target.getAttribute('aria-pressed')==='true';
      if(event.pointerType!=='mouse'&&!selecting)return;
      categoryDrag={pointer:event.pointerId,start:event.clientX,scroll:nav.scrollLeft,moved:false,selecting,id:target.dataset.category};
    });
    nav.addEventListener('pointermove',event=>{
      const drag=categoryDrag;if(!drag||drag.pointer!==event.pointerId)return;
      const delta=event.clientX-drag.start;if(Math.abs(delta)>5)drag.moved=true;if(!drag.moved)return;
      if(!nav.hasPointerCapture(event.pointerId))nav.setPointerCapture(event.pointerId);
      nav.classList.add('is-dragging');
      if(!drag.selecting){nav.scrollLeft=drag.scroll-delta;return;}
      const rect=nav.getBoundingClientRect(),x=event.clientX-rect.left+nav.scrollLeft;
      if(event.clientX>rect.right-28)nav.scrollLeft+=8;else if(event.clientX<rect.left+28)nav.scrollLeft-=8;
      const buttons=[...nav.querySelectorAll('[data-category]')];
      const nearest=buttons.reduce((best,b)=>Math.abs(b.offsetLeft+b.offsetWidth/2-x)<Math.abs(best.offsetLeft+best.offsetWidth/2-x)?b:best,buttons[0]);
      drag.id=nearest.dataset.category;positionCategorySlider(drag.id);
    });
    const finish=(event,cancel=false)=>{
      const drag=categoryDrag;if(!drag||drag.pointer!==event.pointerId)return;categoryDrag=null;nav.classList.remove('is-dragging');
      if(nav.hasPointerCapture(event.pointerId))nav.releasePointerCapture(event.pointerId);
      if(drag.moved){suppressCategoryClick=true;setTimeout(()=>suppressCategoryClick=false,0);}
      if(!cancel&&drag.moved&&drag.selecting)goToSection(drag.id);else positionCategorySlider();
    };
    nav.addEventListener('pointerup',event=>finish(event));nav.addEventListener('pointercancel',event=>finish(event,true));
    nav.addEventListener('keydown',event=>{
      const target=event.target.closest('[data-category]');if(!target||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const buttons=[...nav.querySelectorAll('[data-category]')],index=buttons.indexOf(target);
      const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:Math.max(0,Math.min(buttons.length-1,index+(event.key==='ArrowRight'?1:-1)));
      buttons[next].focus();goToSection(buttons[next].dataset.category);buttons[next].scrollIntoView({block:'nearest',inline:'nearest',behavior:motionPreference.matches?'instant':'smooth'});
    });
  }
