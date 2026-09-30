/* Pure helpers for word selection and source-linked annotations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DesportesReader=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function folded(text){let value='',positions=[];for(let i=0;i<text.length;i++){let c=text[i].normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").toLowerCase();value+=c;positions.push(...Array(c.length).fill(i));}return {value,positions};}
  const includes=(pattern,text)=>new RegExp(pattern,'i').test(folded(text).value);
  function relevant(note,rows){return !note.targets.length||note.targets.some(r=>rows.includes(r));}
  function wordNotes(word,notes){return notes.filter(n=>n.wordIds?n.wordIds.includes(word.id):relevant(n,word.rows)&&includes(n.source,word.text));}
  function ranges(text,rows,mode,notes,spans=null){
    const {value,positions}=folded(text),found=[];
    for(const n of notes){if(!relevant(n,rows))continue;
      const anchors=n[mode+'Anchors'];if(anchors){
        for(const a of anchors){if(!rows.includes(a.row))continue;const offset=spans?spans.find(s=>s.id===a.row)?.start:rows.length===1?0:undefined;if(offset===undefined)continue;
          const start=offset+a.start,end=offset+a.end;if(start>=0&&end>start&&end<=text.length&&text.slice(start,end)===a.text)found.push({start,end,id:n.id});
        }continue;
      }
      const re=new RegExp(n[mode],'gi');for(const m of value.matchAll(re)){if(!m[0])continue;found.push({start:positions[m.index],end:positions[m.index+m[0].length-1]+1,id:n.id});}}
    found.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
    const result=[];for(const a of found){const last=result.at(-1);if(last&&a.start<last.end){last.end=Math.max(last.end,a.end);if(!last.ids.includes(a.id))last.ids.push(a.id);continue;}result.push({...a,ids:[a.id]});}return result;
  }
  function annotate(text,rows,mode,notes){let at=0,out='';for(const r of ranges(text,rows,mode,notes)){out+=esc(text.slice(at,r.start))+`<button class="text-note" data-notes="${esc(r.ids.join(','))}" data-rows="${esc(rows.join(','))}">${esc(text.slice(r.start,r.end))}</button>`;at=r.end;}return out+esc(text.slice(at));}
  function annotateEnglishLines(rows,notes){
    let offset=0;const spans=rows.map(r=>{const s={...r,start:offset,end:offset+r.text.length};offset=s.end+1;return s;});
    const matches=ranges(rows.map(r=>r.text).join(' '),rows.map(r=>r.id),'en',notes,spans).map(m=>({...m,rows:spans.filter(s=>s.start<m.end&&s.end>m.start).map(s=>s.id)}));
    return new Map(spans.map(s=>{
      let at=0,html='';for(const m of matches){if(m.start>=s.end||m.end<=s.start)continue;const a=Math.max(0,m.start-s.start),b=Math.min(s.text.length,m.end-s.start);html+=esc(s.text.slice(at,a))+`<button class="text-note" data-notes="${esc(m.ids.join(','))}" data-rows="${esc(m.rows.join(','))}">${esc(s.text.slice(a,b))}</button>`;at=b;}
      return [s.id,html+esc(s.text.slice(at))];
    }));
  }
  function wordTitles(items,width){
    if(!items.length)return [];
    const gap=4,total=items.reduce((n,g)=>n+g.width,0),scale=Math.min(1,Math.max(1,width-gap*(items.length-1))/total);
    const placed=items.map(g=>({...g,width:g.width*scale,font:12*scale}));
    let edge=0;for(const g of placed){g.left=Math.max(edge,Math.min(width-g.width,g.center-g.width/2));edge=g.left+g.width+gap;}
    edge=width;for(let i=placed.length-1;i>=0;i--){const g=placed[i];g.left=Math.min(g.left,edge-g.width);g.titleX=g.left+g.width/2;edge=g.left-gap;}
    return placed;
  }
  function index(data,model){
    const words=new Map(model.words.map(w=>[w.id,w])),rows=new Map(),units=new Map();let order=0;
    for(const m of model.rows){const r={...data.rows.find(r=>r.id===m.id),...m};rows.set(r.id,r);for(const [i,u] of r.units.entries()){const id=r.id+':'+u.position,w=words.get(r.unitWords[u.position]);if(!w||!w.units.includes(id))throw new Error('Missing word association: '+id);units.set(id,{id,row:r,unit:u,word:w,order:order++,unitIndex:i});}}
    return {words,rows,units,ordered:[...units.values()]};
  }
  function toggle(open,id){const next=new Set(open);next.has(id)?next.delete(id):next.add(id);return next;}
  return {esc,folded,includes,relevant,wordNotes,ranges,annotate,annotateEnglishLines,wordTitles,index,toggle};
});
