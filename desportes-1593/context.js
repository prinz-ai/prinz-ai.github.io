/* Person links open their entry, including direct links and back/forward navigation. */
(() => {
  function reveal(){
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const target=document.getElementById(id);if(!target)return;
    if(target.matches('details'))target.open=true;
    for(let parent=target.parentElement;parent;parent=parent.parentElement)if(parent.matches('details'))parent.open=true;
    requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  }
  window.addEventListener('hashchange',reveal);
  document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(a?.hash===location.hash)reveal();});
  window.addEventListener('beforeprint',()=>document.querySelectorAll('details').forEach(el=>{el.dataset.printOpen=String(el.open);el.open=true;}));
  window.addEventListener('afterprint',()=>document.querySelectorAll('details').forEach(el=>{el.open=el.dataset.printOpen==='true';delete el.dataset.printOpen;}));
  reveal();
})();
