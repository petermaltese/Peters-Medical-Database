/* Page controls follow the current content, without changing the sidebar. */
(()=>{
 const top=document.querySelector('.back-top');if(!top)return;
 const actions=document.createElement('div');actions.className='floating-page-actions';
 actions.setAttribute('role','group');actions.setAttribute('aria-label','Page actions');
 const collapse=document.createElement('button');collapse.type='button';
 collapse.className='collapse-page-bubbles';collapse.textContent='Collapse all';
 collapse.setAttribute('aria-controls','app');
 document.body.append(actions);actions.append(top,collapse);
 const selector='details.glomerular-bubble, details.cardio-disclosure';
 const refresh=()=>{collapse.hidden=!app.querySelector(selector);};
 collapse.addEventListener('click',()=>{
  app.querySelectorAll(selector).forEach(section=>{section.open=false;});
 });
 new MutationObserver(refresh).observe(app,{childList:true,subtree:true});
 refresh();
})();
