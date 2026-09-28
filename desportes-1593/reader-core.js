/* Pure helpers for word selection and source-linked annotations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DesportesReader=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function folded(text){let value='',positions=[];for(let i=0;i<text.length;i++){let c=text[i].normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toLowerCase();value+=c;positions.push(...Array(c.length).fill(i));}return {value,positions};}
  const includes=(pattern,text)=>new RegExp(pattern,'i').test(folded(text).value);
  function relevant(note,rows){return !note.targets.length||note.targets.some(r=>rows.includes(r));}
  function wordNotes(word,notes){return notes.filter(n=>relevant(n,word.rows)&&includes(n.source,word.text));}
  function ranges(text,rows,mode,notes){
    const {value,positions}=folded(text),found=[];
    for(const n of notes){if(!relevant(n,rows))continue;const re=new RegExp(n[mode],'gi');for(const m of value.matchAll(re)){if(!m[0])continue;found.push({start:positions[m.index],end:positions[m.index+m[0].length-1]+1,id:n.id});}}
    found.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
    const result=[];for(const a of found){const last=result.at(-1);if(last&&a.start<last.end){last.end=Math.max(last.end,a.end);if(!last.ids.includes(a.id))last.ids.push(a.id);continue;}result.push({...a,ids:[a.id]});}return result;
  }
  function annotate(text,rows,mode,notes){let at=0,out='';for(const r of ranges(text,rows,mode,notes)){out+=esc(text.slice(at,r.start))+`<button class="text-note" data-notes="${esc(r.ids.join(','))}" data-rows="${esc(rows.join(','))}">${esc(text.slice(r.start,r.end))}</button>`;at=r.end;}return out+esc(text.slice(at));}
  function index(data,model){
    const words=new Map(model.words.map(w=>[w.id,w])),rows=new Map(),units=new Map();let order=0;
    for(const m of model.rows){const r={...data.rows.find(r=>r.id===m.id),...m};rows.set(r.id,r);for(const [i,u] of r.units.entries()){const id=r.id+':'+u.position,w=words.get(r.unitWords[u.position]);if(!w||!w.units.includes(id))throw new Error('Missing word association: '+id);units.set(id,{id,row:r,unit:u,word:w,order:order++,unitIndex:i});}}
    return {words,rows,units,ordered:[...units.values()]};
  }
  function toggle(open,id){const next=new Set(open);next.has(id)?next.delete(id):next.add(id);return next;}
  return {esc,folded,includes,relevant,wordNotes,ranges,annotate,index,toggle};
});
