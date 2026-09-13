/* Browsing improvements; medical content remains in the unchanged V2 data.js. */
const titleCounts = new Map();
Object.values(D.nodes).forEach(n => titleCounts.set(n.title.toLowerCase(), (titleCounts.get(n.title.toLowerCase()) || 0) + 1));
const linkCandidates = Object.values(D.nodes).filter(n => n.level > 1 && n.title.length >= 5 && !genericRelated.has(n.title.toLowerCase()) && titleCounts.get(n.title.toLowerCase()) === 1).sort((a,b) => b.title.length-a.title.length);
const regexEscape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mentionPattern = new RegExp('(?<![\\p{L}\\p{N}])(' + linkCandidates.map(n=>regexEscape(n.title)).join('|') + ')(?![\\p{L}\\p{N}])', 'giu');
const titleTargets = new Map(linkCandidates.map(n=>[n.title.toLowerCase(),n.id]));
function linkMentions(){
  const current = decodeURIComponent((location.hash.split('/')[2] || ''));
  document.querySelectorAll('.article-panel').forEach(panel=>{
    const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);
    const texts=[];while(walker.nextNode()) if(!walker.currentNode.parentElement.closest('a,h1,h2,h3,h4,h5,.marker')) texts.push(walker.currentNode);
    texts.forEach(t=>{
      const matches=[...t.textContent.matchAll(mentionPattern)].filter(m=>titleTargets.get(m[0].toLowerCase())!==current);
      if(!matches.length)return;
      const fragment=document.createDocumentFragment();let offset=0;
      matches.forEach(m=>{fragment.append(t.textContent.slice(offset,m.index));const a=document.createElement('a');a.className='note-link';a.href=topicUrl(titleTargets.get(m[0].toLowerCase()));a.textContent=m[0];fragment.append(a);offset=m.index+m[0].length;});
      fragment.append(t.textContent.slice(offset));t.replaceWith(fragment);
    });
  });
}
renderSidebar = function(){
 const titleCase=s=>s.toLowerCase()==='ent'?'ENT':s.toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase());
 const systems=D.roots.map(id=>`<button class="system-picker" data-system-id="${esc(id)}">${esc(titleCase(node(id).title))}</button>`).join('');
 systemNav.innerHTML=`<div class="systems-drill"><button class="drill-title" aria-expanded="true">Systems</button><div class="system-list">${systems}</div><div class="drill-panel" hidden></div></div><details class="tree-group"><summary class="tree-group-title">High-yield</summary><div class="tree-children">${D.roots.map(id=>`<div class="tree-leaf"><a class="tree-link" href="#/high-yield/${encodeURIComponent(id)}">${esc(titleCase(node(id).title))}</a></div>`).join('')}</div></details>`;
 systemNav.querySelector('.drill-title').onclick=()=>{const l=systemNav.querySelector('.system-list');l.hidden=!l.hidden;};
 systemNav.querySelectorAll('.system-picker').forEach(btn=>btn.onclick=()=>{const box=systemNav.querySelector('.drill-panel'); const id=btn.dataset.systemId; const renderLevel=(parent)=>{const n=node(parent); box.innerHTML=`<button class="drill-back">← ${parent===id?'All systems':titleCase(node(node(parent).parent).title)}</button><div class="drill-heading">${esc(titleCase(n.title))}</div>`+n.children.map(cid=>{const c=node(cid); return c.children.length?`<button class="topic-picker" data-topic-id="${esc(cid)}">${esc(titleCase(c.title))} <span>›</span></button>`:`<a class="tree-link" href="${topicUrl(cid)}">${esc(titleCase(c.title))}</a>`}).join(''); box.hidden=false; systemNav.querySelector('.system-list').hidden=true; box.querySelector('.drill-back').onclick=()=>{if(parent===id){box.hidden=true;systemNav.querySelector('.system-list').hidden=false;}else renderLevel(node(parent).parent);}; box.querySelectorAll('.topic-picker').forEach(x=>x.onclick=()=>renderLevel(x.dataset.topicId));}; renderLevel(id);});
};
highlight = function(text,terms){
  if(!terms.length)return esc(text);
  const pattern=new RegExp(terms.filter(Boolean).sort((a,b)=>b.length-a.length).map(regexEscape).join('|'),'gi');
  let result='',offset=0;for(const m of text.matchAll(pattern)){result+=esc(text.slice(offset,m.index))+'<mark>'+esc(m[0])+'</mark>';offset=m.index+m[0].length;}return result+esc(text.slice(offset));
};
const normalizeSearch=s=>s.toLowerCase().replace(/[’‘]/g,"'").replace(/[–—]/g,'-');
let searchScope='',searchLimit=60;
searchPage = function(query){
  let q;try{q=decodeURIComponent(query||'').trim();}catch{q=query||'';}
  searchInput.value=q;
  const terms=normalizeSearch(q).split(/\s+/).filter(Boolean),results=[];
  if(terms.length)Object.values(D.nodes).forEach(n=>{
    if(searchScope&&systemOf(n.id)!==searchScope)return;
    if(terms.every(t=>normalizeSearch(n.title).includes(t)))results.push({n,b:null,text:n.title,score:normalizeSearch(n.title)===normalizeSearch(q)?3:2});
    n.blocks.forEach(b=>{const text=textOfBlock(b);if(terms.every(t=>normalizeSearch(text).includes(t)))results.push({n,b,text,score:1});});
  });
  results.sort((a,b)=>b.score-a.score||a.n.order-b.n.order);
  app.innerHTML=`<div class="page"><div class="crumbs"><a href="#/home">Home</a> / Search</div><h1>Search your notes</h1><div class="search-controls"><label for="searchSystem">System</label><select id="searchSystem"><option value="">All systems</option>${D.roots.map(id=>`<option value="${esc(id)}" ${searchScope===id?'selected':''}>${esc(node(id).title)}</option>`).join('')}</select><span role="status">${results.length} results · showing ${Math.min(results.length,searchLimit)}</span></div><div class="search-results">${results.slice(0,searchLimit).map(r=>{
    const index=Math.max(0,normalizeSearch(r.text).indexOf(terms[0])),start=Math.max(0,index-85);
    const excerpt=(start?'…':'')+r.text.slice(start,start+320)+(r.text.length>start+320?'…':'');
    return `<a class="search-result" href="${r.b?topicUrl(r.n.id,r.b.index):topicUrl(r.n.id)}"><div class="search-path">${esc(pathIds(r.n.id).map(x=>node(x).title).join(' › '))}</div><div class="search-result-title">${highlight(r.n.title,terms)}${r.b?'':' <span class="pill">Topic</span>'}</div><div class="search-excerpt">${highlight(excerpt,terms)}</div></a>`;
  }).join('')||'<div class="search-result">No matches. Try fewer words or select all systems.</div>'}</div>${results.length>searchLimit?'<button class="btn" id="moreResults">Show more results</button>':''}</div>`;
  document.getElementById('searchSystem').onchange=e=>{searchScope=e.target.value;searchLimit=60;searchPage(encodeURIComponent(q));};
  document.getElementById('moreResults')?.addEventListener('click',()=>{searchLimit+=60;const y=scrollY;searchPage(encodeURIComponent(q));scrollTo(0,y);});
};
const baseRoute=route;
route=function(){baseRoute();renderSidebar();linkMentions();if(!location.hash.startsWith('#/topic/')||location.hash.split('/').length<4)window.scrollTo(0,0);};
removeEventListener('hashchange',baseRoute);addEventListener('hashchange',route);
let searchTimer;
searchInput.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{const q=searchInput.value.trim();if(q){searchLimit=60;location.hash='#/search/'+encodeURIComponent(q);}},300);});
// Keep focus in the search field while typing rather than moving it into results.
const baseFocus=app.focus.bind(app);app.focus=options=>{if(document.activeElement!==searchInput)baseFocus(options);};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();searchInput.focus();searchInput.select();}if(e.key==='Escape'){clearTimeout(searchTimer);closeMobileNav();document.getElementById('menuBtn').setAttribute('aria-expanded','false');}});
const menu=document.getElementById('menuBtn');menu.setAttribute('aria-controls','sidebar');menu.setAttribute('aria-expanded','false');menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',String(sidebar.classList.contains('open'))));
searchInput.setAttribute('aria-label','Search your notes');searchInput.placeholder='Search notes…';
route();
relatedTopics=function(id){
  const excluded=new Set(allDesc(id,true));
  const mentions=new Set([...nodeSubtreeText(id).matchAll(mentionPattern)].map(m=>titleTargets.get(m[0].toLowerCase())));
  const found=[...mentions].filter(x=>!excluded.has(x)).map(node);
  return found.length?`<div class="related"><h3>Other note topics mentioned here</h3><div class="chip-row">${found.map(n=>`<a class="chip" href="${topicUrl(n.id)}">${esc(n.title)}</a>`).join('')}</div></div>`:'';
};
const originalCloseNav=closeMobileNav;
closeMobileNav=function(){originalCloseNav();menu.setAttribute('aria-expanded','false');};
route();
