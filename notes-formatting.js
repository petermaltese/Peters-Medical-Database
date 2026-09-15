/* V21: presentation cleanup only. No note text or source blocks are rewritten. */
const formattedNoteSystems=["cardiology", "gastrointestinal-tract", "respiratory-system", "renal-system", "endocrine-system", "neurology", "reproductive-system", "musculoskeletal", "haematology", "rheumatology", "dermatology", "paediatrics", "ent", "opthalmology", "general-practice", "complex-symptoms-and-signs"];
const noteHeadingKey=text=>text.toLowerCase().normalize('NFKC').replace(/&/g,' and ').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
const repeatedNoteHeadings={
 epi:['Epidemiology'],
 risk:['Aetiology','Etiology','Risk Factors','Aetiology & Risk Factors','Etiology & Risk Factors'],
 path:['Pathophysiology','Pathogenesis','Aetiology and Pathogenesis'],
 clinical:['Clinical Features','Clinical Presentation','Clinical Presentations','Signs and Symptoms'],
 dx:['Investigations','Diagnosis','Investigations / Diagnosis','Diagnosis, Prevention and Screening','Diagnostic Testing, Prevention and Screening','Prevention and Screening'],
 tx:['Treatment','Treatments','Management','Treatment / Management','Management and Medications','Treatment, Management and Medications','Management, Treatment and Medications'],
 comp:['Complications'],definition:['Definition']
};
function redundantNoteHeading(el,key){
 if(el.querySelector('table,img,a')||!repeatedNoteHeadings[key])return false;
 const t=el.classList.contains('note-bullet')?el.lastElementChild?.textContent:el.textContent;
 return repeatedNoteHeadings[key].some(h=>noteHeadingKey(h)===noteHeadingKey(t||''));
}
function suppressNoteHeading(el){el.classList.add('note-redundant-heading');el.setAttribute('aria-hidden','true');}
function tidyNoteFormatting(){
 app.querySelectorAll('.cardio-section-body,.cardio-definition').forEach(body=>{
  const key=body.classList.contains('cardio-definition')?'definition':body.parentElement.dataset.category;
  body.querySelectorAll('[id^="block-"]').forEach(el=>{
   // Only format this body's own passages, not independently nested pathology sections.
   if(el.closest('.cardio-section-body,.cardio-definition')!==body)return;
   if(redundantNoteHeading(el,key))suppressNoteHeading(el);
   if(!el.textContent.trim()&&!el.querySelector('img,table'))suppressNoteHeading(el);
  });
  body.querySelectorAll('.topic-section[data-inline-category="true"]>.topic-section-header').forEach(header=>{
   const title=header.querySelector('h2,h3,h4,h5');
   if(title&&redundantNoteHeading(title,key)){suppressNoteHeading(title);header.classList.add('note-compact-topic-link');}
  });
  const containers=[body,...body.querySelectorAll('.topic-section[data-inline-category="true"]')];
  containers.forEach(container=>{
   let base=null;
   for(const el of container.children){
    if(el.classList.contains('note-redundant-heading')){base=null;continue;}
    if(el.classList.contains('inline-figure'))continue;
    if(!el.classList.contains('note-bullet')){base=null;continue;}
    const b=nodeBlockByIndex.get(Number(el.id.replace('block-',''))),level=b?.level||0;
    if(base===null)base=level;else base=Math.min(base,level);
    el.style.setProperty('--level',String(Math.max(0,level-base)));
   }
  });
  const hasContent=[...body.querySelectorAll('[id^="block-"]')].some(el=>!el.classList.contains('note-redundant-heading')&&el.textContent.trim())||body.querySelector('img,table');
  if(!hasContent&&!body.querySelector('.cardio-placeholder')&&!body.classList.contains('cardio-definition'))body.insertAdjacentHTML('beforeend','<p class="cardio-placeholder"><em>to be added</em></p>');
 });
}
const nodeBlockByIndex=new Map(Object.values(D.nodes).flatMap(n=>n.blocks.map(b=>[b.index,b])));
const topicBeforeFormatting=topicPage;
topicPage=function(id,block=null){
 topicBeforeFormatting(id,block);if(!node(id)||node(id).level===1||!formattedNoteSystems.includes(systemOf(id)))return;
 tidyNoteFormatting();
 if(block!==null){const el=document.getElementById('block-'+block);if(el?.classList.contains('note-redundant-heading')){
  revealCardioTarget(el);const target=el.closest('.cardio-disclosure')?.querySelector('summary')||el.closest('.cardio-definition');
  requestAnimationFrame(()=>target?.scrollIntoView({behavior:'smooth',block:'center'}));
 }}
};
route();
