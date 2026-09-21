/* V34: append separately labelled textbook summaries without editing source notes. */
(()=>{
 const content=window.PETER_TEXTBOOK_CONTENT;
 if(!content)return;
 const pageRange=pages=>{
  const sorted=[...new Set(pages)].sort((a,b)=>a-b),ranges=[];
  for(let i=0;i<sorted.length;i++){
   const first=sorted[i];let last=first;
   while(sorted[i+1]===last+1)last=sorted[++i];
   ranges.push(first===last?String(first):`${first}–${last}`);
  }
  return ranges.join(', ');
 };
 const citation=ref=>{
  const book=content.books[ref.book];
  const chapters=book.chapter||[...new Set(ref.pdfPages.map(p=>p>=2196?'309 — Polycystic kidney disease':p>=2178?'308 — Glomerular diseases':'305 — Chronic kidney disease'))].join('; ');
  return `${book.title}, ${book.edition}. Chapter ${chapters}. Printed pages ${pageRange(ref.pdfPages.map(p=>p-book.pageOffset))}; PDF pages ${pageRange(ref.pdfPages)} (uploaded copy).`;
 };
 function enhance(){
  for(const section of app.querySelectorAll('.topic-section')){
   const id=section.id.replace(/^section-/,''),entries=content.topics[id];
   if(!entries)continue;
   const groups=Array.from(section.children).find(el=>el.classList.contains('cardio-groups'));
   if(!groups)continue;
   for(const [key,items] of Object.entries(entries)){
    const detail=Array.from(groups.children).find(el=>el.dataset.category===key);
    const body=detail?.querySelector('.cardio-section-body');
    if(!body||body.querySelector('.textbook-addition'))continue;
    const aside=document.createElement('aside');aside.className='textbook-addition';
    aside.setAttribute('aria-label','Textbook-derived information, summarised by AI');
    const label=document.createElement('p');label.className='textbook-origin';label.textContent='Textbook-derived · AI summary';aside.append(label);
    const references=[],list=document.createElement('ul');list.className='textbook-points';
    const refId=`textbook-refs-${id}-${key}`;
    items.forEach(item=>{
     const li=document.createElement('li');li.append(document.createTextNode(item.text+' '));
     item.refs.forEach(ref=>{
      const value=citation(ref);let index=references.indexOf(value);
      if(index<0){index=references.length;references.push(value);}
      const link=document.createElement('a');link.href='#'+refId+'-'+index;link.className='textbook-cite';
      link.textContent=`[${index+1}]`;link.setAttribute('aria-label',`Reference ${index+1}: ${content.books[ref.book].title}`);
      link.addEventListener('click',event=>{
       event.preventDefault();const panel=document.getElementById(refId);panel.open=true;
       const target=document.getElementById(refId+'-'+index);target?.focus({preventScroll:true});target?.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
      });
      li.append(link,document.createTextNode(' '));
     });
     list.append(li);
    });
    aside.append(list);
    const refs=document.createElement('details');refs.className='textbook-references';refs.id=refId;
    const title=document.createElement('summary');title.textContent='Textbook references';refs.append(title);
    const sources=document.createElement('ol');
    references.forEach((value,index)=>{const li=document.createElement('li');li.id=refId+'-'+index;li.tabIndex=-1;li.textContent=value;sources.append(li);});
    refs.append(sources);aside.append(refs);
    // Hide only generated empty-state prompts; retain all original note blocks.
    Array.from(body.children).filter(el=>el.classList.contains('cardio-placeholder')).forEach(el=>{el.hidden=true;});
    body.append(aside);
   }
  }
 }
 const baseTopic=topicPage;
 topicPage=function(id,block=null){baseTopic(id,block);enhance();};
 const baseHome=home;
 home=function(){
  baseHome();
  const key=document.createElement('aside');key.className='textbook-key';key.setAttribute('aria-label','Textbook colour key');
  const heading=document.createElement('h2');heading.textContent='Textbook colour key';
  const text=document.createElement('p');text.textContent='Navy text marks AI-written summaries derived only from Kumar & Clark’s Clinical Medicine (11th edition) and Harrison’s Principles of Internal Medicine (20th edition). Each addition has its own textbook page references and is separate from Peter’s original notes.';
  const status=document.createElement('p');status.className='textbook-key-status';status.textContent='Renal has been supplemented in V34. In dark mode, textbook text appears light blue for readability. These summaries reflect the cited editions.';
  key.append(heading,text,status);app.querySelector('.hero-actions')?.after(key);
 };
 // The existing badge otherwise incorrectly describes pages containing sourced additions.
 const badge=document.querySelector('.source-badge');if(badge)badge.textContent='ALL SOURCES LABELLED';
 route();
})();
