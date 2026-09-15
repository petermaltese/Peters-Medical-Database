/* V15 presentation-only organisation. Original data.js and image files are unchanged. */
const cardioHeadings={epi:'Epidemiology',risk:'Aetiology / Risk Factors',path:'Pathophysiology',clinical:'Clinical Features',dx:'Investigations / Diagnosis',tx:'Treatment / Management',comp:'Complications'};
// Reviewed source-block boundaries; nested lists remain with their parent passages.
const cardioRanges=[
[0,'path'],[9,'dx'],[13,'path'],[15,'dx'],[30,'tx'],[35,'dx'],
[38,'risk'],[64,'path'],[80,'clinical'],[96,'dx'],[99,'path'],[144,'path'],[172,'epi'],[182,'dx'],[198,'tx'],[203,'tx'],[256,'comp'],[259,'tx'],
[261,'path'],[269,'epi'],[270,'path'],[276,'risk'],[287,'clinical'],[290,'dx'],[292,'path'],[328,'epi'],[330,'dx'],[332,'tx'],
[353,'risk'],[370,'clinical'],[382,'dx'],[384,'path'],[409,'epi'],[412,'dx'],[415,'tx'],
[431,'risk'],[461,'clinical'],[469,'dx'],[471,'path'],[485,'dx'],[492,'path'],[500,'epi'],[508,'dx'],[509,'tx'],
[529,'risk'],[537,'path'],[561,'clinical'],[564,'dx'],[566,'path'],[572,'epi'],[573,'dx'],[574,'tx'],
[584,'path'],[586,'tx'],[587,'comp'],[589,'risk'],[592,'clinical'],[597,'epi'],[598,'path'],
[622,'risk'],[639,'clinical'],[641,'dx'],[643,'path'],[660,'comp'],[665,'epi'],[668,'dx'],[672,'tx'],
[677,'risk'],[679,'risk'],[692,'clinical'],[705,'dx'],[707,'path'],[710,'tx'],[716,'tx'],[721,'path'],
[726,'risk'],[734,'clinical'],[736,'dx'],[738,'path'],[739,'epi'],[743,'dx'],[745,'tx'],
[751,'path'],[752,'risk'],[753,'clinical'],[758,'dx'],[762,'tx'],[763,'path'],[770,'clinical'],[772,'tx'],
[775,'path'],[777,'epi'],[778,'clinical'],[781,'comp'],[782,'risk'],[786,'tx'],[787,'epi'],[788,'path'],[789,'epi'],[790,'path'],[791,'clinical'],
[792,'path'],[793,'risk'],[794,'clinical'],[795,'comp'],[800,'tx'],[801,'clinical'],[802,'tx'],[803,'risk'],[805,'path'],[807,'tx'],
[809,'clinical'],[817,'path'],[820,'dx'],[821,'path'],[843,'risk'],[856,'tx'],[863,'path'],[866,'dx'],[897,'dx'],
[918,'path'],[969,'epi'],[970,'risk'],[972,'path'],[976,'clinical'],[983,'tx'],[1019,'risk'],[1020,'clinical'],[1021,'path'],[1022,'dx'],[1023,'tx'],
[1024,'tx'],[1025,'comp'],[1028,'tx'],[1054,'tx'],[1060,'comp'],[1061,'tx'],[1064,'tx'],[1071,'path'],[1106,'clinical'],[1113,'dx'],[1114,'tx'],[1117,'dx'],[1118,'comp']
];
const cardioDefinitions=new Set([37,275,352,430,528,623,708,720,775,790,808,1070,1105]);
function cardioCategory(index){let key='path';for(const [start,category] of cardioRanges){if(start>index)break;key=category;}return key;}
function revealCardioTarget(el){for(let p=el?.parentElement;p;p=p.parentElement)if(p.matches('details.cardio-disclosure'))p.open=true;}
const topicBeforeCardio=topicPage;
topicPage=function(id,block=null){
 topicBeforeCardio(id,block);
 if(!node(id)||systemOf(id)!=='cardiology'||node(id).level===1)return;
 app.classList.add('cardiology-organised');
 const panel=app.querySelector('.article-panel');if(!panel)return;
 for(const section of [...panel.querySelectorAll('.topic-section')]){
  const tid=section.id.replace('section-',''),n=node(tid);if(!n)continue;
  const buckets=Object.fromEntries(Object.keys(cardioHeadings).map(k=>[k,[]]));const definitions=[];
  let lastBucket='path';
  for(const child of [...section.children]){
   if(child.classList.contains('topic-section')||child.classList.contains('topic-section-header'))continue;
   if(child.classList.contains('empty-note')){child.remove();continue;}
   if(child.id.startsWith('block-')){
    const index=Number(child.id.slice(6));lastBucket=cardioDefinitions.has(index)?'definition':cardioCategory(index);
    (lastBucket==='definition'?definitions:buckets[lastBucket]).push(child);
   }else if(child.classList.contains('inline-figure')){
    (lastBucket==='definition'?definitions:buckets[lastBucket]).push(child);
   }
  }
  const def=document.createElement('div');def.className='cardio-definition';
  def.innerHTML='<h2>Definition</h2><p class="ai-origin">Your notes</p>';
  if(definitions.length)definitions.forEach(el=>def.append(el));else def.insertAdjacentHTML('beforeend','<p><em>to be added</em></p>');
  const groups=document.createElement('div');groups.className='cardio-groups';
  for(const [key,title] of Object.entries(cardioHeadings)){
   const details=document.createElement('details');details.className='cardio-disclosure';details.dataset.category=key;
   const summary=document.createElement('summary');summary.textContent=title;details.append(summary);
   const body=document.createElement('div');body.className='cardio-section-body';buckets[key].forEach(el=>body.append(el));
   // An existing heading without notes still needs the requested placeholder.
   const content=buckets[key].some(el=>el.classList.contains('inline-figure')||(!el.classList.contains('local-label')&&el.textContent.trim()));
   if(!content)body.insertAdjacentHTML('beforeend','<p class="cardio-placeholder"><em>to be added</em></p>');
   details.append(body);groups.append(details);
  }
  const firstSubtopic=[...section.children].find(el=>el.classList.contains('topic-section'));
  section.insertBefore(groups,firstSubtopic||null);
  if(tid===id){const header=app.querySelector('.topic-header');header.querySelector('.page-lead')?.remove();header.append(def);}
  else section.insertBefore(def,groups);
 }
 // Place the existing jump links after the AI box and before the notes.
 const jump=app.querySelector('.subtopic-grid');if(jump){const title=jump.previousElementSibling;const label=app.querySelector('.notes-source-label');label.before(title,jump);}
 const controls=document.createElement('div');controls.className='cardio-controls';
 for(const [label,open] of [['Expand all sections',true],['Collapse all sections',false]]){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=label;b.onclick=()=>panel.querySelectorAll('.cardio-disclosure').forEach(d=>d.open=open);controls.append(b);}panel.before(controls);
 if(block!==null){const el=document.getElementById('block-'+block);revealCardioTarget(el);requestAnimationFrame(()=>el?.scrollIntoView({behavior:'smooth',block:'center'}));}
};
// Also handle any internal links targeting a passage inside a closed section.
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#block-"],a[href^="#section-"]');if(a)revealCardioTarget(document.getElementById(a.getAttribute('href').slice(1)));});
route();
