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
 // The bubble itself is the control: no separate-page link or repeated title.
 if(header)header.remove();
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
 const label=intro.querySelector('.notes-source-label');
 const figure=intro.querySelector('.inline-figure');
 if(figure){figure.classList.add('glomerular-summary-image');label?label.after(figure):intro.prepend(figure);}
 const injury=document.getElementById('section-glomerular-disease--types-of-glomerular-injury');
 if(injury){injury.classList.add('glomerular-injury');intro.append(injury);injury.querySelector('.open-topic')?.remove();}
 // Start with the summary open; the page's Collapse all control includes it.
 const summaryBubble=document.createElement('details');summaryBubble.className='glomerular-bubble summary-bubble';summaryBubble.open=true;
 const summaryTitle=document.createElement('summary');summaryTitle.textContent='Summary';
 if(label)label.remove();intro.before(summaryBubble);summaryBubble.append(summaryTitle,intro);
 for(const el of [...root.children])if(el.classList.contains('overview-jumps'))el.remove();
 page.querySelector('.cardio-controls')?.remove();
 for(const syndrome of [...root.children].filter(el=>el.classList.contains('topic-section'))){
  const sid=syndrome.id.slice(8);
  if(!node(sid)?.children.length)continue;
  const definition=[...syndrome.children].find(el=>el.classList.contains('overview-introduction'));
  if(definition){const heading=document.createElement('h3');heading.textContent='Definition';definition.prepend(heading);}
  const nav=[...syndrome.children].find(el=>el.classList.contains('overview-jumps'));
  if(nav)nav.remove();
  for(const disease of [...syndrome.children].filter(el=>el.classList.contains('topic-section')))makeGlomerularBubble(disease,'disease-bubble');
  makeGlomerularBubble(syndrome,'syndrome-bubble');
 }
 if(block!==null){const target=document.getElementById('block-'+block);revealGlomerularTarget(target);requestAnimationFrame(()=>target?.scrollIntoView({block:'center'}));}
};
route();
