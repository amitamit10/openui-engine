(function(){
var d=document,root=d.documentElement;root.classList.add('js');
var nav=d.querySelector('.nav');
function stuck(){if(nav)nav.classList.toggle('is-stuck',window.scrollY>8)}
stuck();window.addEventListener('scroll',stuck,{passive:true});
var t=d.querySelector('[data-nav-toggle]');
if(t){var sheet=d.getElementById(t.getAttribute('aria-controls'));
t.addEventListener('click',function(){var o=t.getAttribute('aria-expanded')==='true';t.setAttribute('aria-expanded',String(!o));t.setAttribute('aria-label',o?'Open menu':'Close menu');sheet.hidden=o;});
sheet.addEventListener('click',function(e){if(e.target.tagName==='A'){sheet.hidden=true;t.setAttribute('aria-expanded','false');}});}
d.querySelectorAll('[data-billing]').forEach(function(b){b.addEventListener('click',function(){
var m=b.getAttribute('data-billing');
d.querySelectorAll('[data-billing]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});
d.querySelectorAll('[data-price]').forEach(function(p){var v=p.getAttribute('data-'+m);var n=Number(v);p.textContent=(isNaN(n)?'':'$')+v;});
});});
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var els=d.querySelectorAll('.reveal');
if(reduce||!('IntersectionObserver' in window)||root.getAttribute('data-motion')==='0'){els.forEach(function(e){e.classList.add('in')});}
else{var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});els.forEach(function(e){io.observe(e)});
window.addEventListener('beforeprint',function(){els.forEach(function(e){e.classList.add('in')})});}
})();