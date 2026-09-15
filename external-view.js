const originalTopicPageV5=topicPage;
topicPage=function(id,block=null){
  originalTopicPageV5(id,block);if(!node(id))return; if(node(id).level===1){embedTopicImages(app,id);return;} 
  const article=app.querySelector('.article');const panel=article?.querySelector('.article-panel');if(!panel)return;
  const label=document.createElement('div');label.className='notes-source-label';label.textContent='Your notes · Disease - As Understood By Peter.docx';panel.before(label);label.before(aiHighYieldSection(id));article.append(aiReferencesSection(id)); embedTopicImages(panel,id);

};
const topicHues=[4,190,270,120,35,320,150,220,75,10,245,165,290,55,200,95];
function applyTopicColor(){const id=decodeURIComponent(location.hash.split('/')[2]||''); const idx=D.roots.indexOf(systemOf(id)); app.style.setProperty('--topic-color',`hsl(${topicHues[idx<0?0:idx]} 68% 42%)`);}
const originalRouteV5=route; route=function(){originalRouteV5();applyTopicColor();}; removeEventListener('hashchange',originalRouteV5); addEventListener('hashchange',route);
const originalHomeV5=home;
home=function(){originalHomeV5();const notice=app.querySelector('.notice');if(notice)notice.innerHTML='<strong>Clear sources:</strong> Your Word notes are preserved. Topic pages show separately labelled summaries from external sources below your notes. High yield and search continue to use your notes only. Embedded Word images are not yet displayed.';};
document.querySelector('.source-badge').textContent='ALL SOURCES LABELLED';
route();
(function(){const b=document.createElement('button');b.className='back-top';b.textContent='↑ Back to top';b.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));document.body.append(b);})();
