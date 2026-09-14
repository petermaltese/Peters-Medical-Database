/* AI editorial focus uses source passages intact so qualifications stay with each point. */
const aiNewSources={
 'opthalmology--eye-anatomy':[{title:'How the Eyes Work',publisher:'NIH — National Eye Institute',url:'https://www.nei.nih.gov/eye-health-information/healthy-vision/how-eyes-work',points:['The cornea and lens focus light onto the retina. Retinal photoreceptors convert that light into electrical signals, which travel through the optic nerve to the brain.'],checked:'14 September 2026'}],
 'common-causes-of-vision---glaucoma':[{title:'Glaucoma',publisher:'NIH — National Eye Institute',url:'https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/glaucoma',points:['Sudden intense eye pain, red eye, blurred vision and nausea can occur in angle-closure glaucoma and need immediate medical assessment.'],checked:'14 September 2026'}],
 'opthalmology--common-causes-of-vision-loss':[{title:'Retinal Detachment',publisher:'NIH — National Eye Institute',url:'https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/retinal-detachment',points:['A sudden increase in floaters, flashes or a curtain-like shadow in the visual field requires urgent eye assessment for possible retinal detachment. A dilated examination is used to assess the retina.'],checked:'14 September 2026'}]
};

Object.assign(aiNewSources,{
 'valvular-disease--key-murmurs':[{title:'Heart Valve Diseases: Diagnosis',publisher:'NIH — NHLBI',url:'https://www.nhlbi.nih.gov/health/heart-valve-diseases/diagnosis',points:['Auscultation can identify a murmur or irregular rhythm. Echocardiography assesses valve structure and function; Doppler evaluates blood flow through the chambers and valves.'],checked:'14 September 2026'}],
 'musculoskeletal--bone-health':[{title:'Preventing Another Broken Bone',publisher:'NIH — NIAMS',url:'https://www.niams.nih.gov/health-topics/preventing-another-broken-bone',points:['Osteoporosis can remain asymptomatic until a fracture. Common fracture sites include the hip, vertebrae and wrist.','After a fracture in an older adult, preventing further fractures includes assessment for osteoporosis and reducing falls risk.'],checked:'14 September 2026'}],
 'breast-cancer--differentials-for-a-breast-lump':[{title:'Benign and Precancerous Breast Conditions',publisher:'NIH — National Cancer Institute',url:'https://www.cancer.gov/types/breast/causes-risk-factors/benign-breast-lumps',points:['Benign causes of a breast lump include cysts, fibroadenomas, fat necrosis, haematomas and lipomas. Fibroadenomas often move readily; fat necrosis can follow trauma or surgery.'],checked:'14 September 2026'}],
 'liver--chronic-liver-disease':[{title:'Definition & Facts for Cirrhosis',publisher:'NIH — NIDDK',url:'https://www.niddk.nih.gov/health-information/liver-disease/cirrhosis/definition-facts',points:['Cirrhosis is permanent liver scarring that disrupts function and can obstruct portal blood flow, producing portal hypertension. It is one consequence of chronic liver injury.'],checked:'14 September 2026'}]
});

function aiNoteSelections(id){
 const candidates=[];
 for(const tid of allDesc(id,true)){
  const n=node(tid);let groups=[],current=[];
  for(const b of n.blocks){
   const level=b.type==='list'?(b.level||0):0;
   if(current.length&&level<=((current[0].type==='list'&&current[0].level)||0)){groups.push(current);current=[];}
   current.push(b);
  } if(current.length)groups.push(current);
  for(const blocks of groups){
   const text=blocks.map(textOfBlock).join(' ');if(!text.trim())continue;
   // Prefer complete clinical distinctions, presentations, assessment and complications.
   const score=(tid===id?5:0)+(/emergency|urgent|red flag|life.threat|sudden|classic|hallmark|diagnos|complication|distinguish|differentiat/i.test(text)?4:0)+(/clinical|symptom|sign|present|investigat|risk|pathophysiol|mechanism/i.test(n.title+' '+text)?2:0);
   candidates.push({tid,blocks,score,order:blocks[0].index});
  }
 }
 candidates.sort((a,b)=>b.score-a.score||a.order-b.order);
 return candidates.slice(0,3).sort((a,b)=>a.order-b.order);
}
function aiHighYieldSection(id){
 const sec=document.createElement('section');sec.className='ai-high-yield';sec.setAttribute('aria-label','High yield from AI');
 const selections=aiNoteSelections(id);
 const sources=aiNewSources[id]||window.PETER_EXTERNAL_INFO.filter(e=>e.topics.includes(id));
 sec.innerHTML='<h2>High yield from AI</h2><p class="ai-origin">AI-selected study priorities. Source labels distinguish your notes from external information. This is not an official exam syllabus.</p>';
 if(sources.length){
  const box=document.createElement('div');box.innerHTML='<h3>External-source takeaways</h3>'+sources.map(e=>`<div class="ai-passage"><ul>${e.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul><p class="ai-reference">AI-written summary · Reference: <a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.publisher)} — ${esc(e.title)}</a> · checked ${esc(e.checked)}</p>${e.difference?`<p>${esc(e.difference)}</p>`:''}</div>`).join('');sec.append(box);
 }
 if(selections.length){
  const details=document.createElement('details');details.open=!sources.length;details.innerHTML='<summary>Priority passages from your notes</summary><p class="ai-origin">AI-selected excerpts, retained in your original wording. These passages have not been independently fact-checked.</p>';
  selections.forEach(item=>{const piece=document.createElement('div');piece.className='ai-passage';piece.innerHTML=`<strong>${esc(node(item.tid).title)}</strong>`+renderBlocks(item.blocks)+`<p class="ai-reference">Reference: <a href="${topicUrl(item.tid,item.blocks[0].index)}">Disease – As Understood By Peter.docx → ${esc(pathIds(item.tid).map(x=>node(x).title).join(' › '))} · open original passage</a></p>`;piece.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));details.append(piece);});sec.append(details);
 }
 if(!sources.length&&!selections.length){const figures=window.PETER_IMAGE_PLACEMENTS.filter(x=>x.topic===id); const p=document.createElement('p');p.innerHTML=figures.length?'AI study focus: review the annotated figure below. Reference: '+figures.map((x,i)=>`<a class="ai-reference" href="images/${esc(x.file)}" target="_blank" rel="noopener">Your Word document — figure ${i+1}</a>`).join(' · '):'No referenced high-yield summary is available for this heading yet.';sec.append(p);}
 return sec;
}
