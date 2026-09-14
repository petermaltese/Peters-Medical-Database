/* V14: externally referenced AI content; never edits the Word-note data. */
const aiLabelsForHeading=title=>{
 const t=title.toLowerCase();
 if(/epidemiol|aetiol|risk factor/.test(t))return ['Definition','Epidemiology / risk factors','Exam essentials'];
 if(/investigat|diagnos|blood test|screening/.test(t))return ['Definition','Investigations','Red flags / complications','Exam essentials'];
 if(/treatment|management|pharmacotherap/.test(t))return ['Definition','Treatment','Red flags / complications','Exam essentials'];
 if(/symptom|clinical|examination|signs/.test(t))return ['Definition','Clinical features','Red flags / complications','Exam essentials'];
 return null;
};
function aiCardFor(id){
 const c=window.PETER_AI_CONTENT.cards;
 if(c[id])return {card:c[id],context:null};
 for(const parent of pathIds(id).slice(0,-1).reverse())if(c[parent]){
  const filter=aiLabelsForHeading(node(id).title);
  return {card:{rows:c[parent].rows.filter(r=>!filter||filter.includes(r.label))},context:parent};
 }
 return {card:null,context:null};
}
function scrollToAIReferences(e){e.preventDefault();document.getElementById('ai-references')?.scrollIntoView({behavior:'smooth',block:'start'});}
function aiHighYieldSection(id){
 const {card,context}=aiCardFor(id);const sec=document.createElement('section');sec.className='ai-high-yield';sec.setAttribute('aria-label','High Yield - Sourced From AI');
 const refs=card?[...new Set(card.rows.flatMap(r=>r.refs))]:[];
 sec.innerHTML=`<h2>High Yield - Sourced From AI</h2><p class="ai-origin">AI-written study summary · separate from your notes. Exam essentials are AI-selected priorities, not an official Australian medical school exam syllabus.</p>${context?`<p class="ai-context">${esc(node(context).title)} overview${aiLabelsForHeading(node(id).title)?' — focused on this section':''}. <a href="${topicUrl(context)}">Open the parent topic</a>.</p>`:''}`;
 if(card){
  const dl=document.createElement('dl');dl.className='ai-summary-lines';dl.innerHTML=card.rows.map(r=>`<div><dt>${esc(r.label)}</dt><dd>${esc(r.text)} <span class="ai-citations">${r.refs.map(k=>`<a href="#ai-ref-${refs.indexOf(k)+1}" data-ai-ref="${refs.indexOf(k)+1}" aria-label="Reference ${refs.indexOf(k)+1}">[${refs.indexOf(k)+1}]</a>`).join(' ')}</span></dd></div>`).join('');sec.append(dl);
  const a=document.createElement('a');a.href='#ai-references';a.className='ai-reference-jump';a.textContent='Click here for references';a.addEventListener('click',scrollToAIReferences);sec.append(a);
  sec.querySelectorAll('[data-ai-ref]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById('ai-ref-'+a.dataset.aiRef)?.scrollIntoView({behavior:'smooth',block:'center'});}));
 }else{const p=document.createElement('p');p.textContent='A topic-specific external summary has not yet been verified for this heading.';sec.append(p);}
 return sec;
}
function aiReferencesSection(id){
 const {card}=aiCardFor(id),sec=document.createElement('section');sec.className='ai-references';sec.id='ai-references';
 if(!card)return sec;
 const refs=[...new Set(card.rows.flatMap(r=>r.refs))];
 sec.innerHTML='<h2>References for AI content</h2><p>These references support the AI-written box above, not the separate Word notes.</p><ol>'+refs.map((key,i)=>{const s=window.PETER_AI_CONTENT.sources[key];return `<li id="ai-ref-${i+1}"><strong>${esc(s.publisher)}</strong>. ${esc(s.title)}. <span class="ai-origin">${esc(s.jurisdiction)} · checked ${esc(s.checked)}</span><br><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a></li>`;}).join('')+'</ol>';
 return sec;
}
