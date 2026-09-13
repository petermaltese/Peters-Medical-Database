const D = window.PETER_NOTES_V2;
const app = document.getElementById("app");
const searchInput = document.getElementById("search");
const systemNav = document.getElementById("systemNav");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("sidebarBackdrop");

const genericRelated = new Set([
  "treatment","management","investigations","diagnosis","epidemiology","aetiology",
  "pathogenesis","risk factors","clinical features","blood tests","screening",
  "pharmacotherapy","anatomy","physiology","staging","grading","types of hearing loss"
]);

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function node(id){ return D.nodes[id]; }
function topicUrl(id, block=null){ return `#/topic/${encodeURIComponent(id)}${block!==null?"/"+block:""}`; }
function children(id){ return node(id)?.children || []; }
function allDesc(id, includeSelf=false){
  const out=[]; if(includeSelf) out.push(id);
  const walk=x=>children(x).forEach(c=>{out.push(c);walk(c)}); walk(id); return out;
}
function pathIds(id){
  const arr=[]; let cur=node(id);
  while(cur){arr.unshift(cur.id);cur=cur.parent?node(cur.parent):null}
  return arr;
}
function systemOf(id){ return pathIds(id)[0]; }
function subtreeBlockCount(id){ return allDesc(id,true).reduce((n,x)=>n+node(x).blocks.length,0); }
function descendantCount(id){ return allDesc(id,false).length; }
function directChildLabel(id){
  const n=node(id); return n.level===1 ? `${n.children.length} major topics` : `${n.children.length} subtopic${n.children.length===1?"":"s"}`;
}
function textOfBlock(b){
  if(b.type==="table") return b.rows.flat().join(" ");
  return b.text || "";
}
function nodeSubtreeText(id){ return allDesc(id,true).flatMap(x=>node(x).blocks.map(textOfBlock)).join(" "); }

function setActive(){
  document.querySelectorAll(".nav-item,.system-link").forEach(x=>x.classList.remove("active"));
  const h=location.hash||"#/home";
  if(h.startsWith("#/browse")) document.querySelector('[data-route="browse"]')?.classList.add("active");
  else if(h.startsWith("#/topic/")){
    const id=decodeURIComponent(h.split("/")[2]||"");
    const sys=systemOf(id);
    document.querySelector(`[data-system="${CSS.escape(sys||"")}"]`)?.classList.add("active");
  } else document.querySelector('[data-route="home"]')?.classList.add("active");
}
function closeMobileNav(){sidebar.classList.remove("open");backdrop.classList.remove("show")}

function renderSidebar(){
  systemNav.innerHTML=D.roots.map(id=>{
    const n=node(id);
    return `<a class="system-link" data-system="${esc(id)}" href="${topicUrl(id)}"><span>${esc(n.title)}</span><span class="count">${n.children.length}</span></a>`
  }).join("");
}

function breadcrumbs(id){
  return `<div class="crumbs"><a href="#/home">Home</a><span class="sep">/</span>${
    pathIds(id).map((x,i,a)=>i===a.length-1?`<span>${esc(node(x).title)}</span>`:`<a href="${topicUrl(x)}">${esc(node(x).title)}</a><span class="sep">/</span>`).join("")
  }</div>`;
}

function home(){
  const totalBlocks=D.stats.contentBlocks;
  app.innerHTML=`<div class="page">
    <section class="hero">
      <div class="crumbs">YOUR PERSONAL MEDICAL KNOWLEDGE BASE</div>
      <h1>Your notes, properly navigable.</h1>
      <p>Browse the same hierarchy already present in your document, open any topic, follow its subtopics, and search directly into the relevant note section.</p>
      <div class="stats">
        <div class="stat"><strong>${D.stats.systems}</strong><span>systems</span></div>
        <div class="stat"><strong>${D.stats.topics}</strong><span>linked topics</span></div>
        <div class="stat"><strong>${totalBlocks.toLocaleString()}</strong><span>note blocks</span></div>
      </div>
      <div class="hero-actions"><a class="btn primary" href="#/browse">Browse your topics</a></div>
    </section>
    <div class="notice"><strong>Source rule:</strong> ${esc(D.sourceRule)} Version 2 focuses on text, lists and tables; embedded Word images are not yet displayed.</div>
    <div class="section-title">Systems</div>
    <div class="grid">${D.roots.map(id=>{
      const n=node(id);
      return `<a class="card" href="${topicUrl(id)}"><div class="eyebrow">System</div><h3>${esc(n.title)}</h3><p>${n.children.length} major topics · ${subtreeBlockCount(id).toLocaleString()} note blocks</p></a>`
    }).join("")}</div>
  </div>`;
}

