/* V43: question bank dashboard. Stable IDs preserve browser progress across releases. */
(()=>{
'use strict';
const bank=window.PETER_MCQ_BANK,questions=bank.questions,byId=Object.fromEntries(questions.map(q=>[q.id,q]));
const KEY='md-database-mcq-progress-v1';let state={results:{},bookmarks:[],session:null},storageOK=true;
try{
 const s=JSON.parse(localStorage.getItem(KEY)||'null');
 if(s&&typeof s==='object'){
  if(s.results&&typeof s.results==='object')for(const [id,r] of Object.entries(s.results))if(byId[id]&&r&&Number.isInteger(r.choice)&&r.choice>=0&&r.choice<5&&r.revision===byId[id].revision)state.results[id]=r;
  if(Array.isArray(s.bookmarks))state.bookmarks=[...new Set(s.bookmarks.filter(id=>byId[id]))];
  const a=s.session;
  if(a&&Array.isArray(a.ids)&&a.ids.length&&a.ids.every(id=>byId[id])&&Number.isInteger(a.index)&&a.index>=0&&a.index<a.ids.length){
   const answers={};for(const [id,v] of Object.entries(a.answers||{}))if(a.ids.includes(id)&&Number.isInteger(v)&&v>=0&&v<5)answers[id]=v;
   state.session={ids:[...new Set(a.ids)],index:a.index,answers,drafts:Object.fromEntries(Object.entries(a.drafts||{}).filter(([id,v])=>a.ids.includes(id)&&Number.isInteger(v)&&v>=0&&v<5)),done:!!a.done,name:typeof a.name==='string'?a.name.slice(0,80):'',choice:Number.isInteger(a.choice)&&a.choice>=0&&a.choice<5?a.choice:null};
  }
 }
}catch{storageOK=false;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}}
const E=esc;
function scoped(id){return questions.filter(q=>!id||q.topic===id||pathIds(q.topic).includes(id));}
function scope(){try{return decodeURIComponent(location.hash.split('/')[2]||'');}catch{return '';}}
function shell(body){
 closeMobileNav();document.querySelectorAll('.nav-item,.system-link').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-current');});
 const nav=document.querySelector('[data-route="mcq"]');nav?.classList.add('active');nav?.setAttribute('aria-current','page');
 app.innerHTML=`<div class="mcq-page"><header class="mcq-header"><div class="eyebrow">Renal pilot · Study mode</div><h1>MCQ Practice</h1><p>AI-generated questions · Five options · One best answer</p></header>${body}<p class="mcq-storage" role="status">${storageOK?'Progress saves in this browser on this device. Clearing site data removes it; other devices do not sync.':'Browser storage is unavailable. You can practise, but progress may be lost when you leave.'}</p></div>`;
 app.focus({preventScroll:true});
 app.querySelectorAll('[data-mcq]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.mcq,b.dataset.value)));
}
let setup=null;
function title(id){const t=node(id)?.title||id;return id==='ent'?'ENT':t.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());}
function chosen(){
 return questions.filter(q=>setup.topics.includes(q.topic)).filter(q=>setup.source==='all'||setup.source==='unseen'&&!state.results[q.id]||setup.source==='incorrect'&&state.results[q.id]&&state.results[q.id].choice!==q.answer||setup.source==='bookmarks'&&state.bookmarks.includes(q.id));
}
function refreshSetup(){
 const pool=chosen(),limit=setup.limit==='all'?pool.length:Math.min(Number(setup.limit),pool.length);
 const found=app.querySelector('#mcq-found');if(found)found.textContent=pool.length+' question'+(pool.length===1?'':'s')+' found';
 const sub=app.querySelector('#mcq-session-count');if(sub)sub.textContent=limit?limit+' in this session':'Choose a category or change your question filter.';
 const start=app.querySelector('[data-mcq="configured-start"]');if(start)start.disabled=!pool.length;
 const topics=[...new Set(questions.map(q=>q.topic))];
 app.querySelectorAll('[data-mcq-select-all]').forEach(c=>{c.checked=topics.every(t=>setup.topics.includes(t));c.indeterminate=!c.checked&&setup.topics.length>0;});
 app.querySelectorAll('[data-mcq-system]').forEach(c=>{const ids=[...new Set(questions.filter(q=>q.system===c.dataset.mcqSystem).map(q=>q.topic))];c.checked=ids.length>0&&ids.every(t=>setup.topics.includes(t));c.indeterminate=!c.checked&&ids.some(t=>setup.topics.includes(t));});
 app.querySelectorAll('[data-mcq-topic]').forEach(c=>{c.checked=setup.topics.includes(c.dataset.mcqTopic);});
}
function menu(){
 const id=scope();if(!setup||setup.scope!==id)setup={scope:id,topics:[...new Set(scoped(id).map(q=>q.topic))],source:'all',order:'random',limit:'all',name:''};
 const attempted=questions.filter(q=>state.results[q.id]),right=attempted.filter(q=>state.results[q.id].choice===q.answer),wrong=attempted.length-right.length,total=questions.length;
 const stat=list=>`${list.filter(q=>state.results[q.id]).length} of ${list.length} attempted`;
 shell(`<section class="mcq-bank-hero"><div class="eyebrow">Your medical question bank</div><h1>Question bank</h1><p>Choose what you want to practise, then build your session.</p><div class="mcq-bank-progress" role="img" aria-label="${right.length} correct, ${wrong} incorrect, ${total-attempted.length} unanswered"><span class="correct" style="width:${100*right.length/total}%"></span><span class="incorrect" style="width:${100*wrong/total}%"></span></div><p class="mcq-bank-score">${attempted.length?`You've answered <strong>${attempted.length}</strong> of ${total} questions. Your latest-answer score is <strong>${Math.round(right.length/attempted.length*100)}%</strong>.`:'Ready when you are. Your progress will appear here as you answer questions.'}</p><div class="mcq-bank-legend"><span><i class="correct"></i>Correct</span><span><i class="incorrect"></i>Incorrect</span><span><i class="unanswered"></i>Unanswered</span></div>${state.session?`<button class="btn secondary" data-mcq="resume">${state.session.done?'Review Last Session':'Resume Session'}${state.session.name?' · '+E(state.session.name):''}</button>`:''}</section><div class="mcq-launch-bar"><div><strong id="mcq-found" role="status"></strong><small id="mcq-session-count"></small></div><button class="btn" data-mcq="configured-start">Start the questions <span aria-hidden="true">→</span></button></div><div class="mcq-bank-columns"><section class="mcq-bank-panel"><h2>Categories</h2><div class="mcq-category-list"><div class="mcq-category-row"><label><input type="checkbox" data-mcq-select-all>All available categories</label><small>${stat(questions)}</small></div>${D.roots.map(system=>{
 const qs=questions.filter(q=>q.system===system),topics=[...new Set(qs.map(q=>q.topic))].sort((a,b)=>node(a).title.localeCompare(node(b).title));
 if(!qs.length)return `<div class="mcq-category-row unavailable"><label><input type="checkbox" disabled>${E(title(system))}</label><small>Not available yet</small></div>`;
 return `<div class="mcq-category-row"><label><input type="checkbox" data-mcq-system="${E(system)}">${E(title(system))}</label><button class="mcq-category-toggle" aria-label="Show ${E(title(system))} topics" aria-controls="mcq-topics-${E(system)}" aria-expanded="${!!id}" data-mcq="toggle-topics" data-value="${E(system)}">${id?'−':'+'}</button><small>${stat(qs)}</small></div><div class="mcq-category-topics" id="mcq-topics-${E(system)}" ${id?'':'hidden'}>${topics.map(t=>`<div class="mcq-category-row"><label><input type="checkbox" data-mcq-topic="${E(t)}">${E(node(t).title)}</label><small>${stat(qs.filter(q=>q.topic===t))}</small></div>`).join('')}</div>`;
 }).join('')}</div><p class="mcq-panel-note">Renal pilot: 20 sourced questions. More systems can be added to this same question bank.</p></section><section class="mcq-bank-panel mcq-settings"><h2>Question settings</h2><div class="mcq-setting"><span class="mcq-setting-label">Question mode</span><div class="mcq-mode-label">Study mode</div><p>One question at a time, with feedback after you check your answer.</p></div><div class="mcq-setting"><label for="mcq-source">Questions to include</label><select id="mcq-source"><option value="all">All questions</option><option value="unseen">New questions only</option><option value="incorrect">Previously incorrect</option><option value="bookmarks">Bookmarked questions</option></select></div><div class="mcq-setting"><label for="mcq-order">Question order</label><select id="mcq-order"><option value="random">Random order</option><option value="topic">Group by topic</option></select></div><div class="mcq-setting"><label for="mcq-limit">Session length</label><select id="mcq-limit"><option value="all">All matching questions</option><option value="5">Up to 5 questions</option><option value="10">Up to 10 questions</option><option value="20">Up to 20 questions</option></select></div><div class="mcq-setting"><label for="mcq-name">Session name <span>(optional)</span></label><input id="mcq-name" maxlength="80" placeholder="e.g. Renal revision" value="${E(setup.name)}"></div><p class="mcq-panel-note">AI-generated questions, with textbook references or external source links in every explanation. Some test sourced additions beyond your original notes.</p></section></div>`);
 app.querySelector('.mcq-header')?.remove();app.querySelector('.mcq-page').classList.add('mcq-bank-home');
 for(const key of ['source','order','limit']){const el=app.querySelector('#mcq-'+key);el.value=setup[key];el.addEventListener('change',()=>{setup[key]=el.value;refreshSetup();});}
 app.querySelector('#mcq-name').addEventListener('input',e=>{setup.name=e.target.value.slice(0,80);});
 app.querySelector('[data-mcq-select-all]').addEventListener('change',e=>{setup.topics=e.target.checked?[...new Set(questions.map(q=>q.topic))]:[];refreshSetup();});
 app.querySelectorAll('[data-mcq-system]').forEach(el=>el.addEventListener('change',()=>{const ids=[...new Set(questions.filter(q=>q.system===el.dataset.mcqSystem).map(q=>q.topic))];setup.topics=setup.topics.filter(t=>!ids.includes(t)).concat(el.checked?ids:[]);refreshSetup();}));
 app.querySelectorAll('[data-mcq-topic]').forEach(el=>el.addEventListener('change',()=>{setup.topics=setup.topics.filter(t=>t!==el.dataset.mcqTopic);if(el.checked)setup.topics.push(el.dataset.mcqTopic);refreshSetup();}));
 refreshSetup();
}
function sources(q){
 const external=q.refs.map(id=>{const s=bank.sources[id];return `<li><a href="${E(s.url)}" target="_blank" rel="noopener noreferrer">${E(s.title)}</a></li>`;});
 const books=q.bookRefs.map(r=>{const b=window.PETER_TEXTBOOK_CONTENT.books[r.book];return `<li>${E(b.title)}, ${E(b.edition)}. PDF pages ${r.pdfPages.join(', ')} (uploaded copy).</li>`;});
 return `<details class="mcq-sources"><summary>Sources and provenance</summary><p>AI-generated question and explanation using the sources below; not copied from an exam or question bank. External references checked 1 October 2026.</p><ul>${external.concat(books).join('')}</ul></details>`;
}
function question(){
 const s=state.session;if(!s)return menu();if(s.done)return results();const q=byId[s.ids[s.index]],checked=Object.hasOwn(s.answers,q.id),choice=checked?s.answers[q.id]:s.choice;
 shell(`<div class="mcq-topline"><button class="btn secondary" data-mcq="menu">Save & Exit</button><span>${s.name?E(s.name)+' · ':''}Question ${s.index+1} of ${s.ids.length}</span><button class="btn secondary" data-mcq="bookmark" aria-pressed="${state.bookmarks.includes(q.id)}">${state.bookmarks.includes(q.id)?'Bookmarked':'Bookmark'}</button></div><progress value="${Object.keys(s.answers).length}" max="${s.ids.length}" aria-label="Session progress"></progress><section class="mcq-card"><h2 class="mcq-stem" id="mcq-stem">${E(q.stem)}</h2><fieldset class="mcq-options" ${checked?'disabled':''}><legend class="sr-only">Choose one answer</legend>${q.options.map((o,i)=>`<label class="mcq-option ${checked&&i===q.answer?'is-correct':checked&&i===choice?'is-wrong':''}"><input type="radio" name="mcq-choice" value="${i}" ${choice===i?'checked':''}><span class="mcq-letter">${'ABCDE'[i]}</span><span>${E(o.text)}${checked&&i===q.answer?' <strong>— Correct answer</strong>':checked&&i===choice?' <strong>— Your answer</strong>':''}</span></label>`).join('')}</fieldset>${checked?`<section class="mcq-feedback" role="status"><h3>${choice===q.answer?'Correct':'Not quite'} · Answer ${'ABCDE'[q.answer]}</h3><p>${E(q.options[q.answer].why)}</p><details><summary>Why the other options are less appropriate</summary><ul>${q.options.map((o,i)=>i===q.answer?'':`<li><strong>${'ABCDE'[i]}: ${E(o.text)}</strong><br>${E(o.why)}</li>`).join('')}</ul></details><p class="mcq-takeaway"><strong>Key learning point:</strong> ${E(q.takeaway)}</p><a class="text-link" href="${topicUrl(q.topic)}">Review this topic in your notes →</a>${sources(q)}</section><button class="btn" data-mcq="next">${Object.keys(s.answers).length===s.ids.length?'View Results':s.index===s.ids.length-1?'Next Unanswered':'Next Question'}</button>`:`<button class="btn" data-mcq="check" ${choice===null?'disabled':''}>Check Answer</button>`}</section>`);
 questionList();
 app.querySelectorAll('input[name="mcq-choice"]').forEach(input=>input.addEventListener('change',()=>{s.choice=Number(input.value);s.drafts=s.drafts||{};s.drafts[q.id]=s.choice;save();app.querySelector('[data-mcq="check"]').disabled=false;const message=app.querySelector('.mcq-storage');if(!storageOK)message.textContent='Browser storage is unavailable. Progress may be lost when you leave.';}));
}
function questionList(){
 const s=state.session,page=app.querySelector('.mcq-page'),layout=document.createElement('div'),main=document.createElement('div'),aside=document.createElement('aside');
 layout.className='mcq-answer-layout';main.className='mcq-answer-main';aside.className='mcq-question-rail';aside.setAttribute('aria-label','Question navigation');
 for(const child of [...page.children])if(!child.matches('.mcq-header,.mcq-storage'))main.append(child);
 const answered=Object.keys(s.answers).length;
 aside.innerHTML=`<h2>Questions</h2><p>${answered} of ${s.ids.length} answered</p><nav aria-label="Move between questions">${s.ids.map((id,i)=>{const q=byId[id],answered=Object.hasOwn(s.answers,id),status=answered?(s.answers[id]===q.answer?'Correct':'Incorrect'):'Unanswered',mark=state.bookmarks.includes(id);return `<button type="button" data-question-index="${i}" class="mcq-question-link ${status.toLowerCase()}" ${s.index===i?'aria-current="step"':''} aria-label="Question ${i+1}, ${status}${mark?', bookmarked':''}"><span class="mcq-question-number">${i+1}</span><span class="mcq-question-word">Question ${i+1}</span><span class="mcq-question-status">${answered?(status==='Correct'?'✓':'×'):'○'}${mark?' ★':''}</span></button>`;}).join('')}</nav><button class="btn secondary" data-finish-session ${answered===s.ids.length?'':'disabled'}>View Results</button>`;
 layout.append(main,aside);page.querySelector('.mcq-header').after(layout);page.classList.add('mcq-with-rail');
 aside.querySelectorAll('[data-question-index]').forEach(button=>button.addEventListener('click',()=>{if(s.choice!==null&&!Object.hasOwn(s.answers,s.ids[s.index])){s.drafts=s.drafts||{};s.drafts[s.ids[s.index]]=s.choice;}s.index=Number(button.dataset.questionIndex);s.choice=s.drafts?.[s.ids[s.index]]??null;save();question();}));
 aside.querySelector('[data-finish-session]').addEventListener('click',()=>{if(Object.keys(s.answers).length===s.ids.length){s.done=true;save();results();}});
}
function results(){
 const s=state.session;if(!s)return menu();const done=s.ids.filter(id=>Object.hasOwn(s.answers,id)),right=done.filter(id=>s.answers[id]===byId[id].answer);
 shell(`<section class="mcq-card"><h2>Session complete</h2><p class="mcq-score">${right.length} / ${s.ids.length}</p><p>Review any explanation below or retry the questions you missed.</p><div class="mcq-actions"><button class="btn" data-mcq="retry-session" ${right.length===s.ids.length?'disabled':''}>Retry Missed Questions</button><button class="btn secondary" data-mcq="menu">Question Bank</button></div></section>${s.ids.map(id=>{const q=byId[id],correct=s.answers[id]===q.answer;return `<details class="mcq-card"><summary>${correct?'Correct':'Incorrect'} · ${E(q.topicTitle)}</summary><h3>${E(q.stem)}</h3><p>Your answer: ${E(q.options[s.answers[id]]?.text||'Not answered')}</p><p><strong>Correct answer: ${E(q.options[q.answer].text)}</strong></p><ul>${q.options.map((o,i)=>`<li><strong>${'ABCDE'[i]}: ${E(o.text)}</strong> — ${E(o.why)}</li>`).join('')}</ul><p>${E(q.takeaway)}</p><a href="${topicUrl(q.topic)}">Review this topic</a>${sources(q)}</details>`;}).join('')}`);
}
function start(ids,order='random',limit='all',name=''){if(!ids.length)return;const shuffled=ids.slice();if(order==='topic')shuffled.sort((a,b)=>byId[a].topicTitle.localeCompare(byId[b].topicTitle)||a.localeCompare(b));else for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}state.session={ids:limit==='all'?shuffled:shuffled.slice(0,Number(limit)),index:0,answers:{},drafts:{},choice:null,done:false,name};save();question();}
function action(type,value){
 const s=state.session,q=s&&byId[s.ids[s.index]];
 if(type==='configured-start')start(chosen().map(q=>q.id),setup.order,setup.limit,setup.name.trim());
 if(type==='toggle-topics'){const panel=app.querySelector('#mcq-topics-'+value),button=app.querySelector('[data-mcq="toggle-topics"][data-value="'+value+'"]');panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));button.textContent=panel.hidden?'+':'−';}
 if(type==='menu'){save();menu();}
 if(type==='resume')question();
 if(type==='start')start(scoped(scope()).filter(q=>value==='all'||value==='unseen'&&!state.results[q.id]||value==='incorrect'&&state.results[q.id]&&state.results[q.id].choice!==q.answer||value==='bookmarks'&&state.bookmarks.includes(q.id)).map(q=>q.id));
 if(type==='bookmark'&&q){state.bookmarks=state.bookmarks.includes(q.id)?state.bookmarks.filter(id=>id!==q.id):state.bookmarks.concat(q.id);save();const b=app.querySelector('[data-mcq="bookmark"]');b.textContent=state.bookmarks.includes(q.id)?'Bookmarked':'Bookmark';b.setAttribute('aria-pressed',String(state.bookmarks.includes(q.id)));question();}
 if(type==='check'&&q&&s.choice!==null&&!Object.hasOwn(s.answers,q.id)){
  s.answers[q.id]=s.choice;state.results[q.id]={choice:s.choice,revision:q.revision,attempts:(state.results[q.id]?.attempts||0)+1,at:new Date().toISOString()};save();question();
 }
 if(type==='next'&&q&&Object.hasOwn(s.answers,q.id)){if(Object.keys(s.answers).length===s.ids.length)s.done=true;else{if(s.index<s.ids.length-1)s.index++;else s.index=s.ids.findIndex(id=>!Object.hasOwn(s.answers,id));s.choice=s.drafts?.[s.ids[s.index]]??null;}save();question();}
 if(type==='retry-session'&&s)start(s.ids.filter(id=>s.answers[id]!==byId[id].answer));
}
function addPractice(id){if(!scoped(id).length||app.querySelector('.mcq-topic-button'))return;const a=document.createElement('a');a.className='btn secondary mcq-topic-button';a.href='#/mcq/'+encodeURIComponent(id);a.textContent='Practise This Topic';app.querySelector('.topic-header')?.append(a);}
const oldTopic=topicPage;topicPage=function(id,block=null){oldTopic(id,block);addPractice(id);};
const oldSystem=systemPage;systemPage=function(id){oldSystem(id);addPractice(id);};
const oldRoute=route;removeEventListener('hashchange',oldRoute);route=function(){if(location.hash==='#/mcq'||location.hash.startsWith('#/mcq/')){menu();}else{document.querySelector('[data-route="mcq"]')?.removeAttribute('aria-current');oldRoute();}};addEventListener('hashchange',route);route();
})();
