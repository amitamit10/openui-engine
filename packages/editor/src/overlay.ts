/** Script injected into the previewed page. Same-origin postMessage bridge with the editor shell. */
export const OVERLAY_JS = String.raw`(function(){
if(window.__openuiOverlay)return;window.__openuiOverlay=true;
var mode='select',sel=null,hover=null,pins=[];
var box=document.createElement('div');box.setAttribute('data-oui-ui','');
box.style.cssText='position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #7c6cff;background:rgba(124,108,255,.10);border-radius:4px;display:none;transition:all 60ms';
var selBox=box.cloneNode();selBox.style.border='2px solid #3ddc97';selBox.style.background='rgba(61,220,151,.08)';selBox.style.transition='none';
var tag=document.createElement('div');tag.setAttribute('data-oui-ui','');tag.style.cssText='position:fixed;z-index:2147483647;pointer-events:none;background:#7c6cff;color:#fff;font:600 11px/1 ui-monospace,monospace;padding:4px 6px;border-radius:4px;display:none;white-space:nowrap';
document.documentElement.appendChild(box);document.documentElement.appendChild(selBox);document.documentElement.appendChild(tag);
var pinLayer=document.createElement('div');pinLayer.setAttribute('data-oui-ui','');pinLayer.style.cssText='position:absolute;left:0;top:0;width:0;height:0;z-index:2147483645;pointer-events:none';document.documentElement.appendChild(pinLayer);
function isUi(el){return el&&el.closest&&el.closest('[data-oui-ui]');}
function path(el){if(el.id)return '#'+el.id;var p=[];while(el&&el.nodeType===1&&el!==document.body&&p.length<5){var s=el.tagName.toLowerCase();if(el.id){p.unshift('#'+el.id);break;}var i=1,sib=el;while((sib=sib.previousElementSibling))if(sib.tagName===el.tagName)i++;p.unshift(s+':nth-of-type('+i+')');el=el.parentElement;}return p.join(' > ');}
function oid(el){var n=el.closest('[data-openui-id]');return n?n.getAttribute('data-openui-id'):null;}
function resolveTarget(el){var n=el;while(n&&n!==document.body){if(n.hasAttribute&&n.hasAttribute('data-openui-id'))return n;n=n.parentElement;}return el;}
function info(el){var cs=getComputedStyle(el),r=el.getBoundingClientRect();var sec=el.closest('[data-openui-section]');
function px(v){return Math.round(parseFloat(v)*10)/10;}
return{openuiId:el.getAttribute('data-openui-id'),selector:path(el),tag:el.tagName.toLowerCase(),text:(el.textContent||'').trim().slice(0,60),
section:sec?{id:sec.getAttribute('data-openui-section'),variant:sec.getAttribute('data-openui-variant')}:null,
rect:{x:r.left,y:r.top,w:r.width,h:r.height},
style:{'font-size':px(cs.fontSize),'font-weight':cs.fontWeight,'line-height':cs.lineHeight,'letter-spacing':cs.letterSpacing,color:cs.color,'background-color':cs.backgroundColor,'text-align':cs.textAlign,
'padding-top':px(cs.paddingTop),'padding-right':px(cs.paddingRight),'padding-bottom':px(cs.paddingBottom),'padding-left':px(cs.paddingLeft),
'margin-top':px(cs.marginTop),'margin-bottom':px(cs.marginBottom),gap:px(cs.rowGap)||0,width:px(cs.width),'border-radius':px(cs.borderTopLeftRadius),'box-shadow':cs.boxShadow,display:cs.display,'flex-direction':cs.flexDirection,opacity:cs.opacity}};}
function place(b,el){if(!el){b.style.display='none';return;}var r=el.getBoundingClientRect();b.style.display='block';b.style.left=r.left+'px';b.style.top=r.top+'px';b.style.width=r.width+'px';b.style.height=r.height+'px';}
function renderPins(){pinLayer.innerHTML='';pins.forEach(function(p,i){var el=null;try{el=p.openuiId?document.querySelector('[data-openui-id="'+p.openuiId+'"]'):(p.selector?document.querySelector(p.selector):null);}catch(e){}if(!el)return;var r=el.getBoundingClientRect();var d=document.createElement('div');d.setAttribute('data-oui-ui','');d.textContent=String(i+1);d.style.cssText='position:absolute;pointer-events:none;left:'+(r.left+scrollX+r.width-10)+'px;top:'+(r.top+scrollY-10)+'px;width:22px;height:22px;border-radius:50%;background:'+(p.resolved?'#6b7280':'#f59e0b')+';color:#111;font:700 11px/22px system-ui;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.4)';pinLayer.appendChild(d);});}
document.addEventListener('mousemove',function(e){if(mode!=='select')return;var el=e.target;if(isUi(el))return;el=resolveTarget(el);hover=el;place(box,el);if(el&&el!==document.body){var r=el.getBoundingClientRect();tag.style.display='block';tag.textContent=(el.getAttribute('data-openui-id')||el.tagName.toLowerCase());tag.style.left=Math.max(4,r.left)+'px';tag.style.top=Math.max(4,r.top-22)+'px';}else tag.style.display='none';},true);
document.addEventListener('click',function(e){if(mode!=='select')return;if(isUi(e.target))return;e.preventDefault();e.stopPropagation();var el=resolveTarget(e.target);if(!el||el===document.body||el===document.documentElement)return;sel=el;place(selBox,el);parent.postMessage({type:'oui:select',info:info(el)},location.origin);},true);
document.addEventListener('submit',function(e){if(mode==='select')e.preventDefault();},true);
window.addEventListener('scroll',function(){place(selBox,sel);place(box,hover);},{passive:true});
window.addEventListener('resize',function(){place(selBox,sel);renderPins();});
function find(m){try{return m.openuiId?document.querySelector('[data-openui-id="'+m.openuiId+'"]'):document.querySelector(m.selector);}catch(e){return null;}}
window.addEventListener('message',function(e){if(e.origin!==location.origin)return;var m=e.data||{};
if(m.type==='oui:mode'){mode=m.mode;if(mode!=='select'){box.style.display='none';tag.style.display='none';}}
if(m.type==='oui:apply'){var el=find(m);if(!el)return;Object.keys(m.props).forEach(function(k){el.style.setProperty(k,m.props[k],'important');});place(selBox,el);parent.postMessage({type:'oui:select',info:info(el)},location.origin);}
if(m.type==='oui:revert'){var el2=find(m);if(el2){Object.keys(m.props).forEach(function(k){el2.style.removeProperty(k);});place(selBox,el2);}}
if(m.type==='oui:pins'){pins=m.pins||[];renderPins();}
if(m.type==='oui:select-by'){var el3=find(m);if(el3){sel=el3;el3.scrollIntoView({block:'center',behavior:'instant'});place(selBox,el3);parent.postMessage({type:'oui:select',info:info(el3)},location.origin);}}
});
parent.postMessage({type:'oui:ready'},location.origin);
})();`;
