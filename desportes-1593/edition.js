/* The photographed letter remains intact; words and evidence unfold on selection. */
(() => {
  'use strict';
  const core=window.DesportesReader,{esc}=core,BASE='/desportes-1593/',KEY='https://cryptiana.web.fc2.com/code/mayenne.htm#:~:text=Reconstructed%20Cipher';
  const $=s=>document.querySelector(s),asset=s=>BASE+s;
  const letter=$('#letter'),panel=$('#context'),body=$('#context-body');
  let data,model,notes,idx,english,englishMarkup,view='source',open=new Set(),frenchLines=new Set(),selected=null,lastTrigger=null,closingOpen=false;
  const folioLabel=f=>f.replace('f','f. '),lineLabel=r=>`${folioLabel(r.folio)} · ${r.number}`;
  const sourceLink=r=>`<a class="source-cite" href="${esc(data.sources[r.folio].url)}" target="_blank" rel="noopener noreferrer">${esc(data.sources[r.folio].title)} · line ${r.number} ↗</a>`;
  function svg(f,box,label){const s=data.sources[f];return `<svg viewBox="${box[0]} ${box[1]} ${box[2]-box[0]} ${box[3]-box[1]}" role="img" aria-label="${esc(label)}"><image href="${asset(s.image)}" width="${s.size[0]}" height="${s.size[1]}"/></svg>`;}
  function lineNumber(r,first=false){return `<button class="line-label" data-line="${r.id}" aria-label="${esc(lineLabel(r))}: source and reading">${first?`<span class="folio-label">${r.folio.replace('f','')}${r.folio.endsWith('v')?'':'r'}</span>`:''}${String(r.number).padStart(2,'0')}</button>`;}
  function frenchToggle(id,label){return `<button class="line-french-toggle" data-french-line="${id}" aria-label="French translation: ${esc(label)}" title="Show or hide this line in French" aria-expanded="${frenchLines.has(id)}" aria-controls="french-${id}">fr</button>`;}
  function frenchLine(id,text,rows){return `<p class="line-french" id="french-${id}" lang="fr" ${frenchLines.has(id)?'':'hidden'}>${core.annotate(text,rows,'fr',notes)}</p>`;}
  function sourceRow(r,first){const b=r.displayBox,w=b[2]-b[0],h=b[3]-b[1];return `<article class="source-row" id="${r.id}"><div class="source-gutter">${lineNumber(r,first)}${frenchToggle(r.id,lineLabel(r))}</div><div class="line-surface">${frenchLine(r.id,r.french,[r.id])}<div class="reveal-space" id="reveal-${r.id}"></div><div class="manuscript-tile">${svg(r.folio,b,'Original manuscript, '+lineLabel(r))}${r.units.map((u,i)=>{const id=r.id+':'+u.position,word=idx.units.get(id).word,y=Math.max(b[1],u.box[1]),end=Math.min(b[3],u.box[3]);return `<button class="source-hit" data-unit="${id}" data-word="${word.id}" tabindex="${i===0?'0':'-1'}" aria-label="${esc(lineLabel(r))}, ${u.wordTarget?'handwritten word':'symbol'} ${i+1}: open word" aria-expanded="${open.has(word.id)}" aria-controls="reveal-${r.id} context" style="left:${100*(u.box[0]-b[0])/w}%;width:${100*(u.box[2]-u.box[0])/w}%;top:${100*(y-b[1])/h}%;height:${100*Math.max(1,end-y)/h}%"></button>`;}).join('')}</div></div></article>`;}
  function closing(){const c=data.closing,b=model.closingBox;
    if(view!=='source')return `<article class="text-row translation-closing"><button class="line-label" data-closing="true" aria-label="Closing notes">fin</button><p lang="${view==='french'?'fr':'en'}">${core.annotate(view==='english'?english.closing:c.french,[],view==='french'?'fr':'en',notes)}</p></article>`;
    return `<article class="source-row closing-row" id="closing"><div class="source-gutter"><button class="line-label" data-closing="true" aria-label="Open the closing">fin</button>${frenchToggle('closing','closing')}</div><div class="line-surface">${frenchLine('closing',c.french,[])}<div class="closing-reveal" ${closingOpen?'':'hidden'}><button data-closing="true" lang="fr">${esc(c.original)}</button></div><div class="manuscript-tile">${svg(c.folio,b,'Original manuscript closing')}${c.regions.map((u,i)=>{const x=c.box[0]+u.box[0],y=c.box[1]+u.box[1];return `<button class="source-hit" data-closing="${i}" aria-label="Open closing region ${i+1}" aria-expanded="${closingOpen}" style="left:${100*(x-b[0])/(b[2]-b[0])}%;top:${100*(y-b[1])/(b[3]-b[1])}%;width:${100*(u.box[2]-u.box[0])/(b[2]-b[0])}%;height:${100*(u.box[3]-u.box[1])/(b[3]-b[1])}%"></button>`;}).join('')}</div></div></article>`;
  }
  function render(){
    letter.classList.toggle('source-view',view==='source');
    document.body.classList.toggle('reading-source',view==='source');
    letter.innerHTML=data.folios.map(f=>`<section class="folio" aria-label="${esc(data.sources[f].title)}">${[...idx.rows.values()].filter(r=>r.folio===f).map((r,i)=>view==='source'?sourceRow(r,i===0):`<article class="text-row${view==='english'?' english-row':''}" id="${r.id}">${lineNumber(r,i===0)}<p lang="${view==='english'?'en':'fr'}">${view==='english'?englishMarkup.get(r.id):core.annotate(r.french,[r.id],'fr',notes)}</p></article>`).join('')}${f===data.closing.folio?closing():''}</section>`).join('');
    refreshReveals();
  }
  function shortReading(u){
    if(u.kind==='cancelled'||u.kind==='apparatus'||u.kind==='punctuation')return '∅';
    if(u.kind==='editorial')return u.reading.match(/\[[^\]]+\]/)?.[0]||'[…]';
    if(u.kind==='open')return '[Gondi]';
    if(u.kind==='number')return 'cinq cens';
    if(u.kind==='abbreviation'&&u.reading==='Vostre Seigneurie Illustrissime')return 'V. S. I.';
    return u.reading.split(' — ')[0];
  }
  function refreshRow(r){
    if(view!=='source')return;
    const el=document.getElementById('reveal-'+r.id);if(!el)return;
    const width=el.clientWidth,b=r.displayBox,nativeW=b[2]-b[0];if(!width)return;
    const x=u=>((u.box[0]+u.box[2])/2-b[0])/nativeW*width;
    const allGroups=[...new Set(r.units.map(u=>r.unitWords[u.position]))].map(id=>{
      const word=idx.words.get(id),units=r.units.filter(u=>r.unitWords[u.position]===id),xx=units.map(x);
      const center=(Math.min(...xx)+Math.max(...xx))/2,name=word.mark?'omitted':word.text;
      return {id,word,units,name,center,width:name.length*6.4+8};
    }).sort((a,b)=>a.center-b.center);
    // Position against every word, so opening another never moves existing labels.
    const groups=core.wordTitles(allGroups,width).filter(g=>open.has(g.id));
    el.style.height=groups.length?'87px':'0';
    el.innerHTML=groups.map(g=>{
      const points=[];
      const cells=g.units.map(u=>{
        const left=x(u),values=u.kind==='cipher'&&u.alternatives.length?u.alternatives:[shortReading(u)];
        const neighbours=r.units.filter(v=>v!==u).map(v=>Math.abs(x(v)-left)),gap=Math.min(...neighbours,16),font=Math.min(16,Math.max(7,gap*1.18));
        return values.map((value,j)=>{const chosen=values.length===1||value===u.reading,y=values.length===1?53:31+j*24;if(chosen&&u.kind==='cipher')points.push(`${left},${y+10}`);const extra=value.length>2?' compact':'';return `<button class="word-choice${chosen?' chosen':''}${extra}${u.kind==='editorial'||u.kind==='open'?' supplied':''}${value==='∅'?' omitted':''}" data-toggle-word="${g.id}" style="left:${left}px;top:${y}px;${value.length===1?'font-size:'+font+'px;':''}" aria-label="${esc(value)}${chosen?', selected reading':''}; close ${esc(g.name)}">${esc(value)}</button>`;}).join('');
      }).join('');
      const title=g.units.length===1&&g.units[0].wordTarget?'':`<button class="word-name" data-toggle-word="${g.id}" style="left:${g.titleX}px;max-width:${g.width}px;font-size:${g.font}px" title="${esc(g.name)} · close this word">${esc(g.name)}</button>`;
      return `<div class="word-reveal" data-revealed-word="${g.id}" style="top:0">${title}<svg class="reading-path" viewBox="0 0 ${width} 87" aria-hidden="true"><polyline points="${points.join(' ')}"/></svg>${cells}</div>`;
    }).join('');
    document.getElementById(r.id)?.querySelectorAll('[data-unit]').forEach(b=>{const yes=open.has(b.dataset.word);b.classList.toggle('revealed',yes);b.classList.toggle('current',b.dataset.unit===selected);b.setAttribute('aria-expanded',String(yes));});
  }
  function refreshReveals(){if(!idx)return;for(const r of idx.rows.values())refreshRow(r);$('#close-words').hidden=view!=='source'||(!open.size&&!closingOpen);}
  function setView(next){
    if(!['source','french','english'].includes(next))next='source';
    view=next;closePanel(false);document.querySelectorAll('[data-view]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.view===view));b.tabIndex=b.dataset.view===view?0:-1;});
    letter.setAttribute('aria-labelledby','tab-'+view);$('#key-button').hidden=view!=='source';render();
    const url=new URL(location);url.searchParams.set('view',view);history.replaceState(null,'',url);$('#status').textContent=`${view==='source'?'Original':view==='french'?'French':'English'} view.`;
  }
  function openPanel(label,html,trigger){
    lastTrigger=trigger||document.activeElement;$('#context-location').textContent=label;body.innerHTML=html;panel.hidden=false;document.body.classList.add('panel-open');panel.scrollTop=0;requestAnimationFrame(refreshReveals);
  }
  function closePanel(focus=true){panel.hidden=true;document.body.classList.remove('panel-open');document.querySelectorAll('.text-note.active').forEach(n=>n.classList.remove('active'));if(focus&&lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});requestAnimationFrame(refreshReveals);}
  function noteHTML(n,original=false){return `<section class="context-note" data-context-note="${n.id}"><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p>${original&&n.cipher?`<p>${esc(n.cipher)}</p>`:''}${n.images.filter(im=>original||!im.cipherOnly).map(im=>`<figure><a href="${asset(im.image)}" target="_blank" rel="noopener"><img src="${asset(im.image)}" alt="${esc(im.caption)}" loading="lazy"></a><figcaption>${esc(im.caption)}</figcaption></figure>`).join('')}<div class="context-cites">${n.refs.map(ref=>`<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.label)} ↗</a>`).join('')}</div></section>`;}
  function symbolHTML(item){const {row:r,unit:u}=item,b=u.box;
    const sample=svg(r.folio,[Math.max(0,b[0]-8),b[1],b[2]+8,b[3]],'Selected original manuscript region');
    if(u.kind==='cipher'){
      const family=u.family.split('/')[0],keyImage='assets/evidence/key-column-'+family+'.png';
      return `<div class="glyph-comparison"><figure>${sample}<figcaption>Manuscript</figcaption></figure><figure><img class="key-fragment" src="${asset(keyImage)}" alt="${esc(u.family)} column from Tomokiyo’s published key"><figcaption>Published key</figcaption></figure></div><div class="symbol-decision">${esc(u.family)} → <strong>${esc(u.reading)}</strong></div><div class="context-cites"><a href="${KEY}" target="_blank" rel="noopener noreferrer">S. Tomokiyo · “Reconstructed Cipher,” ${esc(u.family)} column ↗</a></div>`;
    }
    if(u.wordTarget||u.kind==='clear')return `<p>Ordinary handwriting.</p>${u.wordTarget?'<p class="tiny">Connected hand; word boundaries are approximate. Brackets mark expansions or supplies.</p>':''}`;
    if(u.kind==='cancelled'||u.kind==='apparatus')return '<p>Cancelled or surplus ink, retained in the manuscript and omitted from the running reading.</p>';
    if(u.kind==='punctuation')return '<p>A manuscript mark; no alphabetic reading is assigned.</p>';
    if(u.kind==='editorial'||u.kind==='open')return `<p>${esc(u.reading)}.</p>`;
    const keyWord=['QUE','QUI','POUR'].includes(u.reading);
    return `<p>${u.kind==='abbreviation'?'An expanded abbreviation':u.kind==='number'?'Numerical notation':'A word or title code'}: <strong>${esc(shortReading(u))}</strong>.</p>${keyWord?`<figure><img src="${asset('assets/evidence/tomokiyo-key.png')}" alt="Tomokiyo’s published alphabet and QUE, QUI, POUR signs"></figure><div class="context-cites"><a href="${KEY}" target="_blank" rel="noopener noreferrer">S. Tomokiyo · “Reconstructed Cipher,” ${esc(u.reading)} entry ↗</a></div>`:''}`;
  }
  function selectUnit(id,forceOpen=false,forceClose=false){const item=idx.units.get(id);if(!item)return;const w=item.word;
    const tile=document.getElementById(item.row.id)?.querySelector('.manuscript-tile'),before=tile?.getBoundingClientRect().top;
    const shouldClose=!forceOpen&&open.has(w.id)&&(selected===id||forceClose);open=shouldClose?core.toggle(open,w.id):new Set([...open,w.id]);selected=id;
    if(!shouldClose){const relevant=core.wordNotes(w,notes);openPanel(lineLabel(item.row),`<h2>${esc(w.mark?'Source mark':w.text)}</h2>${symbolHTML(item)}${relevant.map(n=>noteHTML(n,true)).join('')}${sourceLink(item.row)}`);}
    refreshReveals();const url=new URL(location);url.searchParams.set('view','source');url.hash=open.has(w.id)?w.id:'';history.replaceState(null,'',url);
    if(tile&&!forceOpen){const above=tile.offsetTop-tile.parentElement.offsetTop,target=Math.max(before,$('.view-menu').offsetHeight+above+10);window.scrollBy(0,tile.getBoundingClientRect().top-target);}
    $('#status').textContent=`${w.text}: ${open.has(w.id)?'opened':'closed'}.`;
  }
  function showNotes(ids,rows=[],trigger){const chosen=ids.map(id=>notes.find(n=>n.id===id)).filter(Boolean);if(!chosen.length)return;
    const target=chosen.flatMap(n=>n.targets).find(id=>rows.includes(id))||rows[0],r=idx.rows.get(target);openPanel(r?lineLabel(r):'Context',chosen.map(n=>noteHTML(n,false)).join('')+(r?sourceLink(r):''),trigger);trigger?.classList.add('active');
  }
  function showLine(id){const r=idx.rows.get(id);if(!r)return;openPanel(lineLabel(r),`<p class="context-line" lang="fr">${esc(view==='source'?r.original:r.french)}</p>${sourceLink(r)}`);}
  function toggleFrench(id,trigger){
    const row=document.getElementById(id),text=document.getElementById('french-'+id),tile=row?.querySelector('.manuscript-tile');if(!text||!tile)return;
    const before=tile.getBoundingClientRect().top;frenchLines=core.toggle(frenchLines,id);text.hidden=!frenchLines.has(id);trigger.setAttribute('aria-expanded',String(!text.hidden));
    const above=tile.offsetTop-row.querySelector('.line-surface').offsetTop;
    const target=Math.max(before,$('.view-menu').offsetHeight+above+10);window.scrollBy(0,tile.getBoundingClientRect().top-target);
    $('#status').textContent=`French ${id==='closing'?'closing':'line'} ${text.hidden?'hidden':'shown'}.`;
  }
  function showClosing(){closingOpen=!closingOpen;if(view==='source'){const old=document.getElementById('closing');old.outerHTML=closing();$('#close-words').hidden=!open.size&&!closingOpen;}if(closingOpen||view!=='source')showNotes(['closing','dates']);else closePanel(false);}
  function showKey(){openPanel('The cipher',`<h2>One sign, two letters.</h2><figure><a href="${asset('assets/evidence/tomokiyo-key.png')}" target="_blank" rel="noopener"><img src="${asset('assets/evidence/tomokiyo-key.png')}" alt="S. Tomokiyo’s reconstructed cipher table"></a></figure><p>French context selects a letter from each pair. The glowing path shows the choices made in this edition.</p><div class="context-cites"><a href="${KEY}" target="_blank" rel="noopener noreferrer">S. Tomokiyo (2017), “Reconstructed Cipher” · unpaginated table ↗</a></div>`);}
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!idx)return;
    if(b.dataset.view)setView(b.dataset.view);
    else if(b.dataset.frenchLine)toggleFrench(b.dataset.frenchLine,b);
    else if(b.dataset.unit)selectUnit(b.dataset.unit);
    else if(b.dataset.toggleWord){const w=idx.words.get(b.dataset.toggleWord);if(w)selectUnit(w.units[0],false,true);}
    else if(b.dataset.notes)showNotes(b.dataset.notes.split(','),(b.dataset.rows||'').split(','),b);
    else if(b.dataset.line)showLine(b.dataset.line);
    else if(b.dataset.closing!==undefined)showClosing();
    else if(b.id==='close-context')closePanel();
    else if(b.id==='close-words'){open.clear();closingOpen=false;closePanel(false);render();}
    else if(b.dataset.general==='key')showKey();
    else if(b.dataset.general==='editorial')showNotes(['editorial']);
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!panel.hidden){e.preventDefault();closePanel();return;}
    const b=e.target.closest('[data-unit]');if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    const item=idx.units.get(b.dataset.unit);if(!item)return;e.preventDefault();
    const rowItems=idx.ordered.filter(i=>i.row===item.row);const next=e.key==='Home'?rowItems[0]:e.key==='End'?rowItems.at(-1):idx.ordered[item.order+(e.key==='ArrowLeft'?-1:1)];
    if(!next)return;const target=document.querySelector(`[data-unit="${next.id}"]`);b.tabIndex=-1;target.tabIndex=0;target.focus();
  });
  $('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll('[data-view]')],i=tabs.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowLeft'?-1:1)+3)%3;setView(tabs[next].dataset.view);tabs[next].focus();});
  let resizeFrame;new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(refreshReveals);}).observe(letter);
  async function load(name){const response=await fetch(name,{cache:'no-cache'});if(!response.ok)throw new Error(name+' '+response.status);return response.json();}
  Promise.all([load('edition.json'),load('reader.json'),load('../reader-notes.json'),load('english-lines.json')]).then(values=>{
    [data,model,notes,english]=values;idx=core.index(data,model);englishMarkup=core.annotateEnglishLines(english.rows,notes);setView(new URL(location).searchParams.get('view')||'source');
    let anchor='';try{anchor=decodeURIComponent(location.hash.slice(1));}catch(e){}
    if(view==='source'&&idx.words.has(anchor)){const w=idx.words.get(anchor);selectUnit(w.units[0],true);document.getElementById(w.rows[0])?.scrollIntoView({block:'center'});}
    else if(idx.rows.has(anchor))document.getElementById(anchor)?.scrollIntoView({block:'center'});
  }).catch(error=>{console.error(error);letter.innerHTML='<p class="error">The letter could not load. Please reload the page.</p>';});
})();
