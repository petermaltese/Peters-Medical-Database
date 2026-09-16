/* Enlarge existing note images in place; never load a separate tab. */
(()=>{
 const dialog=document.createElement('dialog');dialog.className='note-lightbox';
 dialog.setAttribute('aria-label','Enlarged note image');
 const close=document.createElement('button');close.type='button';close.className='note-lightbox-close';
 close.textContent='×';close.setAttribute('aria-label','Close enlarged image');
 const image=document.createElement('img');image.alt='Enlarged note image';
 dialog.append(close,image);document.body.append(dialog);
 let trigger=null;
 close.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{image.removeAttribute('src');if(trigger?.isConnected)trigger.focus({preventScroll:true});trigger=null;});
 document.addEventListener('click',event=>{
  const link=event.target.closest('.inline-figure a,.topic-images a,.document-figures a');
  const original=link?.querySelector('img');if(!original)return;
  event.preventDefault();trigger=link;image.src=original.currentSrc||original.src;image.alt=original.alt||'Enlarged note image';
  if(!dialog.open)dialog.showModal();close.focus();
 });
 window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();});
})();
