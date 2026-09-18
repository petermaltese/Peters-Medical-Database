/* V33: shared presentation for all systems; note content is unchanged. */
function addDiseaseControls(){
 for(const section of app.querySelectorAll('.topic-section')){
  const id=section.id.replace(/^section-/,'');
  const groups=Array.from(section.children).find(el=>el.classList.contains('cardio-groups'));
  if(!groups)continue;
  let header=Array.from(section.children).find(el=>el.classList.contains('topic-section-header'));
  if(!header){
   const title=app.querySelector('.topic-header h1');
   if(!title)continue;
   header=document.createElement('div');header.className='disease-title-row';
   title.before(header);header.append(title);
  }
  header.classList.add('disease-title-row');
  const actions=document.createElement('div');actions.className='disease-section-actions';
  actions.setAttribute('role','group');actions.setAttribute('aria-label',node(id).title+' section controls');
  for(const [label,open] of [['Expand All',true],['Collapse All',false]]){
   const button=document.createElement('button');button.type='button';button.textContent=label;
   button.setAttribute('aria-label',label+' sections for '+node(id).title);
   button.addEventListener('click',()=>groups.querySelectorAll('details.cardio-disclosure').forEach(detail=>{detail.open=open;}));
   actions.append(button);
  }
  header.querySelector('h1,h2,h3,h4,h5')?.after(actions);
 }
}
const glomerularBaseLayout=topicPage;
topicPage=function(id,block=null){
 glomerularBaseLayout(id,block);
 addDiseaseControls();
 for(const section of app.querySelectorAll('.topic-section[data-overview="true"]')){
  const overviewId=section.id.replace(/^section-/,'');
  const jump=Array.from(section.children).find(el=>el.classList.contains('overview-jumps'));
  const summary=overviewId===id?app.querySelector('.topic-header .overview-introduction'):Array.from(section.children).find(el=>el.classList.contains('overview-introduction'));
  if(jump&&summary)summary.before(jump);
  if(summary){
   summary.classList.add('notes-introduction-panel');
   const heading=document.createElement(overviewId===id?'h2':'h3');
   heading.className='overview-introduction-title';heading.textContent='Introduction';
   summary.prepend(heading);
  }
 }
 // Disease pages retain their Definition label and use the same introductory panel.
 app.querySelectorAll('.cardio-definition').forEach(def=>def.classList.add('notes-introduction-panel'));
 const definition=app.querySelector('.topic-header>.cardio-definition');
 const diseaseJumps=app.querySelector('.subtopic-grid');
 if(definition&&diseaseJumps){
  const label=diseaseJumps.previousElementSibling;
  if(label?.classList.contains('section-title'))definition.before(label);
  definition.before(diseaseJumps);
 }
 if(id!=='renal-system--glomerular-disease')return;
 const intro=app.querySelector('.topic-header .overview-introduction');
 if(!intro)return;
 // Preserve the requested summary contents, without adding an outer disclosure.
 intro.classList.add('glomerular-plain-intro');
 const figure=intro.querySelector('.inline-figure');
 if(figure){figure.classList.add('glomerular-summary-image');intro.prepend(figure);}
 const injury=document.getElementById('section-glomerular-disease--types-of-glomerular-injury');
 if(injury){injury.classList.add('glomerular-injury');intro.append(injury);injury.querySelector('.open-topic')?.remove();}
 // Injury types are already part of the summary, so need no jump link.
 app.querySelectorAll('.overview-jumps a[href="#section-glomerular-disease--types-of-glomerular-injury"]').forEach(link=>link.closest('li')?.remove());
 if(block!==null){const target=document.getElementById('block-'+block);revealCardioTarget(target);requestAnimationFrame(()=>target?.scrollIntoView({block:'center'}));}
};
const systemBeforeSharedLayout=systemPage;
systemPage=function(id){
 systemBeforeSharedLayout(id);
 const header=app.querySelector('.topic-header');if(!header)return;
 const n=node(id),panel=app.querySelector('.article-panel');
 const intro=document.createElement('div');intro.className='overview-introduction notes-introduction-panel';
 const heading=document.createElement('h2');heading.className='overview-introduction-title';heading.textContent='Introduction';intro.append(heading);
 if(n.blocks.length&&panel){
  const label=panel.previousElementSibling;
  if(label?.classList.contains('section-title'))label.remove();
  while(panel.firstChild)intro.append(panel.firstChild);
  panel.remove();
 }else intro.insertAdjacentHTML('beforeend','<p class="overview-placeholder"><em>to be added</em></p>');
 const nav=document.createElement('nav');nav.className='overview-jumps';nav.setAttribute('aria-label','Jump to a topic');
 const title=document.createElement('h3');title.textContent='Jump to a topic';nav.append(title);
 const list=document.createElement('ul');
 for(const child of n.children){const li=document.createElement('li'),a=document.createElement('a');a.href=topicUrl(child);a.textContent=node(child).title;li.append(a);list.append(li);}
 nav.append(list);header.append(nav,intro);
};
route();
