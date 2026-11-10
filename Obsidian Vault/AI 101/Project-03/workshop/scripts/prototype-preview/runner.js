// This document has its own restrictive policy and an opaque sandbox origin.
// Prototype code stays in the browser and cannot access Workshop or the network.
(() => {
  let rendered=false;
  window.addEventListener('message',event=>{
    if(rendered||event.source!==parent||event.origin!==location.origin||event.data?.type!=='workshop-preview-render'||typeof event.data.html!=='string')return;
    rendered=true;
    document.open();document.write(event.data.html);document.close();
  });
  parent.postMessage({type:'workshop-preview-ready',id:decodeURIComponent(location.hash.slice(1))},'*');
})();
