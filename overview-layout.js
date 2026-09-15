/* V22: presentation roles reviewed against the existing hierarchy, not medical additions. */
const detailedParentTopics = new Set([
 'respiratory-system--lung-cancer',
 'colorectal-cancer--adenocarcinoma-of-the-colon',
 'neurology--parkinsons-disease',
 'spinal-compression-patho--lumbar-disc-herniation',
 'reproductive-system--breast-cancer',
 'musculoskeletal--ankle-injuries'
]);
const plainNoteTopics = new Set([
 'valvular-disease--key-murmurs',
 'long-term-management-of---antiarrhythmic-drugs',
 'long-term-management-of---catheter-ablation',
 'long-term-management-of---implantable-cardioverter-defibrillator',
 'long-term-management-of---cardioversion',
 'gastrointestinal-tract--transpyloric-plane',
 'glomerular-disease--types-of-glomerular-injury',
 'lung-cancer--patterns-of-spread', 'lung-cancer--subtypes-histopathology',
 'clinical-application--common-symptoms-and-causes', 'clinical-application--breath-sounds',
 'cortical-diseases--summary-image',
 'neuropharmacology--benzodiazepines', 'neuropharmacology--barbiturates',
 'modulating-synaptic-tran--potential-targets', 'seizure-management--seizure-pharmaco-treatment',
 'neurology--neuroimaging', 'aetiology--breast-cancer-anatomy',
 'breast-cancer--biomarkers-er-pr-her2', 'breast-cancer--differentials-for-a-breast-lump',
 'ankle-injuries--ottawa-rules', 'musculoskeletal--bone-health',
 'haematology--haematology-and-haematopoiesis',
 'paediatrics--heeadsss-assessment', 'paediatrics--consent-gillick-competency-and-mandatory-reporting',
 'paediatrics--child-at-risk', 'audiometry-and-hearing-l--types-of-hearing-loss',
 'audiometry--audiogram-s', 'audiometry--tympanometry', 'ent--otoscopy',
 'opthalmology--eye-anatomy', 'opthalmology--eye-assessment',
 'the-promt-model--e-g-chest-pain', 'the-promt-model--e-g-abdominal-pain',
 'chronic-health-in-the-el--managing-elderly-patients', 'chronic-health-in-the-el--ckd-and-chronic-disease',
 'complex-symptoms-and-sig--exudative-and-transudative-fluids', 'complex-symptoms-and-sig--rashes'
]);
function usesPlainIntroduction(id){
 const n=node(id);
 return !!n && (plainNoteTopics.has(id) || !!window.PETER_NOTE_SECTION_NODES?.[id] ||
   (n.children.length>0 && !detailedParentTopics.has(id)));
}
function renderPlainIntroduction(section,id,isRoot){
 section.dataset.overview='true';
 const intro=document.createElement('div');intro.className='overview-introduction';
 intro.setAttribute('aria-label','Your notes — introduction');
 // Keep original order and exact DOM blocks, including images beside their text.
 for(const child of [...section.children]){
  if(child.classList.contains('topic-section')||child.classList.contains('topic-section-header'))continue;
  if(child.classList.contains('empty-note')){child.remove();continue;}
  intro.append(child);
 }
 if(!intro.textContent.trim()&&!intro.querySelector('img,table'))intro.innerHTML='<p class="overview-placeholder"><em>to be added</em></p>';
 const first=[...section.children].find(el=>el.classList.contains('topic-section'));
 if(isRoot){
  const header=app.querySelector('.topic-header');header.querySelector('.page-lead')?.remove();
  const source=document.createElement('p');source.className='notes-source-label';source.textContent='Your notes';
  intro.prepend(source);header.append(intro);
 }else section.insertBefore(intro,first||null);
 const children=node(id).children;
 if(children.length){
  const nav=document.createElement('nav');nav.className='overview-jumps';nav.setAttribute('aria-label','Jump to a subtopic');
  const label=document.createElement('h3');label.textContent='Jump to a subtopic';nav.append(label);
  const list=document.createElement('ul');
  for(const child of children){const li=document.createElement('li'),a=document.createElement('a');a.href='#section-'+child;a.textContent=node(child).title;li.append(a);list.append(li);}
  nav.append(list);nav.addEventListener('click',event=>{
   const link=event.target.closest('a[href^="#section-"]');if(!link)return;
   const target=document.getElementById(link.getAttribute('href').slice(1));if(!target)return;
   event.preventDefault();revealCardioTarget(target);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
   target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });section.insertBefore(nav,first||null);
 }
}
