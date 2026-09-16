/* Decorative line icons only; labels remain the accessible names of controls. */
const systemIconPaths={
 'cardiology':'M12 20S3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 12-9 12Z',
 'renal-system':'M8 3C3 3 2 8 2 12s2 8 6 8c3 0 4-3 2-5-2-2-2-4 0-6 2-2 1-6-2-6ZM16 3c5 0 6 5 6 9s-2 8-6 8c-3 0-4-3-2-5 2-2 2-4 0-6-2-2-1-6 2-6Z',
 'respiratory-system':'M10 8C7 2 3 9 2 16c-1 6 7 4 8 1V8ZM14 8c3-6 7 1 8 8 1 6-7 4-8 1V8ZM12 2v7m0 0-4 4m4-4 4 4',
 'gastrointestinal-tract':'M10 2v6c-3 0-5 2-5 6 0 5 5 7 9 6 6-2 8-8 5-12-2-2-4 0-5 1V2',
 'endocrine-system':'M12 8C9 2 3 5 4 11c-2 6 4 10 8 4 4 6 10 2 8-4 1-6-5-9-8-3Zm0 0v7',
 'neurology':'M12 5C9 0 4 3 5 7c-5 1-4 7-2 8-1 5 6 8 9 4 3 4 10 1 9-4 2-1 3-7-2-8 1-4-4-7-7-2Zm0 0v14M5 7l3 2m-5 6 5-2m11-6-3 2m5 6-5-2',
 'musculoskeletal':'M6 3c-3-2-6 2-3 5l2 1 10 10 1 2c3 3 7 0 5-3 3-3 0-7-3-5l-9-8c0-3-2-4-3-2Z',
 'haematology':'M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Zm-3 13c0 2 1 3 3 3',
 'rheumatology':'M9 2v7l-4 5m10-12v7l4 5M5 22l4-7m10 7-4-7M9 9l3 3 3-3m-6 6 3-3 3 3',
 'dermatology':'M3 9c3-4 6 4 9 0s6 4 9 0M3 14h18M3 19h18M6 3v3m6-3v3m6-3v3',
 'paediatrics':'M15 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 12l7-3 7 3m-7-3v7m0 0-5 6m5-6 5 6',
 'ent':'M8 8c0-8 13-8 13 0 0 5-6 5-6 10 0 5-7 5-7 0m4-10c0-3 5-3 5 0 0 2-4 3-4 6',
 'opthalmology':'M2 12S6 5 12 5s10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
 'reproductive-system':'M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 12v8m-4-3h8',
 'general-practice':'M6 3v6a5 5 0 0 0 10 0V3m-10 0h3m7 0h-3m-2 11v3a4 4 0 0 0 8 0v-3m2-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
 'complex-symptoms-and-signs':'M4 3h16v18H4V3Zm4 5h8m-8 4h8m-8 4h5'
};
function systemIcon(id){
 const path=systemIconPaths[id];
 return path?`<svg class="system-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`:'';
}