function browse(){
  app.innerHTML=`<div class="page">
    <div class="crumbs"><a href="#/home">Home</a><span class="sep">/</span><span>Browse</span></div>
    <h1>Browse all topics</h1>
    <p class="page-lead">The links below come from the heading structure in your Word notes.</p>
    ${D.roots.map(r=>{
      const root=node(r);
      return `<section class="system-block">
        <div class="system-heading"><h2>${esc(root.title)}</h2><a class="text-link" href="${topicUrl(r)}">Open system →</a></div>
        <div class="grid">${root.children.map(c=>{
          const n=node(c);return `<a class="card" href="${topicUrl(c)}"><h3>${esc(n.title)}</h3><p>${directChildLabel(c)} · ${subtreeBlockCount(c)} note blocks</p></a>`
        }).join("")}</div>
      </section>`
    }).join("")}
  </div>`;
}

function systemPage(id){
  const n=node(id);
  app.innerHTML=`<div class="page">
    ${breadcrumbs(id)}
    <header class="topic-header">
      <h1>${esc(n.title)}</h1>
      <p class="page-lead">Choose a major topic to open the content underneath it.</p>
      <div class="topic-meta"><span class="pill">${n.children.length} major topics</span><span class="pill">${subtreeBlockCount(id)} note blocks</span></div>
    </header>
    ${n.blocks.length?`<div class="section-title">System-level notes</div><div class="article-panel">${renderBlocks(n.blocks)}</div>`:""}
    <div class="section-title">Topics</div>
    <div class="grid">${n.children.map(c=>{
      const x=node(c);
      return `<a class="card" href="${topicUrl(c)}"><h3>${esc(x.title)}</h3><p>${x.children.length?directChildLabel(c)+" · ":""}${subtreeBlockCount(c)} note blocks</p></a>`
    }).join("")}</div>
  </div>`;
}

