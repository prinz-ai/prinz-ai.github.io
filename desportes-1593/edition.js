/* A static, source-grounded reader. No accounts, tracking, or saved-answer writes. */
(() => {
  'use strict';
  const BASE='/desportes-1593/';
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const asset=p=>BASE+p;
  let data, view='source', selectedRow=null, selectedUnit=null, boxes=false, readings=false, zoom=false;
  const reader=$('#reader'), drawer=$('#drawer'), drawerBody=$('#drawer-body'), tip=$('#tooltip');
  const sourceURL=r=>data.sources[r.folio].url;
  const lineLabel=r=>`${r.folio.replace('f','f. ')} · line ${r.number}`;
  const rangeLabel=a=>a[0]===a[1]?a[0].replace(/^(f\d+v?)-/,'$1, line '):`${a[0].replace(/^(f\d+v?)-/,'$1, line ')} → ${a[1].replace(/^(f\d+v?)-/,'$1, line ')}`;
  function textMarkup(s){return esc(s).replace(/\[([^\]]+)\]/g,'<span class="restored">[$1]</span>');}
  function buttonNote(id,label){return `<button class="text-button" data-note="${esc(id)}">${esc(label)}</button>`;}
  function findRow(id){return data.rows.find(r=>r.id===id);}
  function lineNotes(r){return r.notes.map(id=>data.notes.find(n=>n.id===id)).filter(Boolean);}
  function notesLinks(notes){return `<div class="note-links">${notes.map(n=>`<button class="note-link" data-note="${esc(n.id)}"><span><small>${esc(n.tag)}</small>${esc(n.title)}</span><span aria-hidden="true">↗</span></button>`).join('')}</div>`;}
  function openDrawer(title,html){tip.hidden=true;$('#drawer-label').textContent=title;drawerBody.innerHTML=html;if(!drawer.open)drawer.showModal();drawer.scrollTop=0;$('#close-drawer').focus({preventScroll:true});}
  function evidenceHTML(n){return `${n.quote?`<blockquote lang="fr">${esc(n.quote)}</blockquote>`:''}${n.body.map(p=>`<p>${esc(p)}</p>`).join('')}${n.images.map(i=>`<figure><a href="${asset(i.image)}" target="_blank" rel="noopener"><img src="${asset(i.image)}" alt="${esc(i.caption)}" loading="lazy"></a><figcaption>${esc(i.caption)} Click the image to enlarge.</figcaption></figure>`).join('')}${n.refs.length?`<div class="citations">${n.refs.map(r=>`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.label)} ↗</a>`).join('')}</div>`:''}`;}
  function showNote(id){
    const n=data.notes.find(n=>n.id===id);if(!n)return;
    let related=n.targets.filter(t=>findRow(t));
    openDrawer('The evidence',`<p class="eyebrow">${esc(n.tag)}</p><h2>${esc(n.title)}</h2>${evidenceHTML(n)}${related.length?`<div class="note-links"><button class="note-link" data-jump="${related[0]}"><span>See the passage<br><small>${esc(rangeLabel([related[0],related.at(-1)]))}</small></span>↗</button></div>`:''}${id==='key'?keyHTML():''}`);
  }
  function keyHTML(){return `<div class="key-grid">${data.key.map(k=>`<div class="key-cell"><img src="${asset(k.image)}" alt="Manuscript sample for ${esc(k.values.join('/'))}"><strong>${esc(k.values.join('/'))}</strong><a href="${esc(k.source)}" target="_blank" rel="noopener noreferrer">${esc(k.line)} · sign ${k.position} ↗</a></div>`).join('')}</div><p>The first eleven entries are paired letters. The remaining samples are whole-word signs. A small crop may include a neighbouring flourish; the full leaf is one click away.</p>`;}
  function lineDetails(r){return `<p class="eyebrow">Accepted reading · historical spelling</p><p lang="fr">${textMarkup(r.original)}</p><p class="eyebrow">French · modernized spelling</p><p lang="fr">${textMarkup(r.french)}</p><div class="citations"><a href="${esc(sourceURL(r))}" target="_blank" rel="noopener noreferrer">${esc(data.sources[r.folio].title)} · Gallica image ${data.sources[r.folio].canvas} ↗</a></div>${notesLinks(lineNotes(r))}`;}
  function showLine(id){const r=findRow(id);if(!r)return;selectedRow=id;selectedUnit=null;openDrawer(lineLabel(r),`<h2>A line in context</h2>${lineDetails(r)}<div class="symbol-actions"><button class="utility" data-jump="${r.id}">Return to manuscript</button><button class="utility" data-note="editorial">Editorial conventions</button></div>`);}
  function showSymbol(id,index){
    const r=findRow(id),u=r?.units[index];if(!u)return;
    selectedRow=id;selectedUnit=index;
    const x=Math.max(0,u.box[0]-r.box[0]-8),w=Math.min(r.size[0]-x,u.box[2]-u.box[0]+16);
    const svg=`<svg viewBox="${x} 0 ${w} ${r.size[1]}" role="img" aria-label="Original manuscript region"><image href="${asset(r.image)}" width="${r.size[0]}" height="${r.size[1]}"/></svg>`;
    const kind={cipher:'Paired cipher sign',code:'Whole-word code / designation',clear:'Ordinary handwriting',abbreviation:'Abbreviation',number:'Numerical notation',editorial:'Editorial restoration',cancelled:'Cancelled / inactive ink',open:'One unresolved designation',punctuation:'Source mark',apparatus:'Recorded source detail',region:'Several components in one recorded region'}[u.kind]||'Source region';
    const title=u.kind==='cipher'?`${u.family} → ${u.reading}`:u.family;
    openDrawer(`${lineLabel(r)} · source unit ${u.position}`,`<div class="symbol-card">${svg}<div><p class="eyebrow">${esc(kind)}</p><h2 class="family">${esc(u.family)}</h2><p class="selection">Here: <strong>${esc(u.reading)}</strong></p></div></div>${u.familyNote?`<p>${esc(u.familyNote)}</p>`:''}${u.kind==='cipher'?`<p>The key permits <strong>${esc(u.family)}</strong>. The surrounding French selects <strong>${esc(u.reading)}</strong> here. The alternatives are properties of the cipher, not a claim that the word is unresolved.</p>`:''}<div class="symbol-actions"><button class="utility" data-neighbor="-1" ${index===0?'disabled':''}>← Previous sign</button><button class="utility" data-neighbor="1" ${index===r.units.length-1?'disabled':''}>Next sign →</button></div>${buttonNote('key','Read the key and see manuscript samples')} · ${buttonNote('editorial','Reading conventions')}${lineDetails(r)}`);
    document.querySelectorAll('.hit.active').forEach(b=>b.classList.remove('active'));
    document.querySelector(`[data-row="${id}"][data-unit="${index}"]`)?.classList.add('active');
    drawer.setAttribute('aria-label',title);
  }
  function hitHTML(r,u,i){
    const l=100*(u.box[0]-r.box[0])/r.size[0],w=100*(u.box[2]-u.box[0])/r.size[0];
    return `<button class="hit ${u.kind==='open'?'open':''}" style="left:${l.toFixed(4)}%;width:${w.toFixed(4)}%;top:0;height:100%" data-row="${r.id}" data-unit="${i}" tabindex="${i===0?'0':'-1'}" aria-label="${esc(`${lineLabel(r)}, source unit ${u.position}: ${u.family}; reading ${u.reading}`)}"></button>`;
  }
  function rowHTML(r){
    const body=view==='source'?`<div class="scan-scroll"><div class="scan-line"><img src="${asset(r.image)}" width="${r.size[0]}" height="${r.size[1]}" loading="lazy" alt="Original manuscript, ${esc(lineLabel(r))}">${r.units.map((u,i)=>hitHTML(r,u,i)).join('')}</div></div>${readings?`<p class="line-reading" lang="fr">${textMarkup(r.original)}</p>`:''}`:`<p class="french-line" lang="fr">${textMarkup(r.french)}</p>`;
    return `<article class="line" id="${r.id}" aria-label="${esc(lineLabel(r))}"><button class="line-number" data-line="${r.id}" aria-label="Read notes for ${esc(lineLabel(r))}">${String(r.number).padStart(2,'0')}</button><div class="line-body">${body}</div><button class="line-more ${r.notes.length?'has-notes':''}" data-line="${r.id}" aria-label="${esc(lineLabel(r))}: ${r.notes.length?`${r.notes.length} research notes`:'reading and source'}">${r.notes.length||'i'}</button></article>`;
  }
  function closingHTML(){const c=data.closing;return `<section class="closing" id="closing"><h3>The closing</h3>${view==='source'?`<div class="closing-scan"><img src="${asset(c.image)}" width="${c.size[0]}" height="${c.size[1]}" alt="Original manuscript closing" loading="lazy">${c.regions.map((u,i)=>`<button class="closing-hit" data-closing="${i}" data-note="${u.note}" style="left:${100*u.box[0]/c.size[0]}%;top:${100*u.box[1]/c.size[1]}%;width:${100*(u.box[2]-u.box[0])/c.size[0]}%;height:${100*(u.box[3]-u.box[1])/c.size[1]}%" aria-label="${esc(u.reading)}"></button>`).join('')}</div><p class="closing-copy" lang="fr">${textMarkup(c.original)}</p>`:`<p class="closing-copy" lang="${view==='french'?'fr':'en'}">${textMarkup(c[view])}</p>`}<div class="closing-actions">${buttonNote('closing','How the farewell was read')}${buttonNote('dates','Why the date is [22]')}</div></section>`;}
  function renderReader(){
    reader.classList.toggle('show-boxes',boxes);reader.classList.toggle('enlarged',zoom);
    if(view==='english')reader.innerHTML=`<div class="folio-heading"><h2>English translation</h2><button class="text-button" data-note="editorial">About the translation</button></div><div class="english">${data.english.map((p,i)=>`<article class="english-block" id="en-${i}"><button class="source-range" data-line="${p.lines[0]}">${esc(rangeLabel(p.lines))} ↗</button><p>${textMarkup(p.text)}</p></article>`).join('')}${closingHTML()}</div>`;
    else reader.innerHTML=data.folios.map(f=>`<section aria-label="${esc(data.sources[f].title)}"><div class="folio-heading"><h2>${f==='f186'?'Recto':f==='f186v'?'Verso':'The letter'} <span class="folio-ref">· ${f.replace('f','f. ')}</span></h2><button class="text-button" data-scan="${f}">See the whole leaf ↗</button></div>${data.rows.filter(r=>r.folio===f).map(rowHTML).join('')}</section>`).join('')+closingHTML();
    $('#source-options').hidden=view!=='source';$('#zoom').hidden=view!=='source';
    $('#reader-help').textContent=view==='source'?'Hover a symbol to reveal its reading. Click for the key, the line and the evidence. On touch screens, tap; swipe a line to explore it.':view==='french'?'Original wording, modernized spelling. Source line breaks are retained; click a line number or a note badge for the historical reading and evidence.':'A readable English translation. Source references follow the passages; older syntax and interpretive choices are explained in the notes.';
    $('.reader-options').hidden=view==='english';
  }
  function setView(next,scroll=false){
    if(!['source','french','english'].includes(next))return;
    view=next;document.querySelectorAll('[data-view]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.view===view));b.tabIndex=b.dataset.view===view?0:-1;});
    reader.setAttribute('aria-labelledby','tab-'+view);
    renderReader();const u=new URL(location);u.searchParams.set('view',view);history.replaceState(null,'',u);
    $('#view-status').textContent=`${view==='source'?'Manuscript':view==='french'?'French':'English'} view selected.`;
    if(scroll)$('#reader-top').scrollIntoView({block:'start',behavior:'instant'});
  }
  function jump(id){if(drawer.open)drawer.close();if(view!=='source')setView('source');const el=document.getElementById(id);if(!el)return;history.replaceState(null,'',`${location.pathname}?view=source#${id}`);selectedRow=id;$('#line-select').value=id;el.scrollIntoView({block:'center'});document.querySelectorAll('.line.selected').forEach(n=>n.classList.remove('selected'));el.classList.add('selected');el.querySelector('.hit,.line-number')?.focus({preventScroll:true});}
  function showScan(f){const s=data.sources[f];$('#scan-title').textContent=s.title;$('#scan-body').innerHTML=`<div class="full-scan-actions"><a href="${asset(s.image)}" target="_blank" rel="noopener">Open full resolution ↗</a><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Open in Gallica ↗</a></div><img src="${asset(s.image)}" width="${s.size[0]}" height="${s.size[1]}" alt="Full manuscript ${esc(s.title)}">`;$('#scan-dialog').showModal();}
  function showTip(b,event){const r=findRow(b.dataset.row),u=r?r.units[+b.dataset.unit]:data.closing.regions[+b.dataset.closing];tip.innerHTML=`<strong>${esc(u.family||'Closing · handwriting')}</strong>${esc(u.reading)}<small>${r?esc(lineLabel(r)):'The farewell'} · click for evidence</small>`;tip.hidden=false;const rect=b.getBoundingClientRect();let x=event?.clientX||rect.left,y=event?.clientY||rect.bottom;x=Math.min(innerWidth-tip.offsetWidth-10,Math.max(8,x+12));y=Math.min(innerHeight-tip.offsetHeight-10,y+17);tip.style.left=x+'px';tip.style.top=Math.max(8,y)+'px';}
  function initialize(){
    document.title=data.title+' · The Desportes letters · prinz.';
    $('#hero-title').textContent=data.title;$('#hero-subtitle').textContent=data.subtitle;$('#hero-intro').textContent=data.intro;$('#letter-number').textContent=`Letter ${data.number} / 02`;
    $('#other-letter').href=BASE+data.other+'/';$('#other-letter-name').textContent=data.otherTitle;$('#footer-other').href=BASE+data.other+'/';$('#footer-other').textContent=data.otherTitle+' →';
    $('#hero-strip').src=asset(data.rows[0].image);$('#row-count').textContent=`${data.rows.length} body lines + closing`;
    $('#reading-status').innerHTML=esc(data.status)+' '+buttonNote(data.slug==='frachetta'?'gondi':'editorial','Read the note');
    $('#edition-date').textContent=data.edition;$('#download-data').href='edition.json';
    $('#line-select').innerHTML=data.folios.map(f=>`<optgroup label="${f.replace('f','f. ')}">${data.rows.filter(r=>r.folio===f).map(r=>`<option value="${r.id}">${lineLabel(r)}</option>`).join('')}</optgroup>`).join('');
    $('#manuscript-sources').innerHTML=data.folios.map(f=>`<li><a href="${esc(data.sources[f].url)}" target="_blank" rel="noopener noreferrer">${esc(data.sources[f].title)} · Gallica ${data.sources[f].canvas} ↗</a></li>`).join('');
    const puzzleFamilies=['A','B','F','G','E','E'];$('#puzzle').innerHTML=puzzleFamilies.map((c,i)=>{const k=data.key.find(k=>k.class===c);return `<button data-puzzle="${i}" data-choice="0" aria-label="Sign ${i+1}: ${k.values.join(' or ')}. Click to switch."><img src="${asset(k.image)}" alt=""><span>${k.values[0]}</span></button>`;}).join('');
    const initial=new URL(location).searchParams.get('view');setView(initial||'source');
    if(findRow(location.hash.slice(1)))setTimeout(()=>jump(location.hash.slice(1)),100);
    const loading=$('#loading');if(loading)loading.hidden=true;
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||!data)return;
    if(b.dataset.view)setView(b.dataset.view);
    else if(b.dataset.note)showNote(b.dataset.note);
    else if(b.dataset.jump)jump(b.dataset.jump);
    else if(b.dataset.line)showLine(b.dataset.line);
    else if(b.dataset.unit!==undefined)showSymbol(b.dataset.row,+b.dataset.unit);
    else if(b.dataset.neighbor&&selectedRow!==null&&selectedUnit!==null)showSymbol(selectedRow,selectedUnit+Number(b.dataset.neighbor));
    else if(b.dataset.scan)showScan(b.dataset.scan);
    else if(b.dataset.puzzle!==undefined){const families=['A','B','F','G','E','E'],k=data.key.find(k=>k.class===families[+b.dataset.puzzle]);b.dataset.choice=1-Number(b.dataset.choice);b.querySelector('span').textContent=k.values[+b.dataset.choice];const word=[...document.querySelectorAll('[data-puzzle] span')].map(s=>s.textContent).join('');$('#puzzle-result').textContent=word==='NOSTRE'?'NOSTRE — “our.” You have read the opening word.':word+' · Try the other choices, or reveal the word.';}
    else if(b.id==='puzzle-reveal'){const values='NOSTRE',families=['A','B','F','G','E','E'];document.querySelectorAll('[data-puzzle]').forEach((b,i)=>{b.querySelector('span').textContent=values[i];b.dataset.choice=data.key.find(k=>k.class===families[i]).values.indexOf(values[i]);});$('#puzzle-result').textContent='NOSTRE — “our.” Six signs, read through context.';}
    else if(b.id==='zoom'){zoom=!zoom;b.setAttribute('aria-pressed',String(zoom));b.textContent=zoom?'Zoom ×1':'Zoom ×2';reader.classList.toggle('enlarged',zoom);}
  });
  reader.addEventListener('pointerover',e=>{const b=e.target.closest('.hit,.closing-hit');if(b&&e.pointerType!=='touch')showTip(b,e);});
  reader.addEventListener('pointermove',e=>{const b=e.target.closest('.hit,.closing-hit');if(b&&!tip.hidden)showTip(b,e);});
  reader.addEventListener('pointerout',e=>{if(e.target.closest('.hit,.closing-hit'))tip.hidden=true;});
  reader.addEventListener('focusin',e=>{if(e.target.matches('.hit,.closing-hit'))showTip(e.target);});
  reader.addEventListener('focusout',()=>tip.hidden=true);
  reader.addEventListener('keydown',e=>{const b=e.target.closest('.hit');if(!b||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const group=[...b.parentElement.querySelectorAll('.hit')],i=group.indexOf(b),j=e.key==='Home'?0:e.key==='End'?group.length-1:Math.max(0,Math.min(group.length-1,i+(e.key==='ArrowLeft'?-1:1)));group.forEach(x=>x.tabIndex=-1);group[j].tabIndex=0;group[j].focus();});
  $('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...document.querySelectorAll('[data-view]')],i=tabs.indexOf(document.activeElement);if(i<0)return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowLeft'?-1:1)+3)%3;setView(tabs[j].dataset.view);tabs[j].focus();});
  $('#close-drawer').addEventListener('click',()=>drawer.close());$('#close-scan').addEventListener('click',()=>$('#scan-dialog').close());
  drawer.addEventListener('close',()=>{tip.hidden=true;drawer.removeAttribute('aria-label');});
  $('#show-boxes').addEventListener('change',e=>{boxes=e.target.checked;reader.classList.toggle('show-boxes',boxes);});
  $('#show-readings').addEventListener('change',e=>{readings=e.target.checked;renderReader();});
  $('#line-select').addEventListener('change',e=>{const el=document.getElementById(e.target.value);el?.scrollIntoView({block:'center'});});
  window.addEventListener('scroll',()=>tip.hidden=true,{passive:true});
  fetch('edition.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`Edition request failed (${r.status})`);return r.json();}).then(d=>{data=d;initialize();}).catch(err=>{console.error(err);reader.innerHTML='<div class="error"><strong>The edition could not load.</strong><p>Please reload the page. The manuscript links below remain available.</p><button class="utility" onclick="location.reload()">Reload</button></div>';});
})();
