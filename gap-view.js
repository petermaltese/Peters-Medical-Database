/* V41: sourced gap filling is an additive layer; original note blocks are untouched. */
(()=>{
 const content=window.PETER_GAP_CONTENT;if(!content)return;
 const direct=(el,selector)=>el&&Array.from(el.children).find(x=>x.matches(selector));
 function addition(item,id,key){
  const aside=document.createElement('aside');
  aside.className=(item.bookRefs?'textbook-addition':'ai-gap-addition')+' gap-addition';
  aside.dataset.gapTopic=id;aside.dataset.gapKey=key;
  const label=document.createElement('p');label.className=item.bookRefs?'textbook-origin':'gap-origin';
  label.textContent=item.bookRefs?'Textbook-derived · AI overview':item.noteRefs?'AI overview · Based on Peter’s note topics':'AI-written · Sourced addition';
  const p=document.createElement('p');p.textContent=item.text;aside.append(label,p);
  const refs=document.createElement('details');refs.className='gap-references';
  const summary=document.createElement('summary');summary.textContent=item.noteRefs?'Note topics used for this overview':'Sources';refs.append(summary);
  const list=document.createElement('ul');
  if(item.bookRefs)for(const ref of item.bookRefs){
   const li=document.createElement('li'),book=window.PETER_TEXTBOOK_CONTENT.books[ref.book];
   li.textContent=`${book.title}, ${book.edition}. PDF pages ${ref.pdfPages.join(', ')} (uploaded copy).`;list.append(li);
  }
  for(const ref of item.refs||[]){
   const s=content.sources[ref],li=document.createElement('li'),a=document.createElement('a');
   a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=s.title;li.append(a);
   const url=document.createElement('span');url.className='gap-source-url';url.textContent=s.url;li.append(url);list.append(li);
  }
  for(const ref of item.noteRefs||[]){
   const li=document.createElement('li'),a=document.createElement('a');a.href=topicUrl(ref);a.textContent=node(ref).title;li.append(a);list.append(li);
  }
  refs.append(list);aside.append(refs);return aside;
 }
 function fillIntro(el,id){
  const item=content.topics[id]?.intro;if(!el||!item||direct(el,'.gap-addition'))return;
  // Only generated prompts: original note blocks and figures remain in place.
  const empty=Array.from(el.children).filter(x=>x.matches('p')&&!x.id&&x.textContent.trim().toLowerCase()==='to be added');
  if(!empty.length)return;
  empty.forEach(x=>{x.hidden=true;x.classList.add('gap-filled-placeholder');});
  direct(el,'.ai-origin')?.remove();
  const heading=direct(el,'h2,h3');if(heading&&heading.textContent==='Definition')heading.textContent='Introduction';
  el.append(addition(item,id,'intro'));
 }
 function enhance(id){
  const header=app.querySelector('.topic-header');fillIntro(direct(header,'.cardio-definition,.overview-introduction'),id);
  for(const section of app.querySelectorAll('.topic-section')){
   const sid=section.id.replace(/^section-/,''),items=content.topics[sid];if(!items)continue;
   fillIntro(direct(section,'.cardio-definition,.overview-introduction'),sid);
   const groups=direct(section,'.cardio-groups');if(!groups)continue;
   for(const detail of groups.children){
    const key=detail.dataset.category,item=items[key],body=direct(detail,'.cardio-section-body');
    if(!item||!body||direct(body,'.gap-addition'))continue;
    const prompts=Array.from(body.children).filter(x=>x.matches('.cardio-placeholder:not([hidden])'));
    if(!prompts.length)continue;
    prompts.forEach(x=>{x.hidden=true;x.classList.add('gap-filled-placeholder');});body.append(addition(item,sid,key));
   }
  }
 }
 const baseTopic=topicPage;topicPage=function(id,block=null){baseTopic(id,block);enhance(id);};
 const baseSystem=systemPage;systemPage=function(id){baseSystem(id);enhance(id);};
 const baseHome=home;home=function(){
  baseHome();const key=document.createElement('aside');key.className='ai-gap-key';
  const h=document.createElement('h2');h.textContent='AI additions and sources';
  const p=document.createElement('p');p.textContent='Green-bordered “AI-written · Sourced addition” panels fill gaps using the linked external sources. Navy textbook panels retain their book and page references. Topic overviews based on the notes are labelled separately. Peter’s original notes remain separate from these additions.';
  key.append(h,p);app.querySelector('.textbook-key')?.after(key);
 };
 route();
})();
