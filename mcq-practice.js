/* V42: renal study pilot. Stable IDs preserve browser progress across releases. */
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
   state.session={ids:[...new Set(a.ids)],index:a.index,answers,done:!!a.done,choice:Number.isInteger(a.choice)&&a.choice>=0&&a.choice<5?a.choice:null};
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
function menu(){
 const id=scope(),pool=scoped(id),attempted=pool.filter(q=>state.results[q.id]),correct=attempted.filter(q=>state.results[q.id].choice===q.answer),wrong=attempted.filter(q=>state.results[q.id].choice!==q.answer),bookmarked=pool.filter(q=>state.bookmarks.includes(q.id));
 const topics=[...new Set(pool.map(q=>q.topic))];
 shell(`<section class="mcq-card"><h2>${id&&node(id)?E(node(id).title):'Renal question bank'}</h2><p>Clinical scenarios, investigations, mechanisms and management principles. Explanations cite textbooks or linked external sources and may go beyond your original notes.</p><div class="mcq-stats"><span><strong>${pool.length}</strong> questions</span><span><strong>${attempted.length}</strong> attempted</span><span><strong>${correct.length}/${attempted.length}</strong> latest answers correct</span></div><div class="mcq-actions"><button class="btn" data-mcq="start" data-value="all" ${pool.length?'':'disabled'}>Start Practice</button><button class="btn secondary" data-mcq="start" data-value="unseen" ${pool.some(q=>!state.results[q.id])?'':'disabled'}>Unanswered</button><button class="btn secondary" data-mcq="start" data-value="incorrect" ${wrong.length?'':'disabled'}>Retry Incorrect (${wrong.length})</button><button class="btn secondary" data-mcq="start" data-value="bookmarks" ${bookmarked.length?'':'disabled'}>Bookmarks (${bookmarked.length})</button>${state.session?'<button class="btn secondary" data-mcq="resume">'+(state.session.done?'Review Last Session':'Resume Session')+'</button>':''}</div>${id?'<a class="text-link" href="#/mcq">All renal questions</a>':''}</section><section class="mcq-card"><h2>Practise by topic</h2><div class="mcq-topic-list">${topics.map(t=>{const list=pool.filter(q=>q.topic===t),done=list.filter(q=>state.results[q.id]),right=done.filter(q=>state.results[q.id].choice===q.answer);return `<a href="#/mcq/${encodeURIComponent(t)}"><span>${E(node(t).title)}</span><small>${done.length?right.length+'/'+done.length+' latest answers correct':'Not attempted'}</small></a>`;}).join('')}</div></section>`);
}
function sources(q){
 const external=q.refs.map(id=>{const s=bank.sources[id];return `<li><a href="${E(s.url)}" target="_blank" rel="noopener noreferrer">${E(s.title)}</a></li>`;});
 const books=q.bookRefs.map(r=>{const b=window.PETER_TEXTBOOK_CONTENT.books[r.book];return `<li>${E(b.title)}, ${E(b.edition)}. PDF pages ${r.pdfPages.join(', ')} (uploaded copy).</li>`;});
 return `<details class="mcq-sources"><summary>Sources and provenance</summary><p>AI-generated question and explanation using the sources below; not copied from an exam or question bank. External references checked 1 October 2026.</p><ul>${external.concat(books).join('')}</ul></details>`;
}
function question(){
 const s=state.session;if(!s)return menu();if(s.done)return results();const q=byId[s.ids[s.index]],checked=Object.hasOwn(s.answers,q.id),choice=checked?s.answers[q.id]:s.choice;
 shell(`<div class="mcq-topline"><button class="btn secondary" data-mcq="menu">Save & Exit</button><span>Question ${s.index+1} of ${s.ids.length}</span><button class="btn secondary" data-mcq="bookmark" aria-pressed="${state.bookmarks.includes(q.id)}">${state.bookmarks.includes(q.id)?'Bookmarked':'Bookmark'}</button></div><progress value="${s.index}" max="${s.ids.length}" aria-label="Session progress"></progress><section class="mcq-card"><h2 class="mcq-stem" id="mcq-stem">${E(q.stem)}</h2><fieldset class="mcq-options" ${checked?'disabled':''}><legend class="sr-only">Choose one answer</legend>${q.options.map((o,i)=>`<label class="mcq-option ${checked&&i===q.answer?'is-correct':checked&&i===choice?'is-wrong':''}"><input type="radio" name="mcq-choice" value="${i}" ${choice===i?'checked':''}><span class="mcq-letter">${'ABCDE'[i]}</span><span>${E(o.text)}${checked&&i===q.answer?' <strong>— Correct answer</strong>':checked&&i===choice?' <strong>— Your answer</strong>':''}</span></label>`).join('')}</fieldset>${checked?`<section class="mcq-feedback" role="status"><h3>${choice===q.answer?'Correct':'Not quite'} · Answer ${'ABCDE'[q.answer]}</h3><p>${E(q.options[q.answer].why)}</p><details><summary>Why the other options are less appropriate</summary><ul>${q.options.map((o,i)=>i===q.answer?'':`<li><strong>${'ABCDE'[i]}: ${E(o.text)}</strong><br>${E(o.why)}</li>`).join('')}</ul></details><p class="mcq-takeaway"><strong>Key learning point:</strong> ${E(q.takeaway)}</p><a class="text-link" href="${topicUrl(q.topic)}">Review this topic in your notes →</a>${sources(q)}</section><button class="btn" data-mcq="next">${s.index===s.ids.length-1?'View Results':'Next Question'}</button>`:`<button class="btn" data-mcq="check" ${choice===null?'disabled':''}>Check Answer</button>`}</section>`);
 app.querySelectorAll('input[name="mcq-choice"]').forEach(input=>input.addEventListener('change',()=>{s.choice=Number(input.value);save();app.querySelector('[data-mcq="check"]').disabled=false;const message=app.querySelector('.mcq-storage');if(!storageOK)message.textContent='Browser storage is unavailable. Progress may be lost when you leave.';}));
}
function results(){
 const s=state.session;if(!s)return menu();const done=s.ids.filter(id=>Object.hasOwn(s.answers,id)),right=done.filter(id=>s.answers[id]===byId[id].answer);
 shell(`<section class="mcq-card"><h2>Session complete</h2><p class="mcq-score">${right.length} / ${s.ids.length}</p><p>Review any explanation below or retry the questions you missed.</p><div class="mcq-actions"><button class="btn" data-mcq="retry-session" ${right.length===s.ids.length?'disabled':''}>Retry Missed Questions</button><button class="btn secondary" data-mcq="menu">Question Bank</button></div></section>${s.ids.map(id=>{const q=byId[id],correct=s.answers[id]===q.answer;return `<details class="mcq-card"><summary>${correct?'Correct':'Incorrect'} · ${E(q.topicTitle)}</summary><h3>${E(q.stem)}</h3><p>Your answer: ${E(q.options[s.answers[id]]?.text||'Not answered')}</p><p><strong>Correct answer: ${E(q.options[q.answer].text)}</strong></p><ul>${q.options.map((o,i)=>`<li><strong>${'ABCDE'[i]}: ${E(o.text)}</strong> — ${E(o.why)}</li>`).join('')}</ul><p>${E(q.takeaway)}</p><a href="${topicUrl(q.topic)}">Review this topic</a>${sources(q)}</details>`;}).join('')}`);
}
function start(ids){if(!ids.length)return;const shuffled=ids.slice();for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}state.session={ids:shuffled,index:0,answers:{},choice:null,done:false};save();question();}
function action(type,value){
 const s=state.session,q=s&&byId[s.ids[s.index]];
 if(type==='menu'){save();menu();}
 if(type==='resume')question();
 if(type==='start')start(scoped(scope()).filter(q=>value==='all'||value==='unseen'&&!state.results[q.id]||value==='incorrect'&&state.results[q.id]&&state.results[q.id].choice!==q.answer||value==='bookmarks'&&state.bookmarks.includes(q.id)).map(q=>q.id));
 if(type==='bookmark'&&q){state.bookmarks=state.bookmarks.includes(q.id)?state.bookmarks.filter(id=>id!==q.id):state.bookmarks.concat(q.id);save();const b=app.querySelector('[data-mcq="bookmark"]');b.textContent=state.bookmarks.includes(q.id)?'Bookmarked':'Bookmark';b.setAttribute('aria-pressed',String(state.bookmarks.includes(q.id)));}
 if(type==='check'&&q&&s.choice!==null&&!Object.hasOwn(s.answers,q.id)){
  s.answers[q.id]=s.choice;state.results[q.id]={choice:s.choice,revision:q.revision,attempts:(state.results[q.id]?.attempts||0)+1,at:new Date().toISOString()};save();question();
 }
 if(type==='next'&&q&&Object.hasOwn(s.answers,q.id)){if(s.index<s.ids.length-1){s.index++;s.choice=null;}else s.done=true;save();question();}
 if(type==='retry-session'&&s)start(s.ids.filter(id=>s.answers[id]!==byId[id].answer));
}
function addPractice(id){if(!scoped(id).length||app.querySelector('.mcq-topic-button'))return;const a=document.createElement('a');a.className='btn secondary mcq-topic-button';a.href='#/mcq/'+encodeURIComponent(id);a.textContent='Practise This Topic';app.querySelector('.topic-header')?.append(a);}
const oldTopic=topicPage;topicPage=function(id,block=null){oldTopic(id,block);addPractice(id);};
const oldSystem=systemPage;systemPage=function(id){oldSystem(id);addPractice(id);};
const oldRoute=route;removeEventListener('hashchange',oldRoute);route=function(){if(location.hash==='#/mcq'||location.hash.startsWith('#/mcq/')){menu();}else{document.querySelector('[data-route="mcq"]')?.removeAttribute('aria-current');oldRoute();}};addEventListener('hashchange',route);route();
})();
