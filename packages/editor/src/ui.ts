/** The editor shell: preview iframe + inspector. Plain HTML/JS, no build step, no external requests. */
export function editorHtml(opts: { sessionId: string; title: string; kind: "project" | "url"; variants: Record<string, string[]> }): string {
  const cfg = JSON.stringify({ id: opts.sessionId, kind: opts.kind, variants: opts.variants }).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OpenUI Editor — ${opts.title.replace(/[<>&"]/g, "")}</title>
<style>
:root{--bg:#0b0b10;--panel:#12121a;--panel2:#181824;--line:#262636;--text:#ececf4;--muted:#9a9ab2;--acc:#7c6cff;--ok:#3ddc97;--warn:#f59e0b;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;font:13px/1.45 Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);height:100vh;display:grid;grid-template-rows:48px 1fr;overflow:hidden}
button,input,select,textarea{font:inherit;color:inherit}
header{display:flex;align-items:center;gap:12px;padding:0 14px;border-bottom:1px solid var(--line);background:var(--panel)}
.logo{font-weight:700;letter-spacing:-.02em}.logo b{color:var(--acc)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.seg button{background:transparent;border:0;padding:6px 12px;cursor:pointer;color:var(--muted)}
.seg button[aria-pressed=true]{background:var(--acc);color:#fff}
.spacer{flex:1}.pill{padding:3px 10px;border-radius:99px;border:1px solid var(--line);color:var(--muted);font-size:12px}
.pill.on{color:var(--ok);border-color:#1e5b44}
main{display:grid;grid-template-columns:1fr 340px;min-height:0}
.canvas{background:repeating-conic-gradient(#0e0e14 0 25%,#0b0b10 0 50%) 0 0/20px 20px;display:flex;justify-content:center;overflow:auto;padding:16px}
.frame{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 20px 60px -20px #000;height:100%;width:100%;transition:width .25s}
iframe{width:100%;height:100%;border:0;background:#fff}
aside{border-left:1px solid var(--line);background:var(--panel);display:grid;grid-template-rows:auto 1fr;min-height:0}
.tabs{display:flex;border-bottom:1px solid var(--line)}.tabs button{flex:1;background:none;border:0;padding:11px 0;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent}
.tabs button[aria-selected=true]{color:var(--text);border-color:var(--acc)}
.pane{overflow:auto;padding:14px;display:none}.pane.on{display:block}
.sel{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px;margin-bottom:12px}
.sel code{color:var(--ok);font-size:12px;word-break:break-all}.sel small{display:block;color:var(--muted)}
h4{margin:14px 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.row{display:grid;grid-template-columns:96px 1fr;gap:8px;align-items:center;margin:6px 0}
.row label{color:var(--muted)}
input[type=number],input[type=text],select,textarea{width:100%;background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:6px 8px}
input[type=color]{width:100%;height:30px;background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:2px}
input[type=range]{width:100%}textarea{min-height:88px;resize:vertical}
.btn{background:var(--acc);border:0;border-radius:8px;padding:8px 12px;cursor:pointer;font-weight:600;color:#fff}.btn.ghost{background:var(--panel2);border:1px solid var(--line);color:var(--text)}.btn.ok{background:var(--ok);color:#06140d}
.btns{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.empty{color:var(--muted);padding:20px 4px;text-align:center}
.item{border:1px solid var(--line);background:var(--panel2);border-radius:10px;padding:9px;margin:8px 0}.item.done{opacity:.55}
.item small{color:var(--muted);display:block;margin-top:4px}
.toast{position:fixed;bottom:16px;left:16px;background:var(--panel2);border:1px solid var(--line);padding:10px 14px;border-radius:10px;opacity:0;transition:opacity .2s;pointer-events:none}.toast.on{opacity:1}
@media(max-width:900px){main{grid-template-columns:1fr}aside{display:none}}
</style></head><body>
<header>
  <div class="logo">Open<b>UI</b> Editor</div>
  <div class="seg" role="group" aria-label="Viewport"><button data-vp="100%" aria-pressed="true">Desktop</button><button data-vp="820px" aria-pressed="false">Tablet</button><button data-vp="390px" aria-pressed="false">Mobile</button></div>
  <div class="seg" role="group" aria-label="Mode"><button data-mode="select" aria-pressed="true">Select</button><button data-mode="interact" aria-pressed="false">Interact</button></div>
  <div class="spacer"></div><span class="pill" id="agent">agent: waiting</span><span class="pill" id="pending">0 pending tweaks</span>
  <button class="btn ok" id="apply">Apply to source</button>
</header>
<main>
  <div class="canvas"><div class="frame" id="frame"><iframe id="pv" title="Preview" src="/s/${opts.sessionId}/preview/"></iframe></div></div>
  <aside>
    <div class="tabs" role="tablist"><button role="tab" aria-selected="true" data-tab="style">Style</button><button role="tab" aria-selected="false" data-tab="comments">Comments</button><button role="tab" aria-selected="false" data-tab="ask">Ask agent</button></div>
    <section class="pane on" id="p-style"><div class="empty" id="nosel">Click any element in the preview to inspect and tweak it.</div><div id="inspector" hidden></div></section>
    <section class="pane" id="p-comments"><div class="item" style="border-style:dashed"><textarea id="ctext" placeholder="Comment on the selected element…"></textarea><div class="btns"><button class="btn" id="cadd">Add comment</button></div></div><div id="clist"></div></section>
    <section class="pane" id="p-ask"><textarea id="rtext" placeholder="Describe the change in plain language, e.g. “make the hero headline larger and the CTA more prominent”."></textarea><div class="btns"><button class="btn" id="radd">Send to coding agent</button></div><div id="rlist"></div></section>
  </aside>
</main><div class="toast" id="toast"></div>
<script>
var CFG=${cfg};var API='/s/'+CFG.id+'/api/';var cur=null;var tweaks={};var state={comments:[],requests:[],tweaks:[]};
function $(s){return document.querySelector(s)}function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(function(){t.classList.remove('on')},1800)}
function api(p,body,method){return fetch(API+p,{method:method||(body?'POST':'GET'),headers:{'content-type':'application/json'},credentials:'same-origin',body:body?JSON.stringify(body):undefined}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||r.statusText);return j})})}
var pv=$('#pv');function post(m){pv.contentWindow.postMessage(m,location.origin)}
function key(i){return i.openuiId?{openuiId:i.openuiId}:{selector:i.selector}}
document.querySelectorAll('[data-vp]').forEach(function(b){b.onclick=function(){document.querySelectorAll('[data-vp]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});$('#frame').style.width=b.dataset.vp}});
document.querySelectorAll('[data-mode]').forEach(function(b){b.onclick=function(){document.querySelectorAll('[data-mode]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});post({type:'oui:mode',mode:b.dataset.mode})}});
document.querySelectorAll('[data-tab]').forEach(function(b){b.onclick=function(){document.querySelectorAll('[data-tab]').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});document.querySelectorAll('.pane').forEach(function(p){p.classList.remove('on')});$('#p-'+b.dataset.tab).classList.add('on')}});
function rgbHex(c){var m=c.match(/[\\d.]+/g);if(!m||m.length<3)return'#000000';if(m.length>3&&Number(m[3])===0)return'#ffffff';return'#'+m.slice(0,3).map(function(x){return('0'+Math.round(Number(x)).toString(16)).slice(-2)}).join('')}
var FIELDS=[['Typography',[['font-size','num','px',8,120],['font-weight','sel',['300','400','500','600','700','800']],['line-height','txt'],['letter-spacing','txt'],['text-align','sel',['left','center','right']],['color','color']]],
['Spacing',[['padding-top','num','px',0,200],['padding-bottom','num','px',0,200],['padding-left','num','px',0,200],['padding-right','num','px',0,200],['margin-top','num','px',-100,200],['margin-bottom','num','px',-100,200],['gap','num','px',0,120]]],
['Box',[['width','num','px',0,1600],['border-radius','num','px',0,80],['background-color','color'],['opacity','range',0,1,.05],['box-shadow','sel',['none','0 1px 2px rgba(0,0,0,.2)','0 8px 24px -8px rgba(0,0,0,.35)','0 24px 60px -16px rgba(0,0,0,.5)','6px 6px 0 #111']]]],
['Layout',[['display','sel',['block','flex','grid','inline-flex','none']],['flex-direction','sel',['row','column','row-reverse','column-reverse']]]]];
function setProp(info,prop,val){var p={};p[prop]=val;post(Object.assign({type:'oui:apply',props:p},key(info)));
 var k=info.openuiId||info.selector;tweaks[k]=tweaks[k]||{info:info,props:{}};tweaks[k].props[prop]=val;
 api('tweak',Object.assign({props:p},key(info))).then(refresh).catch(function(e){toast(e.message)})}
function buildInspector(i){var box=$('#inspector');box.hidden=false;$('#nosel').hidden=true;
 var h='<div class="sel"><code>'+(i.openuiId||i.selector)+'</code><small>&lt;'+i.tag+'&gt; '+(i.section?'· section '+i.section.id+' ('+i.section.variant+')':'')+(i.openuiId?'':' · <b style="color:#f59e0b">no data-openui-id: tweak will be reported as an unmapped CSS patch</b>')+'</small></div>';
 if(i.section&&CFG.variants[i.section.variant]){h+='<h4>Variant</h4><div class="row"><label>Component</label><select id="variant">'+CFG.variants[i.section.variant].map(function(v){return'<option'+(v===i.section.variant?' selected':'')+'>'+v+'</option>'}).join('')+'</select></div>'}
 FIELDS.forEach(function(g){h+='<h4>'+g[0]+'</h4>';g[1].forEach(function(f){var n=f[0],t=f[1],v=i.style[n];h+='<div class="row"><label>'+n.replace('-',' ')+'</label>';
  if(t==='num')h+='<input type="number" data-p="'+n+'" data-u="'+f[2]+'" min="'+f[3]+'" max="'+f[4]+'" value="'+(parseFloat(v)||0)+'">';
  else if(t==='color')h+='<input type="color" data-p="'+n+'" value="'+rgbHex(String(v))+'">';
  else if(t==='range')h+='<input type="range" data-p="'+n+'" min="'+f[2]+'" max="'+f[3]+'" step="'+f[4]+'" value="'+v+'">';
  else if(t==='sel'){var opts=f[2].slice();if(opts.indexOf(String(v))<0)opts.unshift(String(v));h+='<select data-p="'+n+'">'+opts.map(function(o){return'<option'+(o===String(v)?' selected':'')+'>'+o+'</option>'}).join('')+'</select>'}
  else h+='<input type="text" data-p="'+n+'" value="'+v+'">';h+='</div>'})});
 h+='<div class="btns"><button class="btn ghost" id="reset">Reset element</button></div>';box.innerHTML=h;
 box.querySelectorAll('[data-p]').forEach(function(el){var ev=el.tagName==='SELECT'||el.type==='color'?'change':'input';el.addEventListener(ev,function(){var v=el.value;if(el.dataset.u)v=v+el.dataset.u;setProp(cur,el.dataset.p,v)})});
 var vs=$('#variant');if(vs)vs.onchange=function(){api('variant',{sectionId:i.section.id,type:vs.value}).then(function(){toast('Variant applied — reloading');pv.contentWindow.location.reload()}).catch(function(e){toast(e.message)})};
 $('#reset').onclick=function(){var k=cur.openuiId||cur.selector;if(tweaks[k]){post(Object.assign({type:'oui:revert',props:tweaks[k].props},key(cur)));delete tweaks[k]}api('tweak/discard',key(cur)).then(refresh);toast('Reset')}}
window.addEventListener('message',function(e){if(e.origin!==location.origin)return;var m=e.data||{};
 if(m.type==='oui:select'){cur=m.info;buildInspector(cur)}
 if(m.type==='oui:ready'){pushPins();post({type:'oui:mode',mode:document.querySelector('[data-mode][aria-pressed=true]').dataset.mode})}});
function pushPins(){post({type:'oui:pins',pins:state.comments.map(function(c){return{openuiId:c.openuiId,selector:c.selector,resolved:c.resolved}})})}
function render(){$('#pending').textContent=state.tweaks.length+' pending tweak'+(state.tweaks.length===1?'':'s');
 $('#agent').textContent=state.unread?('agent: '+state.unread+' unread'):'agent: all read';$('#agent').className='pill'+(state.unread?'':' on');
 $('#clist').innerHTML=state.comments.length?state.comments.map(function(c,i){return'<div class="item'+(c.resolved?' done':'')+'"><b>#'+(i+1)+'</b> '+esc(c.text)+'<small>'+esc(c.openuiId||c.selector||'page')+'</small><div class="btns" style="margin-top:6px"><button class="btn ghost" data-go="'+c.id+'">Show</button>'+(c.resolved?'':'<button class="btn ghost" data-res="'+c.id+'">Resolve</button>')+'</div></div>'}).join(''):'<div class="empty">No comments yet.</div>';
 $('#rlist').innerHTML=state.requests.map(function(r){return'<div class="item'+(r.status==='handled'?' done':'')+'">'+esc(r.text)+'<small>'+r.status+(r.openuiId?' · '+esc(r.openuiId):'')+'</small></div>'}).join('');
 document.querySelectorAll('[data-res]').forEach(function(b){b.onclick=function(){api('comment/resolve',{id:b.dataset.res}).then(refresh)}});
 document.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){var c=state.comments.filter(function(x){return x.id===b.dataset.go})[0];post(Object.assign({type:'oui:select-by'},c.openuiId?{openuiId:c.openuiId}:{selector:c.selector}))}});pushPins()}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function refresh(){return api('state').then(function(s){state=s;render()})}
$('#cadd').onclick=function(){var t=$('#ctext').value.trim();if(!t)return;api('comment',Object.assign({text:t},cur?key(cur):{})).then(function(){$('#ctext').value='';refresh();toast('Comment added')}).catch(function(e){toast(e.message)})};
$('#radd').onclick=function(){var t=$('#rtext').value.trim();if(!t)return;api('request',Object.assign({text:t},cur?key(cur):{})).then(function(){$('#rtext').value='';refresh();toast('Sent to coding agent via MCP')}).catch(function(e){toast(e.message)})};
$('#apply').onclick=function(){api('apply',{}).then(function(r){toast(r.applied+' tweak(s) written to source'+(r.rejected.length?' · '+r.rejected.length+' rejected':''));tweaks={};refresh();pv.contentWindow.location.reload()}).catch(function(e){toast(e.message)})};
pv.addEventListener('load',function(){pushPins()});setInterval(refresh,2500);refresh();
</script></body></html>`;
}
