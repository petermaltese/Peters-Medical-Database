function imageFigure(item){
 const f=document.createElement('figure'); f.className='inline-figure'; f.dataset.imageFile=item.file;
 const a=document.createElement('a'); a.href='images/'+item.file; a.target='_blank'; a.rel='noopener'; a.setAttribute('aria-label','Enlarge figure');
 const img=document.createElement('img'); img.src=a.href; img.loading='lazy'; img.alt='Figure'; a.append(img); f.append(a); return f;
}
function embedTopicImages(panel,id){
 const tails=new Map();
 for(const item of window.PETER_IMAGE_PLACEMENTS.filter(x=>allDesc(id,true).includes(x.topic))){
  // Root system pages show their own figures only; children appear on their topic pages.
  if(node(id).level===1 && item.topic!==id)continue;
  const section=document.getElementById('section-'+item.topic);
  const anchor=item.after===null?null:document.getElementById('block-'+item.after);
  const key=item.topic+':'+item.after; const f=imageFigure(item);
  if(tails.has(key))tails.get(key).after(f);
  else if(anchor&&panel.contains(anchor))anchor.after(f);
  else if(section){const header=section.querySelector('.topic-section-header');if(header)header.after(f);else section.prepend(f);}
  else if(item.topic===id&&node(id).level===1){app.querySelector('.topic-header').after(f);}
  else throw new Error('Missing image anchor '+key);
  tails.set(key,f);
 }
}
const homeBeforeImages=home;
home=function(){homeBeforeImages();const items=window.PETER_IMAGE_PLACEMENTS.filter(x=>x.topic===null);if(items.length){const section=document.createElement('details');section.className='document-figures';const title=document.createElement('summary');title.textContent='Document opening figures';section.append(title);items.forEach(x=>section.append(imageFigure(x)));app.querySelector('.page').append(section);}};
