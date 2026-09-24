/* V36: three independent practice wheels on one page. No medical content changes. */
(()=>{
 'use strict';
 const wheels=[
  {title:'Who?',options:['Nick','Barbod','Peter']},
  {title:'History',options:['Cardiovascular','Respiratory','Endocrine','Diabetes','Gastrointestinal','Neurology','Musculoskeletal','Urology','Sexual/Reproductive','Oncology']},
  {title:'Exam',options:['Cardiovascular','Respiratory','Thyroid','Gastrointestinal (Abdominal)','Peripheral Vascular','Lower Limb Neuro','Upper Limb Neuro','Cranial Nerves','Hip','Knee','Foot & Ankle','Shoulder','Elbow','Wrist & Hand','Spine']}
 ];
 const storageKey='md-database-custom-wheels-v1';
 try{
  const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
  if(Array.isArray(saved))saved.forEach(w=>{
   if(w&&typeof w.title==='string'&&w.title.trim()&&w.title.length<=80&&Array.isArray(w.options)&&w.options.length>=2&&w.options.length<=50&&w.options.every(x=>typeof x==='string'&&x.trim()&&x.length<=100))wheels.push({title:w.title,options:w.options,custom:true});
  });
 }catch{}
 function saveCustom(){
  try{localStorage.setItem(storageKey,JSON.stringify(wheels.filter(w=>w.custom&&!w.removed).map(w=>({title:w.title,options:w.options}))));return true;}catch{return false;}
 }
 const palette=['#146b73','#315ca6','#73509f','#a53f70','#b44d32','#956000','#48752c','#22736b','#4b579f','#874977','#9f4b4b','#776424','#427354','#286d8c','#655795'];
 const state=wheels.map(()=>({angle:0,result:null,busy:false,timer:null}));
 // Rejection sampling keeps every option equally likely.
 function pick(n){
  const limit=Math.floor(4294967296/n)*n,bytes=new Uint32Array(1);
  do{crypto.getRandomValues(bytes);}while(bytes[0]>=limit);
  return bytes[0]%n;
 }
 function svg(w){
  const n=w.options.length,step=360/n,point=a=>[200+188*Math.cos(a*Math.PI/180),200+188*Math.sin(a*Math.PI/180)];
  let sectors='';
  w.options.forEach((label,i)=>{
   const a=-90+i*step,b=a+step,[x,y]=point(a),[xx,yy]=point(b),mid=(a+b)/2;
   const tx=200+126*Math.cos(mid*Math.PI/180),ty=200+126*Math.sin(mid*Math.PI/180);
   sectors+=`<path d="M200 200 L${x} ${y} A188 188 0 ${step>180?1:0} 1 ${xx} ${yy} Z" fill="${palette[i%palette.length]}" stroke="rgba(255,255,255,.55)" stroke-width="2"/><text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="${w===wheels[0]?25:n>20?12:19}" font-weight="700">${w===wheels[0]?esc(label):i+1}</text>`;
  });
  return `<svg class="practice-wheel-disc" viewBox="0 0 400 400" aria-hidden="true">${sectors}<circle cx="200" cy="200" r="28" fill="var(--panel)"/><circle cx="200" cy="200" r="9" fill="var(--text)"/></svg>`;
 }
 function update(i){
  const card=app.querySelector(`[data-practice-wheel="${i}"]`);if(!card)return;
  const s=state[i],w=wheels[i];
  const remove=card.querySelector('.practice-wheel-remove');if(remove)remove.disabled=s.busy;
  const button=card.querySelector('button');button.disabled=s.busy;button.textContent=s.busy?'Spinning…':'Spin';
  card.querySelector('.practice-wheel-result').textContent=s.busy?'Spinning…':s.result===null?'Ready to spin':w.options[s.result];
  card.querySelector('.practice-wheel-result').classList.toggle('chosen',s.result!==null&&!s.busy);
  card.querySelectorAll('.practice-wheel-options li').forEach((el,j)=>el.classList.toggle('selected',!s.busy&&j===s.result));
 }
 function spin(i){
  const s=state[i];if(s.busy)return;
  const selected=pick(wheels[i].options.length),step=360/wheels[i].options.length;
  // Top pointer lands in the centre of the selected sector, never on a boundary.
  const target=(360-(selected+.5)*step)%360;
  const next=s.angle+5*360+(target-s.angle%360+360)%360;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  s.busy=true;update(i);
  const disc=app.querySelector(`[data-practice-wheel="${i}"] .practice-wheel-disc`);
  if(disc){disc.style.transition=reduced?'none':'transform 3.8s cubic-bezier(.12,.7,.14,1)';disc.style.transform=`rotate(${next}deg)`;}
  s.angle=next;
  const finish=()=>{s.result=selected;s.busy=false;s.timer=null;update(i);};
  if(reduced)finish();else s.timer=setTimeout(finish,3900);
 }
 function page(){
  const customPage=location.hash==='#/wheels/random';
  closeMobileNav();renderSidebar();
  document.querySelectorAll('.nav-item,.system-link').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('[data-route^="wheels-"]').forEach(el=>el.removeAttribute('aria-current'));
  document.getElementById('spinningWheelsGroup').open=true;
  const nav=document.querySelector(`[data-route="wheels-${customPage?'random':'osce'}"]`);nav?.classList.add('active');nav?.setAttribute('aria-current','page');
  document.title=(customPage?'Random Wheel':'OSCE Practice')+' · MD Database';
  app.innerHTML=`<div class="page practice-wheels-page"><header class="practice-wheels-header"><p class="practice-wheels-eyebrow">Spinning Wheels</p><h1>${customPage?'Random Wheel':'OSCE Practice'}</h1><p class="page-lead">${customPage?'Create a wheel with your own options and let it choose at random.':'Pick who’s up, a history and an examination. Spin each wheel independently.'}</p></header>${customPage?`<details class="practice-wheel-create" open><summary>Create a Spinning Wheel</summary><form id="custom-wheel-form"><p>Your custom wheels are saved in this browser. Enter one option per line; each gets an equal chance.</p><label for="custom-wheel-title">Wheel title</label><input id="custom-wheel-title" name="title" maxlength="80" required placeholder="e.g. Practice scenarios"><label for="custom-wheel-options">Options</label><textarea id="custom-wheel-options" name="options" rows="5" required placeholder="First option&#10;Second option&#10;Third option"></textarea><p class="practice-wheel-form-hint">2–50 options, up to 100 characters each. Blank lines are ignored.</p><div class="practice-wheel-form-actions"><button type="submit" class="practice-wheel-spin">Create Wheel</button><button type="button" id="custom-wheel-clear" aria-label="Clear custom wheels and entries">Clear</button></div><p id="custom-wheel-message" role="status"></p></form></details>`:''}<div class="practice-wheels-grid">${wheels.map((w,i)=>w.removed||!!w.custom!==customPage?'':`<section class="practice-wheel-card" data-practice-wheel="${i}" aria-labelledby="wheel-title-${i}"><h2 id="wheel-title-${i}">${esc(w.title)}</h2><div class="practice-wheel-stage"><span class="practice-wheel-pointer" aria-hidden="true"></span>${svg(w)}</div><button type="button" class="practice-wheel-spin" aria-label="Spin ${esc(w.title)} wheel">Spin</button><p class="practice-wheel-result" role="status" aria-live="polite" aria-atomic="true"></p><details class="practice-wheel-key" open><summary>Wheel options</summary><ol class="practice-wheel-options">${w.options.map((label,j)=>`<li><span class="practice-wheel-number" style="background:${palette[j%palette.length]}" aria-hidden="true">${j+1}</span><span>${esc(label)}</span></li>`).join('')}</ol></details>${w.custom?'<button type="button" class="practice-wheel-remove">Remove Wheel</button>':''}</section>`).join('')}</div></div>`;
  wheels.forEach((w,i)=>{
   if(w.removed||!!w.custom!==customPage)return;
   app.querySelector(`[data-practice-wheel="${i}"] .practice-wheel-disc`).style.transform=`rotate(${state[i].angle}deg)`;
   app.querySelector(`[data-practice-wheel="${i}"] button`).addEventListener('click',()=>spin(i));update(i);
   app.querySelector(`[data-practice-wheel="${i}"] .practice-wheel-remove`)?.addEventListener('click',()=>{
    if(state[i].busy)return;w.removed=true;const saved=saveCustom();page();
    if(!saved)document.getElementById('custom-wheel-message').textContent='Removed for this visit. Browser storage is unavailable, so this change could not be saved.';
   });
  });
  document.getElementById('custom-wheel-clear')?.addEventListener('click',()=>{
   wheels.forEach((w,i)=>{if(w.custom){w.removed=true;clearTimeout(state[i].timer);state[i].busy=false;}});
   const saved=saveCustom();page();document.getElementById('custom-wheel-title').focus();
   document.getElementById('custom-wheel-message').textContent=saved?'Cleared. Enter new options to start again.':'Cleared for this visit. Browser storage is unavailable, so this change could not be saved.';
  });
  document.getElementById('custom-wheel-form')?.addEventListener('submit',event=>{
   event.preventDefault();
   const title=document.getElementById('custom-wheel-title').value.trim();
   const options=document.getElementById('custom-wheel-options').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
   const message=document.getElementById('custom-wheel-message');
   if(!title||options.length<2||options.length>50||options.some(x=>x.length>100)){message.textContent='Enter a title and 2–50 options, each no more than 100 characters.';return;}
   if(new Set(options.map(x=>x.toLowerCase())).size!==options.length){message.textContent='Please remove duplicate options so each choice has an equal chance.';return;}
   wheels.push({title,options,custom:true});state.push({angle:0,result:null,busy:false,timer:null});
   const saved=saveCustom();page();
   const card=app.querySelector(`[data-practice-wheel="${wheels.length-1}"]`);
   card.querySelector('button').focus({preventScroll:true});card.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   if(!saved){const note=document.createElement('p');note.setAttribute('role','status');note.textContent='This wheel works for this visit, but browser storage is unavailable so it could not be saved.';card.append(note);}
  });
  app.focus({preventScroll:true});window.scrollTo(0,0);
 }
 const previousRoute=route;
 removeEventListener('hashchange',previousRoute);
 route=function(){
  if(/^#\/wheels(?:\/(?:osce|random))?$/.test(location.hash))page();
  else{document.querySelectorAll('[data-route^="wheels-"]').forEach(el=>el.removeAttribute('aria-current'));previousRoute();}
 };
 addEventListener('hashchange',route);
 if(/^#\/wheels(?:\/(?:osce|random))?$/.test(location.hash))page();
})();
