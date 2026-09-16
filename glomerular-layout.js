/* V29: use the same plain overview/disease layout as Nephritic Syndromes. */
const glomerularBaseLayout=topicPage;
topicPage=function(id,block=null){
 glomerularBaseLayout(id,block);
 if(id!=='renal-system--glomerular-disease')return;
 const intro=app.querySelector('.topic-header .overview-introduction');
 if(!intro)return;
 // Preserve the requested summary contents, without adding an outer disclosure.
 intro.classList.add('glomerular-plain-intro');
 const figure=intro.querySelector('.inline-figure');
 if(figure){figure.classList.add('glomerular-summary-image');intro.prepend(figure);}
 const injury=document.getElementById('section-glomerular-disease--types-of-glomerular-injury');
 if(injury){injury.classList.add('glomerular-injury');intro.append(injury);injury.querySelector('.open-topic')?.remove();}
 // The user removed jump lists during the workshop; keep them removed here.
 app.querySelectorAll('.overview-jumps').forEach(nav=>nav.remove());
 if(block!==null){const target=document.getElementById('block-'+block);revealCardioTarget(target);requestAnimationFrame(()=>target?.scrollIntoView({block:'center'}));}
};
route();
