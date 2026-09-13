const externalFor=id=>{
  const direct=window.PETER_EXTERNAL_INFO.filter(e=>e.topics.includes(id));
  if(direct.length)return {entries:direct,context:null};
  const ancestors=pathIds(id).slice(0,-1).reverse();
  for(const ancestor of ancestors){const entries=window.PETER_EXTERNAL_INFO.filter(e=>e.topics.includes(ancestor));if(entries.length)return {entries,context:ancestor};}
  return {entries:[],context:null};
};
function externalSection(id){
  const {entries,context}=externalFor(id);
  const section=document.createElement('section');section.className='external-information';section.id='extra-information';section.setAttribute('aria-labelledby','extra-information-title');
  section.innerHTML=`<header><span class="external-eyebrow">EXTERNAL SOURCES · SEPARATE FROM YOUR NOTES</span><h2 id="extra-information-title">Extra information</h2><p>AI-written summaries of the named sources below. These are not part of your Word notes and are not direct quotations.</p>${context?`<p class="external-context">Broader context for <a href="${topicUrl(context)}">${esc(node(context).title)}</a>; this is not a dedicated summary of ${esc(node(id).title)}.</p>`:''}</header>${entries.length?entries.map(e=>`<section class="external-source"><div class="external-source-name">Information from ${esc(e.publisher)}</div><h3>${esc(e.title)}</h3><div class="external-meta">Source summary · checked ${esc(e.checked)}</div><ul>${e.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>${e.difference?`<div class="source-difference"><strong>Difference from your notes:</strong> ${esc(e.difference)}</div>`:''}<p class="external-resource"><strong>Resource:</strong> <a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.title)} — ${esc(e.publisher)} ↗</a></p></section>`).join(''):'<p>No source summary has been verified for this topic yet.</p>'}`;
  return section;
}
const originalTopicPageV5=topicPage;
topicPage=function(id,block=null){
  originalTopicPageV5(id,block);if(!node(id)||node(id).level===1)return; const rootIndex=D.roots.indexOf(systemOf(id)); const hue=[4,190,270,120,35,320,150,220,75,10,245,165,290,55,200,95][rootIndex<0?0:rootIndex]; app.style.setProperty('--topic-color',`hsl(${hue} 68% 42%)`);
  const article=app.querySelector('.article');const panel=article?.querySelector('.article-panel');if(!panel)return;
  const label=document.createElement('div');label.className='notes-source-label';label.textContent='Your notes · Disease - As Understood By Peter.docx';panel.before(label);panel.after(externalSection(id)); const imgs=window.PETER_IMAGE_MANIFEST?.[node(id).title]||[]; if(imgs.length){const g=document.createElement('section');g.className='topic-images';g.innerHTML='<h2>Images from your Word document</h2>'+imgs.map((f,i)=>`<figure><img src="images/${f}" loading="lazy" alt="Image ${i+1} from the original Word document"><figcaption>Original image from Disease - As Understood By Peter.docx</figcaption></figure>`).join(''); panel.after(g);}
  const jump=document.createElement('a');jump.className='btn extra-jump';jump.href=topicUrl(id);jump.textContent='Jump to extra information ↓';jump.addEventListener('click',e=>{e.preventDefault();document.getElementById('extra-information')?.scrollIntoView({behavior:'smooth',block:'start'});});app.querySelector('.topic-header').append(jump);
};
const originalHomeV5=home;
home=function(){originalHomeV5();const notice=app.querySelector('.notice');if(notice)notice.innerHTML='<strong>Clear sources:</strong> Your Word notes are preserved. Topic pages show separately labelled summaries from external sources below your notes. High yield and search continue to use your notes only. Embedded Word images are not yet displayed.';};
document.querySelector('.source-badge').textContent='SOURCES LABELLED';
route();