function renderBlocks(blocks){
  if(!blocks.length) return `<div class="empty-note">No direct text is stored under this heading before its next subheading.</div>`;
  let numberCounters={};
  return blocks.map(b=>{
    const id=`block-${b.index}`;
    if(b.type==="p"){
      if(b.role==="label") return `<div class="local-label flash-target" id="${id}">${b.html}</div>`;
      return `<div class="note-paragraph flash-target" id="${id}">${b.html}</div>`;
    }
    if(b.type==="list"){
      const lvl=Math.max(0,Math.min(6,b.level||0));
      let marker="•";
      if(b.listType==="number"){
        numberCounters[lvl]=(numberCounters[lvl]||0)+1;
        Object.keys(numberCounters).forEach(k=>{if(Number(k)>lvl) delete numberCounters[k]});
        marker=numberCounters[lvl]+".";
      } else {
        marker=["•","◦","▪","–"][Math.min(lvl,3)];
      }
      return `<div class="note-bullet flash-target" id="${id}" style="--level:${lvl}"><span class="marker">${marker}</span><div>${b.html}</div></div>`;
    }
    if(b.type==="table"){
      return `<div class="table-wrap flash-target" id="${id}"><table><tbody>${b.rows.map(row=>`<tr>${row.map(c=>`<td>${esc(c).replace(/\n/g,"<br>")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    }
    return "";
  }).join("");
}

function renderSection(id, rootLevel, isRoot=false){
  const n=node(id);
  const depth=Math.max(1,n.level-rootLevel+1);
  const headingLevel=Math.min(5, isRoot?2:Math.max(2,depth+1));
  const headingTag=`h${headingLevel}`;
  const header=isRoot
    ? ""
    : `<div class="topic-section-header"><${headingTag}>${esc(n.title)}</${headingTag}><a class="open-topic" href="${topicUrl(id)}">Open as topic ↗</a></div>`;
  return `<section class="topic-section depth-${Math.min(depth,4)}" id="section-${esc(id)}">
    ${header}${renderBlocks(n.blocks)}
    ${n.children.map(c=>renderSection(c,rootLevel,false)).join("")}
  </section>`;
}

function tocEntries(id){
  const base=node(id);
  return allDesc(id,false).map(x=>{
    const n=node(x), depth=Math.max(1,n.level-base.level);
    return `<button class="toc-item" data-scroll="section-${esc(x)}" data-depth="${Math.min(depth,4)}">${esc(n.title)}</button>`
  }).join("");
}

function relatedTopics(id){
  const text=nodeSubtreeText(id).toLowerCase();
  const excluded=new Set(allDesc(id,true));
  const found=Object.values(D.nodes)
    .filter(n=>!excluded.has(n.id) && n.level<=4 && n.title.length>=5 && !genericRelated.has(n.title.toLowerCase()))
    .filter(n=>text.includes(n.title.toLowerCase()))
    .sort((a,b)=>a.order-b.order)
    .slice(0,18);
  if(!found.length) return "";
  return `<div class="related"><h3>Other note topics mentioned here</h3><div class="chip-row">${
    found.map(n=>`<a class="chip" href="${topicUrl(n.id)}">${esc(n.title)}</a>`).join("")
  }</div></div>`;
}

function siblingNav(id){
  const n=node(id); if(!n.parent) return "";
  const sib=node(n.parent).children;
  const i=sib.indexOf(id);
  const prev=i>0?node(sib[i-1]):null, next=i<sib.length-1?node(sib[i+1]):null;
  return `<div class="topic-nav"><div>${prev?`<a href="${topicUrl(prev.id)}">← ${esc(prev.title)}</a>`:""}</div><div>${next?`<a href="${topicUrl(next.id)}">${esc(next.title)} →</a>`:""}</div></div>`;
}

function topicPage(id, block=null){
  const n=node(id); if(!n){notFound();return}
  if(n.level===1){systemPage(id);afterTopicRender(block);return}
  const desc=allDesc(id,false);
  app.innerHTML=`<div class="page">
    ${breadcrumbs(id)}
    <header class="topic-header">
      <h1>${esc(n.title)}</h1>
      <p class="page-lead">Content below is reorganised directly from your notes.</p>
      <div class="topic-meta"><span class="pill">${subtreeBlockCount(id)} note blocks</span>${desc.length?`<span class="pill">${desc.length} linked subtopic${desc.length===1?"":"s"}</span>`:""}</div>
    </header>
    ${n.children.length?`<div class="section-title">Jump to a subtopic</div><div class="subtopic-grid">${
      n.children.map(c=>{const x=node(c);return `<a class="subtopic-card" href="${topicUrl(c)}"><strong>${esc(x.title)}</strong><span>${subtreeBlockCount(c)} note blocks${x.children.length?` · ${x.children.length} sections`:""}</span></a>`}).join("")
    }</div>`:""}
    <div class="article-layout">
      <article class="article">
        <div class="article-panel">${renderSection(id,n.level,true)}</div>
        ${relatedTopics(id)}
        ${siblingNav(id)}
      </article>
      ${desc.length?`<aside class="page-toc"><div class="page-toc-title">On this page</div>${tocEntries(id)}</aside>`:""}
    </div>
  </div>`;
  afterTopicRender(block);
}

function afterTopicRender(block){
  if(block!==null && block!==undefined){
    requestAnimationFrame(()=>{
      const el=document.getElementById(`block-${block}`);
      if(el){el.scrollIntoView({behavior:"smooth",block:"center"});el.classList.add("flash");setTimeout(()=>el.classList.remove("flash"),1800)}
    });
  }
}

function highlight(text,terms){
  let s=esc(text);
  terms.filter(Boolean).sort((a,b)=>b.length-a.length).forEach(t=>{
    const safe=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    s=s.replace(new RegExp(`(${safe})`,"ig"),"<mark>$1</mark>");
  });
  return s;
}

function searchPage(query){
  const q=decodeURIComponent(query||"").trim();
  searchInput.value=q;
  const terms=q.toLowerCase().split(/\s+/).filter(Boolean);
  const results=[];
  if(terms.length){
    Object.values(D.nodes).forEach(n=>{
      n.blocks.forEach(b=>{
        const text=textOfBlock(b);
        const low=text.toLowerCase();
        if(terms.every(t=>low.includes(t))) results.push({n,b,text});
      });
      if(terms.every(t=>n.title.toLowerCase().includes(t))) results.push({n,b:null,text:n.title});
    });
  }
  app.innerHTML=`<div class="page">
    <div class="crumbs"><a href="#/home">Home</a><span class="sep">/</span><span>Search</span></div>
    <div class="search-head"><h1>Search results</h1><p class="page-lead">${results.length} result${results.length===1?"":"s"} for “${esc(q)}” in your notes.</p></div>
    <div class="search-results">${results.slice(0,180).map(r=>{
      const path=pathIds(r.n.id).map(x=>node(x).title).join(" › ");
      const target=r.b?topicUrl(r.n.id,r.b.index):topicUrl(r.n.id);
      const excerpt=r.text.length>260?r.text.slice(0,260)+"…":r.text;
      return `<a class="search-result" href="${target}"><div class="search-path">${esc(path)}</div><div class="search-result-title">${highlight(r.n.title,terms)}</div><div class="search-excerpt">${highlight(excerpt,terms)}</div></a>`
    }).join("") || `<div class="search-result"><div class="search-excerpt">No matching content found.</div></div>`}</div>
  </div>`;
}

function notFound(){app.innerHTML=`<div class="page"><h1>Topic not found</h1><p class="page-lead">Return to <a class="text-link" href="#/browse">Browse all topics</a>.</p></div>`}

function route(){
  closeMobileNav();
  setActive();
  const hash=location.hash||"#/home";
  const parts=hash.replace(/^#\//,"").split("/");
  const route=parts[0];
  if(route==="browse") browse();
  else if(route==="topic"){
    const id=decodeURIComponent(parts[1]||"");
    const block=parts[2]!==undefined?Number(parts[2]):null;
    topicPage(id,Number.isFinite(block)?block:null);
  } else if(route==="search") searchPage(parts.slice(1).join("/"));
  else home();
  app.focus({preventScroll:true});
}

searchInput.addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    const q=searchInput.value.trim();
    if(q) location.hash=`#/search/${encodeURIComponent(q)}`;
  }
});
searchInput.addEventListener("input",()=>{
  if(!searchInput.value && location.hash.startsWith("#/search/")) location.hash="#/home";
});

document.addEventListener("click",e=>{
  const scroll=e.target.closest("[data-scroll]");
  if(scroll){
    document.getElementById(scroll.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"});
  }
});

document.getElementById("menuBtn").addEventListener("click",()=>{
  sidebar.classList.toggle("open");backdrop.classList.toggle("show");
});
backdrop.addEventListener("click",closeMobileNav);

const themeBtn=document.getElementById("themeToggle");
function setTheme(theme){
  document.documentElement.dataset.theme=theme;
  localStorage.setItem("peter-notes-theme",theme);
  themeBtn.textContent=theme==="dark"?"☀":"☾";
  themeBtn.setAttribute("aria-label",theme==="dark"?"Switch to light mode":"Switch to dark mode");
}
const savedTheme=localStorage.getItem("peter-notes-theme");
setTheme(savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));
themeBtn.addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));

renderSidebar();
addEventListener("hashchange",route);
route();
