/* V23: Glomerular Disease workshop. Move existing DOM nodes; never rewrite notes. */
const glomerularTopicBeforePreview=topicPage;
function revealGlomerularTarget(target){
 for(let p=target;p;p=p.parentElement)if(p.matches('details'))p.open=true;
}
function makeGlomerularBubble(section,kind){
 const details=document.createElement('details');details.className='glomerular-bubble '+kind;
 const summary=document.createElement('summary');
 const header=[...section.children].find(el=>el.classList.contains('topic-section-header'));
 summary.textContent=node(section.id.slice(8)).title;
 const content=document.createElement('div');content.className='glomerular-bubble-content';
 section.before(details);details.append(summary,content);content.append(section);
 // The bubble title replaces the repeated heading; preserve the direct-page link.
 if(header){header.querySelector('h2,h3,h4,h5')?.remove();header.classList.add('glomerular-direct-link');}
 return details;
}
topicPage=function(id,block=null){
 glomerularTopicBeforePreview(id,block);
 const page=app.querySelector('.page');
 if(id!=='renal-system--glomerular-disease'||!page)return;
 page.classList.add('glomerular-preview');
 const root=document.getElementById('section-'+id);
 const intro=page.querySelector('.topic-header .overview-introduction');
 if(!root||!intro)return;
 intro.classList.add('glomerular-summary');
 const label=intro.querySelector('.notes-source-label');if(label)label.textContent='Your notes · Summary';
 const figure=intro.querySelector('.inline-figure');
 if(figure){figure.classList.add('glomerular-summary-image');label?label.after(figure):intro.prepend(figure);}
 const injury=document.getElementById('section-glomerular-disease--types-of-glomerular-injury');
 if(injury){injury.classList.add('glomerular-injury');intro.append(injury);injury.querySelector('.open-topic')?.remove();}
 for(const el of [...root.children])if(el.classList.contains('overview-jumps'))el.remove();
 page.querySelector('.cardio-controls')?.remove();
 for(const syndrome of [...root.children].filter(el=>el.classList.contains('topic-section'))){
  const sid=syndrome.id.slice(8);
  if(!node(sid)?.children.length)continue;
  const definition=[...syndrome.children].find(el=>el.classList.contains('overview-introduction'));
  if(definition){const heading=document.createElement('h3');heading.textContent='Definition';definition.prepend(heading);}
  const nav=[...syndrome.children].find(el=>el.classList.contains('overview-jumps'));
  if(nav){nav.querySelector('h3').textContent='Jump to a specific pathology';
   // Replace the old handler so the disease and all enclosing bubbles open.
   const replacement=nav.cloneNode(true);nav.replaceWith(replacement);
   replacement.addEventListener('click',event=>{
    const a=event.target.closest('a[href^="#section-"]');if(!a)return;
    const target=document.getElementById(a.getAttribute('href').slice(1));if(!target)return;
    event.preventDefault();revealGlomerularTarget(target);
    const bubble=target.closest('.disease-bubble')||target;
    (bubble.querySelector('summary')||target).focus({preventScroll:true});
    bubble.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
   });
  }
  for(const disease of [...syndrome.children].filter(el=>el.classList.contains('topic-section')))makeGlomerularBubble(disease,'disease-bubble');
  makeGlomerularBubble(syndrome,'syndrome-bubble');
 }
 if(block!==null){const target=document.getElementById('block-'+block);revealGlomerularTarget(target);requestAnimationFrame(()=>target?.scrollIntoView({block:'center'}));}
};
route();
