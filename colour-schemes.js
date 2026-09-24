/* V38: independent shell palette preference, compatible with light/dark mode. */
(()=>{
 const palettes=[['original','Original','#245fd6'],['teal','Teal','#126b65'],['forest','Forest Green','#426b30'],['purple','Purple','#77459a'],['slate','Slate','#495e75']];
 const key='md-database-colour-scheme',root=document.documentElement;
 let selected='original';try{const saved=localStorage.getItem(key);if(palettes.some(p=>p[0]===saved))selected=saved;}catch{}
 const picker=document.createElement('details');picker.className='colour-scheme-picker';
 picker.innerHTML='<summary>Colour Scheme</summary><div class="colour-scheme-options" role="group" aria-label="Website colour scheme"></div><p class="colour-scheme-status" role="status" aria-live="polite"></p>';
 const options=picker.querySelector('.colour-scheme-options'),status=picker.querySelector('.colour-scheme-status');
 function apply(id,persist){
  selected=id;root.dataset.colourScheme=id;
  options.querySelectorAll('button').forEach(b=>{const active=b.dataset.scheme===id;b.setAttribute('aria-pressed',String(active));b.querySelector('.colour-scheme-swatch').textContent=active?'✓':'';});
  status.textContent=palettes.find(p=>p[0]===id)[1]+' selected';
  if(persist)try{localStorage.setItem(key,id);}catch{status.textContent+=' — could not save in this browser';}
 }
 palettes.forEach(([id,label,colour])=>{
  const button=document.createElement('button');button.type='button';button.className='colour-scheme-option';button.dataset.scheme=id;button.title=label;button.setAttribute('aria-label',label);
  const circle=document.createElement('span');circle.className='colour-scheme-swatch';circle.style.setProperty('--swatch',colour);circle.setAttribute('aria-hidden','true');
  const name=document.createElement('span');name.textContent=label;button.append(circle,name);button.addEventListener('click',()=>apply(id,true));options.append(button);
 });
 document.querySelector('.sidebar-foot').prepend(picker);apply(selected,false);
})();
