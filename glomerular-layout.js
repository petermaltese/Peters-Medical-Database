/* V31: local disease controls within the glomerular workshop. */
const glomerularDiseaseIds=new Set([
 'glomerular-disease--nephritic-syndromes',
 'glomerular-disease--nephrotic-syndromes',
 'glomerular-disease--other-syndromes'
].flatMap(id=>node(id)?.children||[]));
function addDiseaseControls(){
 for(const section of app.querySelectorAll('.topic-section')){
  const id=section.id.replace(/^section-/,'');
  if(!glomerularDiseaseIds.has(id))continue;
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
 for(const overviewId of ['renal-system--glomerular-disease','glomerular-disease--nephritic-syndromes','glomerular-disease--nephrotic-syndromes','glomerular-disease--other-syndromes']){
  const section=document.getElementById('section-'+overviewId);
  if(!section)continue;
  const jump=Array.from(section.children).find(el=>el.classList.contains('overview-jumps'));
  const summary=overviewId===id?app.querySelector('.topic-header .overview-introduction'):Array.from(section.children).find(el=>el.classList.contains('overview-introduction'));
  if(jump&&summary)summary.before(jump);
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
route();
