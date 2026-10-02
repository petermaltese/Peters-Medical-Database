/* V46: inline feedback, top navigation and clinical-reasoning questions. Stable IDs preserve browser progress across releases. */
(()=>{
'use strict';
const bank=window.PETER_MCQ_BANK,questions=bank.questions,byId=Object.fromEntries(questions.map(q=>[q.id,q]));
const KEY='md-database-mcq-progress-v1';let state={results:{},bookmarks:[],highlights:{},session:null},storageOK=true;
try{
 const s=JSON.parse(localStorage.getItem(KEY)||'null');
 if(s&&typeof s==='object'){
  if(s.results&&typeof s.results==='object')for(const [id,r] of Object.entries(s.results))if(r&&Number.isInteger(r.choice)&&r.choice>=0&&r.choice<5&&(!byId[id]||r.revision===byId[id].revision))state.results[id]=r;
  if(Array.isArray(s.bookmarks))state.bookmarks=[...new Set(s.bookmarks.filter(id=>typeof id==='string'))];
  if(s.highlights&&typeof s.highlights==='object')for(const [id,h] of Object.entries(s.highlights))if(byId[id]&&h?.revision===byId[id].revision&&Array.isArray(h.ranges))state.highlights[id]={revision:h.revision,ranges:mergeRanges(h.ranges,byId[id].stem.length)};
  const a=s.session;
  if(a&&Array.isArray(a.ids)&&a.ids.length&&a.ids.every(id=>byId[id])&&Number.isInteger(a.index)&&a.index>=0&&a.index<a.ids.length){
   const answers={};for(const [id,v] of Object.entries(a.answers||{}))if(a.ids.includes(id)&&Number.isInteger(v)&&v>=0&&v<5)answers[id]=v;
   state.session={ids:[...new Set(a.ids)],index:a.index,answers,drafts:Object.fromEntries(Object.entries(a.drafts||{}).filter(([id,v])=>a.ids.includes(id)&&Number.isInteger(v)&&v>=0&&v<5)),done:!!a.done,name:typeof a.name==='string'?a.name.slice(0,80):'',choice:Number.isInteger(a.choice)&&a.choice>=0&&a.choice<5?a.choice:null};
  }
 }
}catch{storageOK=false;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;}}
const E=esc;
let highlightOn=false,selectingText=false,highlightTimer=null;
function mergeRanges(ranges,length){
 const sorted=ranges.filter(r=>Array.isArray(r)&&r.length===2&&Number.isInteger(r[0])&&Number.isInteger(r[1])&&r[0]>=0&&r[0]<r[1]&&r[1]<=length).map(r=>r.slice()).sort((a,b)=>a[0]-b[0]),out=[];
 for(const r of sorted){const last=out[out.length-1];if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else out.push(r);}return out;
}
function highlightedStem(q){
 let end=0,html='';for(const [a,b] of state.highlights[q.id]?.ranges||[]){html+=E(q.stem.slice(end,a))+'<mark class="mcq-highlight">'+E(q.stem.slice(a,b))+'</mark>';end=b;}return html+E(q.stem.slice(end));
}
function updateHighlightControls(){
 const button=app.querySelector('[data-mcq="highlight"]'),stem=app.querySelector('#mcq-stem');
 button?.setAttribute('aria-pressed',String(highlightOn));stem?.classList.toggle('mcq-highlight-active',highlightOn);
 const hint=app.querySelector('#mcq-highlight-hint');if(hint)hint.textContent=highlightOn?'Highlight is on — select words in the question to mark them.':'Turn on Highlight, then select words in the question.';
 const q=state.session&&byId[state.session.ids[state.session.index]],clear=app.querySelector('[data-mcq="clear-highlights"]');if(clear)clear.hidden=!state.highlights[q?.id]?.ranges.length;
}
function markSelection(){
 if(!highlightOn||selectingText||!state.session||state.session.done)return;
 const stem=app.querySelector('#mcq-stem'),selection=window.getSelection?.();
 if(!stem||!selection||selection.isCollapsed||!selection.rangeCount)return;
 const range=selection.getRangeAt(0);if(!stem.contains(range.startContainer)||!stem.contains(range.endContainer))return;
 const prefix=range.cloneRange();prefix.selectNodeContents(stem);prefix.setEnd(range.startContainer,range.startOffset);
 const start=prefix.toString().length,end=start+range.toString().length,q=byId[state.session.ids[state.session.index]];
 if(!q.stem.slice(start,end).trim())return;
 state.highlights[q.id]={revision:q.revision,ranges:mergeRanges([...(state.highlights[q.id]?.ranges||[]),[start,end]],q.stem.length)};
 save();selection.removeAllRanges();stem.innerHTML=highlightedStem(q);updateHighlightControls();
}
document.addEventListener('pointerdown',e=>{selectingText=!!e.target.closest?.('#mcq-stem');clearTimeout(highlightTimer);});
document.addEventListener('pointerup',()=>{selectingText=false;markSelection();});
document.addEventListener('pointercancel',()=>{selectingText=false;});
document.addEventListener('keyup',e=>{if(e.key==='Shift'||e.key.startsWith('Arrow'))markSelection();});
// Native touch selection handles may finish after pointerup.
document.addEventListener('selectionchange',()=>{clearTimeout(highlightTimer);if(highlightOn&&!selectingText)highlightTimer=setTimeout(markSelection,650);});
function redrawQuestion(){
 const rail=app.querySelector('.mcq-question-rail'),left=window.scrollX||0,top=window.scrollY||0,railTop=rail?.scrollTop||0;
 const oldMin=app.style.minHeight;app.style.minHeight=app.offsetHeight+'px';
 question();app.style.minHeight=oldMin;
 const newRail=app.querySelector('.mcq-question-rail');if(newRail)newRail.scrollTop=railTop;
 window.scrollTo({left,top,behavior:'instant'});
}

function scoped(id){return questions.filter(q=>!id||q.topic===id||pathIds(q.topic).includes(id));}
function scope(){try{return decodeURIComponent(location.hash.split('/')[2]||'');}catch{return '';}}
function shell(body){
 closeMobileNav();document.querySelectorAll('.nav-item,.system-link').forEach(x=>{x.classList.remove('active');x.removeAttribute('aria-current');});
 const nav=document.querySelector('[data-route="mcq"]');nav?.classList.add('active');nav?.setAttribute('aria-current','page');
 app.innerHTML=`<div class="mcq-page"><header class="mcq-header"><div class="eyebrow">Renal practice · Australian context</div><h1>MCQ Practice</h1><p>AI-generated questions · Five options · One best answer</p></header>${body}<p class="mcq-storage" role="status">${storageOK?'Progress saves in this browser on this device. Clearing site data removes it; other devices do not sync.':'Browser storage is unavailable. You can practise, but progress may be lost when you leave.'}</p></div>`;
 app.focus({preventScroll:true});
 app.querySelectorAll('[data-mcq]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.mcq,b.dataset.value)));
}
let setup=null;
function title(id){const t=node(id)?.title||id;return id==='ent'?'ENT':t.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());}
function chosen(){
 return questions.filter(q=>setup.topics.includes(q.topic)&&(setup.category==='all'||q.category===setup.category)&&(setup.difficulty==='all'||q.difficulty===setup.difficulty)).filter(q=>setup.source==='all'||setup.source==='unseen'&&!state.results[q.id]||setup.source==='incorrect'&&state.results[q.id]&&state.results[q.id].choice!==q.answer||setup.source==='bookmarks'&&state.bookmarks.includes(q.id));
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
 clearTimeout(highlightTimer);selectingText=false;
 const id=scope();if(!setup||setup.scope!==id)setup={scope:id,topics:[...new Set(scoped(id).map(q=>q.topic))],source:'all',category:'all',difficulty:'all',order:'random',limit:'all',name:''};
 const attempted=questions.filter(q=>state.results[q.id]),right=attempted.filter(q=>state.results[q.id].choice===q.answer),wrong=attempted.length-right.length,total=questions.length;
 const stat=list=>`${list.filter(q=>state.results[q.id]).length} of ${list.length} attempted`;
 shell(`<section class="mcq-bank-hero"><div class="eyebrow">Your medical question bank</div><h1>Question bank</h1><p>Choose what you want to practise, then build your session. Practise renal questions aligned to your course objectives, with your choice of question type and difficulty.</p><div class="mcq-bank-progress" role="img" aria-label="${right.length} correct, ${wrong} incorrect, ${total-attempted.length} unanswered"><span class="correct" style="width:${100*right.length/total}%"></span><span class="incorrect" style="width:${100*wrong/total}%"></span></div><p class="mcq-bank-score">${attempted.length?`You've answered <strong>${attempted.length}</strong> of ${total} questions. Your latest-answer score is <strong>${Math.round(right.length/attempted.length*100)}%</strong>.`:'Ready when you are. Your progress will appear here as you answer questions.'}</p><div class="mcq-bank-legend"><span><i class="correct"></i>Correct</span><span><i class="incorrect"></i>Incorrect</span><span><i class="unanswered"></i>Unanswered</span></div>${state.session?`<button class="btn secondary" data-mcq="resume">${state.session.done?'Review Last Session':'Resume Session'}${state.session.name?' · '+E(state.session.name):''}</button>`:''}</section><div class="mcq-launch-bar"><div><strong id="mcq-found" role="status"></strong><small id="mcq-session-count"></small></div><button class="btn" data-mcq="configured-start">Start the questions <span aria-hidden="true">→</span></button></div><div class="mcq-bank-columns"><section class="mcq-bank-panel"><h2>Categories</h2><div class="mcq-category-list"><div class="mcq-category-row"><label><input type="checkbox" data-mcq-select-all>All available categories</label><small>${stat(questions)}</small></div>${D.roots.map(system=>{
 const qs=questions.filter(q=>q.system===system),topics=[...new Set(qs.map(q=>q.topic))].sort((a,b)=>node(a).title.localeCompare(node(b).title));
 if(!qs.length)return `<div class="mcq-category-row unavailable"><label><input type="checkbox" disabled>${E(title(system))}</label><small>Not available yet</small></div>`;
 return `<div class="mcq-category-row"><label><input type="checkbox" data-mcq-system="${E(system)}">${E(title(system))}</label><button class="mcq-category-toggle" aria-label="Show ${E(title(system))} topics" aria-controls="mcq-topics-${E(system)}" aria-expanded="${!!id}" data-mcq="toggle-topics" data-value="${E(system)}">${id?'−':'+'}</button><small>${stat(qs)}</small></div><div class="mcq-category-topics" id="mcq-topics-${E(system)}" ${id?'':'hidden'}>${topics.map(t=>`<div class="mcq-category-row"><label><input type="checkbox" data-mcq-topic="${E(t)}">${E(node(t).title)}</label><small>${stat(qs.filter(q=>q.topic===t))}</small></div>`).join('')}</div>`;
 }).join('')}</div><p class="mcq-panel-note">Renal bank: ${questions.length} sourced questions. 30 Clinical Medicine and 30 Medical Sciences questions. This set covers selected renal objectives; it does not yet assess every renal LO.</p></section><section class="mcq-bank-panel mcq-settings"><h2>Question settings</h2><div class="mcq-setting"><span class="mcq-setting-label">Question mode</span><div class="mcq-mode-label">Study mode</div><p>One question at a time, with feedback after you check your answer.</p></div><div class="mcq-setting"><label for="mcq-source">Questions to include</label><select id="mcq-source"><option value="all">All questions</option><option value="unseen">New questions only</option><option value="incorrect">Previously incorrect</option><option value="bookmarks">Bookmarked questions</option></select></div><div class="mcq-setting"><label for="mcq-category">Question type</label><select id="mcq-category"><option value="all">Clinical Medicine + Medical Sciences</option><option value="clinical">Clinical Medicine</option><option value="science">Medical Sciences</option></select><p>Both types include straightforward and more challenging questions.</p></div><div class="mcq-setting"><label for="mcq-difficulty">Difficulty</label><select id="mcq-difficulty"><option value="all">All difficulties</option><option value="standard">Standard</option><option value="challenging">Harder</option></select></div><div class="mcq-setting"><label for="mcq-order">Question order</label><select id="mcq-order"><option value="random">Random order</option><option value="topic">Group by topic</option></select></div><div class="mcq-setting"><label for="mcq-limit">Session length</label><select id="mcq-limit"><option value="all">All matching questions</option><option value="5">Up to 5 questions</option><option value="10">Up to 10 questions</option><option value="20">Up to 20 questions</option><option value="30">Up to 30 questions</option></select></div><div class="mcq-setting"><label for="mcq-name">Session name <span>(optional)</span></label><input id="mcq-name" maxlength="80" placeholder="e.g. Renal revision" value="${E(setup.name)}"></div><p class="mcq-panel-note">AI-generated questions in an Australian clinical context, with uploaded textbook references and Australian clinical sources. Some test sourced additions beyond your original notes.</p></section></div>`);
 app.querySelector('.mcq-header')?.remove();app.querySelector('.mcq-page').classList.add('mcq-bank-home');
 for(const key of ['source','category','difficulty','order','limit']){const el=app.querySelector('#mcq-'+key);el.value=setup[key];el.addEventListener('change',()=>{setup[key]=el.value;refreshSetup();});}
 app.querySelector('#mcq-name').addEventListener('input',e=>{setup.name=e.target.value.slice(0,80);});
 app.querySelector('[data-mcq-select-all]').addEventListener('change',e=>{setup.topics=e.target.checked?[...new Set(questions.map(q=>q.topic))]:[];refreshSetup();});
 app.querySelectorAll('[data-mcq-system]').forEach(el=>el.addEventListener('change',()=>{const ids=[...new Set(questions.filter(q=>q.system===el.dataset.mcqSystem).map(q=>q.topic))];setup.topics=setup.topics.filter(t=>!ids.includes(t)).concat(el.checked?ids:[]);refreshSetup();}));
 app.querySelectorAll('[data-mcq-topic]').forEach(el=>el.addEventListener('change',()=>{setup.topics=setup.topics.filter(t=>t!==el.dataset.mcqTopic);if(el.checked)setup.topics.push(el.dataset.mcqTopic);refreshSetup();}));
 refreshSetup();
}
function sources(q){
 const external=q.refs.map(id=>{const s=bank.sources[id];return `<li><a href="${E(s.url)}" target="_blank" rel="noopener noreferrer">${E(s.title)}</a></li>`;});
 const books=q.bookRefs.map(r=>{const b=window.PETER_TEXTBOOK_CONTENT.books[r.book];return `<li>${E(b.title)}, ${E(b.edition)}. PDF pages ${r.pdfPages.join(', ')} ; ${E(r.chapter||'')} (uploaded copy).</li>`;});
 return `<details class="mcq-sources"><summary>Sources and provenance</summary><p>AI-generated question and explanation using the sources below; not copied from an exam or question bank. Australian clinical references and uploaded textbook page references are listed below. Textbooks support underlying science; clinical guidance is drawn from Australian sources, including locally contextualised CARI guidance. Learning-objective alignment is an AI mapping to your uploaded course objectives.</p><ul>${external.concat(books).join('')}</ul></details>${objectives(q)}`;
}
function objectives(q){return `<section class="mcq-learning-objective"><h3>Learning objective assessed</h3>${q.learningObjectives.map(o=>`<p><strong>${E(o.id)}:</strong> ${E(o.text)}</p>`).join('')}${q.notesDisclaimer?`<p class="mcq-notes-disclaimer">${E(q.notesDisclaimer)}</p>`:'<p class="mcq-notes-origin">Core tested concept is present in your original notes. Explanations may include sourced context.</p>'}</section>`;}

function question(){
 clearTimeout(highlightTimer);selectingText=false;
 const s=state.session;if(!s)return menu();if(s.done)return results();const q=byId[s.ids[s.index]],checked=Object.hasOwn(s.answers,q.id),choice=checked?s.answers[q.id]:s.choice;
 shell(`<div class="mcq-topline"><button class="btn secondary" data-mcq="menu">Save & Exit</button><span>${s.name?E(s.name)+' · ':''}Question ${s.index+1} of ${s.ids.length}</span><button class="btn secondary" data-mcq="bookmark" aria-pressed="${state.bookmarks.includes(q.id)}">${state.bookmarks.includes(q.id)?'Bookmarked':'Bookmark'}</button><button class="btn secondary mcq-highlight-toggle" data-mcq="highlight" aria-pressed="${highlightOn}" aria-controls="mcq-stem">Highlight</button><button class="btn" data-mcq="next" ${checked?'':'disabled'}>${Object.keys(s.answers).length===s.ids.length?'View Results':s.index===s.ids.length-1?'Next Unanswered':'Next Question'}</button></div><progress value="${Object.keys(s.answers).length}" max="${s.ids.length}" aria-label="Session progress"></progress><section class="mcq-card"><p class="mcq-difficulty-tag">${q.category==='clinical'?'Clinical Medicine':'Medical Sciences'}</p><div class="mcq-highlight-tools"><span id="mcq-highlight-hint" role="status"></span><button class="mcq-clear-highlights" data-mcq="clear-highlights" hidden>Clear Highlights</button></div><h2 class="mcq-stem" id="mcq-stem">${highlightedStem(q)}</h2><fieldset class="mcq-options" ${checked?'disabled':''}><legend class="sr-only">Choose one answer</legend>${q.options.map((o,i)=>`<label class="mcq-option ${checked&&i===q.answer?'is-correct':checked&&i===choice?'is-wrong':''}"><input type="radio" name="mcq-choice" value="${i}" ${choice===i?'checked':''}><span class="mcq-letter">${'ABCDE'[i]}</span><span class="mcq-option-content"><span class="mcq-option-title">${E(o.text)}${checked&&i===q.answer?' <strong>— Correct answer</strong>':checked&&i===choice?' <strong>— Your answer</strong>':''}</span>${checked?`<span class="mcq-option-explanation">${E(o.why)}</span>`:''}</span></label>`).join('')}</fieldset>${checked?`<section class="mcq-feedback" role="status"><h3>${choice===q.answer?'Correct':'Not quite'} · Answer ${'ABCDE'[q.answer]}</h3><p class="mcq-takeaway"><strong>Key learning point:</strong> ${E(q.takeaway)}</p><a class="text-link" href="${topicUrl(q.topic)}" target="_blank" rel="noopener noreferrer">${E(q.reviewLabel)} ↗ <span class="sr-only">(opens in a new tab)</span></a>${sources(q)}</section><button class="btn" data-mcq="next">${Object.keys(s.answers).length===s.ids.length?'View Results':s.index===s.ids.length-1?'Next Unanswered':'Next Question'}</button>`:`<button class="btn" data-mcq="check" ${choice===null?'disabled':''}>Check Answer</button>`}</section>`);
 questionList();updateHighlightControls();
 app.querySelectorAll('input[name="mcq-choice"]').forEach(input=>input.addEventListener('change',()=>{s.choice=Number(input.value);s.drafts=s.drafts||{};s.drafts[q.id]=s.choice;save();app.querySelector('[data-mcq="check"]').disabled=false;const message=app.querySelector('.mcq-storage');if(!storageOK)message.textContent='Browser storage is unavailable. Progress may be lost when you leave.';}));
}
function questionList(){
 const s=state.session,page=app.querySelector('.mcq-page'),layout=document.createElement('div'),main=document.createElement('div'),aside=document.createElement('aside');
 layout.className='mcq-answer-layout';main.className='mcq-answer-main';aside.className='mcq-question-rail';aside.setAttribute('aria-label','Question navigation');
 for(const child of [...page.children])if(!child.matches('.mcq-header,.mcq-storage'))main.append(child);
 const answered=Object.keys(s.answers).length;
 aside.innerHTML=`<h2>Questions</h2><p>${answered} of ${s.ids.length} answered</p><nav aria-label="Move between questions">${s.ids.map((id,i)=>{const q=byId[id],answered=Object.hasOwn(s.answers,id),status=answered?(s.answers[id]===q.answer?'Correct':'Incorrect'):'Unanswered',mark=state.bookmarks.includes(id);return `<button type="button" data-question-index="${i}" class="mcq-question-link ${status.toLowerCase()}" ${s.index===i?'aria-current="step"':''} aria-label="Question ${i+1}, ${status}${mark?', bookmarked':''}"><span class="mcq-question-number">${i+1}</span><span class="mcq-question-word">Question ${i+1}</span><span class="mcq-question-status">${answered?(status==='Correct'?'✓':'×'):'○'}${mark?' ★':''}</span></button>`;}).join('')}</nav><button class="btn secondary" data-finish-session ${answered===s.ids.length?'':'disabled'}>View Results</button>`;
 layout.append(main,aside);page.querySelector('.mcq-header').after(layout);page.classList.add('mcq-with-rail');
 aside.querySelectorAll('[data-question-index]').forEach(button=>button.addEventListener('click',()=>{if(s.choice!==null&&!Object.hasOwn(s.answers,s.ids[s.index])){s.drafts=s.drafts||{};s.drafts[s.ids[s.index]]=s.choice;}s.index=Number(button.dataset.questionIndex);s.choice=s.drafts?.[s.ids[s.index]]??null;save();redrawQuestion();app.querySelector(`[data-question-index="${s.index}"]`)?.focus({preventScroll:true});}));
 aside.querySelector('[data-finish-session]').addEventListener('click',()=>{if(Object.keys(s.answers).length===s.ids.length){s.done=true;save();results();}});
}
function results(){
 const s=state.session;if(!s)return menu();const done=s.ids.filter(id=>Object.hasOwn(s.answers,id)),right=done.filter(id=>s.answers[id]===byId[id].answer);
 shell(`<section class="mcq-card"><h2>Session complete</h2><p class="mcq-score">${right.length} / ${s.ids.length}</p><p>Review any explanation below or retry the questions you missed.</p><div class="mcq-actions"><button class="btn" data-mcq="retry-session" ${right.length===s.ids.length?'disabled':''}>Retry Missed Questions</button><button class="btn secondary" data-mcq="menu">Question Bank</button></div></section>${s.ids.map(id=>{const q=byId[id],correct=s.answers[id]===q.answer;return `<details class="mcq-card"><summary>${correct?'Correct':'Incorrect'} · ${E(q.topicTitle)}</summary><h3>${E(q.stem)}</h3><p>Your answer: ${E(q.options[s.answers[id]]?.text||'Not answered')}</p><p><strong>Correct answer: ${E(q.options[q.answer].text)}</strong></p><ul>${q.options.map((o,i)=>`<li><strong>${'ABCDE'[i]}: ${E(o.text)}</strong> — ${E(o.why)}</li>`).join('')}</ul><p>${E(q.takeaway)}</p><a href="${topicUrl(q.topic)}" target="_blank" rel="noopener noreferrer">${E(q.reviewLabel)} ↗ <span class="sr-only">(opens in a new tab)</span></a>${sources(q)}</details>`;}).join('')}`);
}
function start(ids,order='random',limit='all',name=''){if(!ids.length)return;const shuffled=ids.slice();if(order==='topic')shuffled.sort((a,b)=>byId[a].topicTitle.localeCompare(byId[b].topicTitle)||a.localeCompare(b));else for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}state.session={ids:limit==='all'?shuffled:shuffled.slice(0,Number(limit)),index:0,answers:{},drafts:{},choice:null,done:false,name};save();question();}
function action(type,value){
 const s=state.session,q=s&&byId[s.ids[s.index]];
 if(type==='highlight'){highlightOn=!highlightOn;clearTimeout(highlightTimer);updateHighlightControls();}
 if(type==='clear-highlights'&&q){delete state.highlights[q.id];save();const stem=app.querySelector('#mcq-stem');if(stem)stem.textContent=q.stem;window.getSelection?.()?.removeAllRanges();updateHighlightControls();}
 if(type==='configured-start')start(chosen().map(q=>q.id),setup.order,setup.limit,setup.name.trim());
 if(type==='toggle-topics'){const panel=app.querySelector('#mcq-topics-'+value),button=app.querySelector('[data-mcq="toggle-topics"][data-value="'+value+'"]');panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));button.textContent=panel.hidden?'+':'−';}
 if(type==='menu'){save();menu();}
 if(type==='resume')question();
 if(type==='start')start(scoped(scope()).filter(q=>value==='all'||value==='unseen'&&!state.results[q.id]||value==='incorrect'&&state.results[q.id]&&state.results[q.id].choice!==q.answer||value==='bookmarks'&&state.bookmarks.includes(q.id)).map(q=>q.id));
 if(type==='bookmark'&&q){state.bookmarks=state.bookmarks.includes(q.id)?state.bookmarks.filter(id=>id!==q.id):state.bookmarks.concat(q.id);save();const b=app.querySelector('[data-mcq="bookmark"]');b.textContent=state.bookmarks.includes(q.id)?'Bookmarked':'Bookmark';b.setAttribute('aria-pressed',String(state.bookmarks.includes(q.id)));redrawQuestion();}
 if(type==='check'&&q&&s.choice!==null&&!Object.hasOwn(s.answers,q.id)){
  s.answers[q.id]=s.choice;state.results[q.id]={choice:s.choice,revision:q.revision,attempts:(state.results[q.id]?.attempts||0)+1,at:new Date().toISOString()};save();redrawQuestion();
 }
 if(type==='next'&&q&&Object.hasOwn(s.answers,q.id)){if(Object.keys(s.answers).length===s.ids.length)s.done=true;else{if(s.index<s.ids.length-1)s.index++;else s.index=s.ids.findIndex(id=>!Object.hasOwn(s.answers,id));s.choice=s.drafts?.[s.ids[s.index]]??null;}save();question();}
 if(type==='retry-session'&&s)start(s.ids.filter(id=>s.answers[id]!==byId[id].answer));
}
function addPractice(id){if(!scoped(id).length||app.querySelector('.mcq-topic-button'))return;const a=document.createElement('a');a.className='btn secondary mcq-topic-button';a.href='#/mcq/'+encodeURIComponent(id);a.textContent='Practise This Topic';app.querySelector('.topic-header')?.append(a);}
const oldTopic=topicPage;topicPage=function(id,block=null){oldTopic(id,block);addPractice(id);};
const oldSystem=systemPage;systemPage=function(id){oldSystem(id);addPractice(id);};
const oldRoute=route;removeEventListener('hashchange',oldRoute);route=function(){if(location.hash==='#/mcq'||location.hash.startsWith('#/mcq/')){menu();}else{document.querySelector('[data-route="mcq"]')?.removeAttribute('aria-current');oldRoute();}};addEventListener('hashchange',route);route();
})();
