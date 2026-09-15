/* Version 20: display systems alphabetically, while keeping Complex Symptoms and Signs last. */
(function orderSystems(){
  const D = window.PETER_NOTES_V2;
  if(!D || !Array.isArray(D.roots)) return;
  const last = 'complex-symptoms-and-signs';
  D.roots.sort((a,b)=>{
    if(a===last) return 1;
    if(b===last) return -1;
    return String(D.nodes[a]?.title || a).localeCompare(String(D.nodes[b]?.title || b), 'en-AU', {sensitivity:'base'});
  });
})();
