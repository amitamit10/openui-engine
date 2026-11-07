/** Base stylesheet for all OpenUI sections. Every value comes from tokens.css custom properties. */
export const BASE_CSS = String.raw`
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:88px}
body{margin:0;background:var(--c-bg);color:var(--c-text);font-family:var(--f-body);font-size:var(--t-body);line-height:var(--lh-body);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:clip}
img,svg{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;cursor:pointer}
h1,h2,h3,h4,p,ul,ol,figure,blockquote{margin:0}
ul,ol{padding:0;list-style:none}
:focus-visible{outline:2px solid var(--c-accent-text);outline-offset:3px;border-radius:var(--r-sm)}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.skip{position:absolute;left:12px;top:-60px;z-index:100;background:var(--c-accent);color:var(--c-accent-fg);padding:10px 16px;border-radius:var(--r-md);font-weight:600}
.skip:focus{top:12px}

.container{width:100%;max-width:calc(var(--container) + var(--gutter)*2);margin-inline:auto;padding-inline:var(--gutter)}
.section{padding-block:var(--section-y);position:relative}
.section:not(.section--tint):not(.section--ink)+.section:not(.section--tint):not(.section--ink){padding-top:calc(var(--section-y)*.3)}
.hero+.section:not(.section--tint),.hero+.logos{margin-top:0}
.section--tint{background:var(--c-surface)}
.section--ink{background:var(--c-text);color:var(--c-bg)}
.section--ink .metric{border-top-color:color-mix(in srgb,var(--c-bg) 30%,transparent)}
.section--ink .metric strong{color:var(--c-bg)}
.section--ink .metric span{color:color-mix(in srgb,var(--c-bg) 82%,var(--c-text))}
.section--ink .h2,.section--ink .h3,.section--ink .eyebrow{color:var(--c-bg)}
.hero__visual{position:relative}
.hfloat{display:grid;gap:2px;padding:var(--s-3) var(--s-4);background:var(--c-bg);color:var(--c-text);border:var(--bw) solid var(--c-border);border-radius:var(--r-lg);box-shadow:var(--sh-md);font-size:var(--t-small);line-height:1.3;z-index:2}
.hfloat span{color:var(--c-muted);font-size:var(--t-caption)}
.hfloat strong{font-family:var(--f-display);font-weight:var(--fw-h1);font-size:var(--t-h4);display:flex;align-items:center;gap:var(--s-2)}
.hfloat strong::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c-accent);flex:none}
.hfloat--good strong::before{background:var(--c-success)}.hfloat--warn strong::before{background:var(--c-warning)}
.hero__visual:has(.hero__floats){margin-bottom:72px}
.hero__floats{position:absolute;left:var(--s-5);right:var(--s-5);bottom:-60px;display:flex;justify-content:space-between;gap:var(--s-3);pointer-events:none}
.hero__floats .hfloat{position:relative;pointer-events:auto}
.hero__floats .hfloat:nth-child(odd){transform:rotate(-1.5deg)}.hero__floats .hfloat:nth-child(even){transform:rotate(1.2deg)}
@media (max-width:940px){.hero__visual:has(.hero__floats){margin-bottom:0}.hero__floats{position:static;flex-wrap:wrap;margin-top:var(--s-4)}.hero__floats .hfloat{transform:none}}
.stack>*+*{margin-top:var(--s-4)}

.eyebrow{display:inline-flex;align-items:center;gap:var(--s-2);font-size:var(--t-caption);line-height:var(--lh-caption);font-weight:var(--fw-caption);letter-spacing:var(--tr-caption);text-transform:uppercase;color:var(--c-accent-text)}
.eyebrow::before{content:"";width:6px;height:6px;border-radius:var(--r-pill);background:var(--c-accent)}
.h-display{font-family:var(--f-display);font-size:var(--t-display);line-height:var(--lh-display);font-weight:var(--fw-display);letter-spacing:var(--tr-display);text-wrap:balance}
.h1{font-family:var(--f-display);font-size:var(--t-h1);line-height:var(--lh-h1);font-weight:var(--fw-h1);letter-spacing:var(--tr-h1);text-wrap:balance}
.h2{font-family:var(--f-display);font-size:var(--t-h2);line-height:var(--lh-h2);font-weight:var(--fw-h2);letter-spacing:var(--tr-h2);text-wrap:balance}
.h3{font-family:var(--f-display);font-size:var(--t-h3);line-height:var(--lh-h3);font-weight:var(--fw-h3);letter-spacing:var(--tr-h3)}
.h4{font-size:var(--t-h4);line-height:var(--lh-h4);font-weight:var(--fw-h4);letter-spacing:var(--tr-h4)}
.lead{font-size:var(--t-body-lg);line-height:var(--lh-body-lg);color:var(--c-muted);text-wrap:pretty}
.muted{color:var(--c-muted)}
.small{font-size:var(--t-small);line-height:var(--lh-small)}
.mono{font-family:var(--f-mono)}
.h-display em,.h1 em,.h2 em{font-style:normal;color:var(--c-accent-text)}
[data-style="aurora-dark"] .h-display em,[data-style="aurora-dark"] .h1 em{background:linear-gradient(100deg,var(--c-accent-text),color-mix(in srgb,var(--c-accent-text) 55%,#fff));-webkit-background-clip:text;background-clip:text;color:transparent}
[data-style="editorial-paper"] .h-display em,[data-style="editorial-paper"] .h1 em,[data-style="editorial-paper"] .h2 em,[data-style="field-notes"] .h-display em,[data-style="field-notes"] .h1 em,[data-style="field-notes"] .h2 em{font-style:italic;color:var(--c-accent-text)}
[data-style="neo-brutal"] .h-display em,[data-style="neo-brutal"] .h1 em{background:var(--c-accent);color:var(--c-accent-fg);padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}

.section-head{max-width:720px;margin-inline:auto;text-align:center;display:grid;gap:var(--s-4);justify-items:center;margin-bottom:var(--s-8)}
.section-head--left{margin-inline:0;text-align:left;justify-items:start}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--s-2);min-height:44px;padding:0 var(--s-5);border-radius:var(--r-pill);border:var(--bw) solid transparent;font-weight:600;font-size:var(--t-body);line-height:1;white-space:nowrap;transition:transform var(--dur-fast) var(--ease),background var(--dur-base) var(--ease),box-shadow var(--dur-base) var(--ease),border-color var(--dur-base) var(--ease)}
.btn--lg{min-height:52px;padding:0 var(--s-6);font-size:var(--t-body-lg)}
.btn--primary{background:var(--c-accent);color:var(--c-accent-fg);box-shadow:var(--sh-sm)}
.btn--primary:hover{transform:translateY(-1px);box-shadow:var(--sh-glow)}
.btn--ghost{background:transparent;border-color:var(--c-border);color:var(--c-text)}
.btn--ghost:hover{background:var(--c-surface2);transform:translateY(-1px)}
.btn--link{padding:0;min-height:44px;border-radius:0;color:var(--c-accent-text)}
.btn--link:hover{text-decoration:underline;text-underline-offset:4px}
.btn svg{width:16px;height:16px}
[data-style="neo-brutal"] .btn--primary{border-color:var(--c-border);box-shadow:var(--sh-md)}
[data-style="neo-brutal"] .btn--primary:hover{transform:translate(-2px,-2px);box-shadow:var(--sh-lg)}
[data-style="neo-brutal"] .btn--ghost{border-color:var(--c-border);background:var(--c-surface)}

/* nav */
.nav{position:sticky;top:0;z-index:50;border-bottom:var(--bw) solid transparent;transition:background var(--dur-base),border-color var(--dur-base),backdrop-filter var(--dur-base)}
.nav.is-stuck{background:color-mix(in srgb,var(--c-bg) 78%,transparent);backdrop-filter:saturate(1.4) blur(14px);-webkit-backdrop-filter:saturate(1.4) blur(14px);border-color:var(--c-border)}
.nav__row{display:flex;align-items:center;justify-content:space-between;height:68px;gap:var(--s-5)}
.brand{display:inline-flex;align-items:center;gap:var(--s-3);font-family:var(--f-display);font-weight:var(--fw-h3);font-size:var(--t-h4);letter-spacing:-.02em}
.brand__mark{width:28px;height:28px;border-radius:var(--r-md);background:linear-gradient(135deg,color-mix(in srgb,var(--c-accent) 70%,#fff),var(--c-accent));display:grid;place-items:center;color:var(--c-accent-fg)}
.brand__mark svg{width:16px;height:16px}
.brand__mark{font-family:var(--f-display);font-weight:700;font-size:15px;line-height:1}
.brand__mark::before{content:attr(data-i)}
[data-style="neo-brutal"] .brand__mark{border:var(--bw) solid var(--c-border);background:var(--c-accent)}
.nav__links{display:flex;gap:var(--s-2);align-items:center}
.nav__links a:not(.btn){min-height:44px;display:inline-flex;align-items:center;padding:10px 16px;border-radius:var(--r-pill);color:var(--c-muted);font-weight:500;font-size:var(--t-small);transition:color var(--dur-fast),background var(--dur-fast)}
.nav__links a:not(.btn):hover{color:var(--c-text);background:var(--c-surface2)}
.nav__actions{display:flex;gap:var(--s-3);align-items:center}
.nav__toggle{display:none;width:44px;height:44px;border-radius:var(--r-md);border:var(--bw) solid var(--c-border);background:var(--c-surface);align-items:center;justify-content:center}
.nav__toggle svg{width:20px;height:20px}
.nav__sheet{display:none}
@media (max-width:880px){
  .nav__links,.nav__actions .btn--ghost{display:none}
  .nav__actions>.btn--primary{display:none}
  .nav__sheet .btn{width:100%}
  .nav__toggle{display:inline-flex}
  .nav__sheet{display:grid;gap:var(--s-1);padding:var(--s-4) var(--gutter) var(--s-6);border-top:var(--bw) solid var(--c-border);background:var(--c-bg)}
  .nav__sheet[hidden]{display:none}
  .nav__sheet a{padding:12px 8px;font-weight:500;border-radius:var(--r-md);min-height:44px;display:flex;align-items:center}
  .nav__sheet .btn{margin-top:var(--s-3)}
}

/* hero */
.hero{padding-top:clamp(32px,6vw,72px);padding-bottom:calc(var(--section-y)*.55);overflow:clip;position:relative;isolation:isolate}
.hero::before{content:"";position:absolute;inset:-20% -10% auto -10%;height:90%;z-index:-1;pointer-events:none;background:radial-gradient(60% 60% at 50% 0%,var(--accent-glow),transparent 70%)}
[data-mode-ui="light"] .hero::before{opacity:.55}
[data-style="editorial-paper"] .hero::before,[data-style="field-notes"] .hero::before,[data-style="neo-brutal"] .hero::before{display:none}
.hero__grid{position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(var(--c-border) 1px,transparent 1px),linear-gradient(90deg,var(--c-border) 1px,transparent 1px);background-size:64px 64px;opacity:.28;mask-image:radial-gradient(70% 60% at 50% 0%,#000,transparent 75%);-webkit-mask-image:radial-gradient(70% 60% at 50% 0%,#000,transparent 75%)}
[data-style="editorial-paper"] .hero__grid,[data-style="field-notes"] .hero__grid,[data-style="neo-brutal"] .hero__grid,[data-style="warm-human"] .hero__grid{display:none}
.hero--centered .hero__copy{max-width:880px;margin-inline:auto;text-align:center;display:grid;gap:var(--s-5);justify-items:center}
.badge{display:inline-flex;align-items:center;gap:var(--s-2);padding:6px 12px 6px 8px;border-radius:var(--r-pill);border:var(--bw) solid var(--c-border);background:color-mix(in srgb,var(--c-surface) 80%,transparent);font-size:var(--t-small);font-weight:500;color:var(--c-muted)}
.badge b{background:var(--c-accent);color:var(--c-accent-fg);border-radius:var(--r-pill);padding:2px 10px;font-weight:600;font-size:var(--t-caption)}
.cta-row{display:flex;flex-wrap:wrap;gap:var(--s-3);align-items:center}
.hero--centered .cta-row{justify-content:center}
.hero__note{font-size:var(--t-small);color:var(--c-muted)}
.hero__visual{margin-top:clamp(40px,6vw,72px)}
.hero--split .hero__row{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,1fr);gap:clamp(32px,5vw,72px);align-items:center}
.hero--split .hero__copy{display:grid;gap:var(--s-5);justify-items:start}
.hero--split .hero__visual{margin-top:0}
@media (max-width:940px){.hero--split .hero__row{grid-template-columns:minmax(0,1fr)}}
.hero--editorial .hero__copy{display:grid;gap:var(--s-6);max-width:1040px}
.hero--editorial .hero__foot{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--s-6);margin-top:var(--s-8);padding-top:var(--s-6);border-top:var(--bw) solid var(--c-border)}

/* product frame + dashboard mock */
.frame{border-radius:var(--r-xl);border:var(--bw) solid var(--c-border);background:var(--c-surface);box-shadow:var(--sh-glow),var(--sh-lg);overflow:hidden;position:relative}
.frame__bar{display:flex;align-items:center;gap:var(--s-2);padding:12px 16px;border-bottom:var(--bw) solid var(--c-border);background:var(--c-surface2)}
.frame__dot{width:10px;height:10px;border-radius:var(--r-pill);background:var(--c-border)}
.frame__url{margin-left:var(--s-4);font-size:var(--t-caption);color:var(--c-muted);font-family:var(--f-mono);padding:4px 12px;border-radius:var(--r-pill);background:var(--c-bg);border:var(--bw) solid var(--c-border);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%}
.dash{display:grid;grid-template-columns:200px 1fr;min-height:360px}
.dash__side{padding:var(--s-4);border-right:var(--bw) solid var(--c-border);display:grid;align-content:start;gap:var(--s-1);background:var(--c-surface)}
.dash__side .item{display:flex;align-items:center;gap:var(--s-3);padding:8px 12px;border-radius:var(--r-md);font-size:var(--t-small);color:var(--c-muted);font-weight:500}
.dash__side .item i{width:14px;height:14px;border-radius:4px;border:1.5px solid currentColor;opacity:.7}
.dash__side .item.is-active{background:var(--c-accent-soft);color:var(--c-accent-text)}
.dash__main{padding:var(--s-5);display:grid;gap:var(--s-4);background:var(--c-bg);align-content:start}
.dash__top{display:flex;justify-content:space-between;align-items:center;gap:var(--s-3)}
.dash__top .title{font-weight:600;font-size:var(--t-body)}
.pill{padding:4px 10px;border-radius:var(--r-pill);background:var(--c-accent-soft);color:var(--c-accent-text);font-size:var(--t-caption);font-weight:600}
.kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s-3)}
.kpi{padding:var(--s-4);border-radius:var(--r-lg);border:var(--bw) solid var(--c-border);background:var(--c-surface)}
.kpi small{display:block;color:var(--c-muted);font-size:var(--t-caption);letter-spacing:.02em}
.kpi strong{display:block;font-family:var(--f-display);font-size:var(--t-h3);line-height:1.2;margin-top:4px;font-variant-numeric:tabular-nums}
.kpi em{font-style:normal;font-size:var(--t-caption);color:var(--c-success);font-weight:600}
.chart{padding:var(--s-4);border-radius:var(--r-lg);border:var(--bw) solid var(--c-border);background:var(--c-surface)}
.chart svg{width:100%;height:150px}
.chart .grid line{stroke:var(--c-border);stroke-width:1}
.chart .line{fill:none;stroke:var(--c-accent);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.chart .line2{fill:none;stroke:var(--c-accent2);stroke-width:2;stroke-dasharray:4 5;opacity:.8}
.chart .area{fill:url(#areaGrad)}
@media (max-width:720px){.dash{grid-template-columns:minmax(0,1fr)}.dash__side{display:none}.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.kpis .kpi:nth-child(3){display:none}.dash{min-height:0}}

/* logo cloud */
.logos{padding-block:var(--s-8)}
.logos__label{text-align:center;color:var(--c-muted);font-size:var(--t-small);margin-bottom:var(--s-6)}
.logos__row{display:flex;flex-wrap:wrap;justify-content:center;gap:var(--s-5) var(--s-7)}
.logo-word{font-family:var(--f-display);font-weight:600;font-size:var(--t-h4);letter-spacing:-.02em;color:var(--c-muted);display:inline-flex;align-items:center;gap:var(--s-2)}
.logo-word i{display:none}
.logo-word:nth-child(3n+2){font-family:var(--f-body);font-weight:700;letter-spacing:.01em;text-transform:none}
.logo-word:nth-child(3n){font-family:var(--f-mono);font-weight:500;font-size:var(--t-body);letter-spacing:-.02em}
.logo-word:nth-child(4n+1){font-style:italic}

/* cards + bento */
.card{border-radius:var(--r-lg);border:var(--bw) solid var(--c-border);background:var(--c-surface);padding:var(--s-6);box-shadow:var(--sh-sm);transition:transform var(--dur-base) var(--ease),box-shadow var(--dur-base) var(--ease),border-color var(--dur-base)}
.bento{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--s-4)}
.bento .card{display:grid;gap:var(--s-5);align-content:space-between;overflow:hidden;min-height:280px}
.bento .card:hover{border-color:color-mix(in srgb,var(--c-accent) 45%,var(--c-border));transform:translateY(-2px)}
.bento .span-2{grid-column:span 2}.bento .span-3{grid-column:span 3}.bento .span-4{grid-column:span 4}
.bento .card__text{display:grid;gap:var(--s-2)}
.bento .card__text p{color:var(--c-muted);font-size:var(--t-small);line-height:var(--lh-small);max-width:46ch}
@media (max-width:980px){.bento{grid-template-columns:repeat(2,minmax(0,1fr))}.bento .span-2,.bento .span-3,.bento .span-4{grid-column:span 2}.bento .span-2.half{grid-column:span 1}}
@media (max-width:620px){.bento{grid-template-columns:minmax(0,1fr)}.bento .span-2,.bento .span-3,.bento .span-4,.bento .span-2.half{grid-column:auto}.bento .card{min-height:0}}
.viz{border-radius:var(--r-md);background:var(--c-bg);border:var(--bw) solid var(--c-border);padding:var(--s-4);min-height:120px;display:grid;align-content:center;gap:var(--s-2);position:relative;overflow:hidden}
.viz--bars{display:flex;align-items:flex-end;gap:6px;height:150px;min-height:130px}
.viz--bars span{flex:1;border-radius:var(--r-sm) var(--r-sm) 2px 2px;background:linear-gradient(to top,var(--c-accent),color-mix(in srgb,var(--c-accent) 60%,#fff));opacity:.9}
.viz--list .row{display:flex;align-items:center;gap:var(--s-3);padding:8px 10px;border-radius:var(--r-md);background:var(--c-surface);border:var(--bw) solid var(--c-border);font-size:var(--t-small)}
.viz--list .row b{width:8px;height:8px;border-radius:var(--r-pill);background:var(--c-success)}
.viz--list .row:nth-child(2) b{background:var(--c-warning)}
.viz--list .row span:last-child{margin-left:auto;color:var(--c-muted);font-size:var(--t-caption)}
.viz--code code{display:block;font-family:inherit}.viz--code{font-family:var(--f-mono);font-size:var(--t-small);line-height:1.7;white-space:pre;overflow:hidden;color:var(--c-muted)}
.viz--code .k{color:var(--c-accent-text)}.viz--code .s{color:var(--c-success)}.viz--code .c{font-style:italic}
.viz--toggle{display:grid;gap:var(--s-3)}
.viz--toggle .t{display:flex;align-items:center;justify-content:space-between;font-size:var(--t-small);padding:8px 4px}
.sw{width:38px;height:22px;border-radius:var(--r-pill);background:var(--c-border);position:relative;flex:none}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:var(--r-pill);background:var(--c-bg);transition:transform var(--dur-base) var(--ease)}
.sw.on{background:var(--c-accent)}.sw.on::after{transform:translateX(16px);background:var(--c-accent-fg)}
.viz--avatars{display:flex;align-items:center}
.viz--avatars span{width:38px;height:38px;border-radius:var(--r-pill);border:2px solid var(--c-bg);margin-left:-10px;display:grid;place-items:center;font-size:var(--t-caption);font-weight:700}
.viz--avatars span:first-child{margin-left:0}
.viz--avatars span:nth-child(1){background:var(--c-accent);color:var(--c-accent-fg)}.viz--avatars span:nth-child(2){background:var(--c-accent2);color:var(--c-accent2-fg)}.viz--avatars span:nth-child(3){background:var(--c-success);color:var(--c-success-fg)}.viz--avatars span:nth-child(4){background:var(--c-warning);color:var(--c-warning-fg)}
.viz--avatars em{font-style:normal;margin-left:var(--s-3);color:var(--c-muted);font-size:var(--t-small)}

/* feature rows */
.rows{display:grid;gap:clamp(56px,8vw,112px)}
.frow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(32px,6vw,88px);align-items:center}
.frow:nth-child(even) .frow__copy{order:2}
.frow__copy{display:grid;gap:var(--s-4);justify-items:start}
.ticks{display:grid;gap:var(--s-3);margin-top:var(--s-2)}
.ticks li{display:flex;gap:var(--s-3);align-items:flex-start;color:var(--c-muted)}
.ticks svg{flex:none;width:20px;height:20px;margin-top:2px;color:var(--c-accent-text)}
@media (max-width:900px){.frow{grid-template-columns:minmax(0,1fr)}.frow:nth-child(even) .frow__copy{order:0}}

/* metrics */
.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--s-5)}
.metric{padding-top:var(--s-5);border-top:var(--bw) solid var(--c-border);display:grid;gap:var(--s-2)}
.metric strong{font-family:var(--f-display);font-weight:var(--fw-h1);font-size:var(--t-h1);line-height:1;letter-spacing:var(--tr-h1);font-variant-numeric:tabular-nums}
.metric span{color:var(--c-muted);font-size:var(--t-small)}
@media (max-width:820px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s-6) var(--s-5)}}

/* steps */
.steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s-4);counter-reset:s}
.step{display:grid;gap:var(--s-3);align-content:start}
.step:not(:has(.step__n,.step__num,.num,[data-step-number]))::before{counter-increment:s;content:"0" counter(s);font-family:var(--f-mono);font-size:var(--t-small);color:var(--c-accent-text);font-weight:500}
.step p{color:var(--c-muted)}
@media (max-width:820px){.steps{grid-template-columns:minmax(0,1fr)}}

/* testimonials */
.quotes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s-4)}
.quote{display:grid;gap:var(--s-5);align-content:space-between}
.quote blockquote{font-size:var(--t-body-lg);line-height:1.5;text-wrap:pretty}
.quote figcaption{display:flex;gap:var(--s-3);align-items:center}
.avatar{width:40px;height:40px;border-radius:var(--r-pill);display:grid;place-items:center;font-weight:700;font-size:var(--t-small);background:var(--c-accent-soft);color:var(--c-accent-text);flex:none}
.quote .who{display:grid;line-height:1.3}.quote .who span{color:var(--c-muted);font-size:var(--t-small)}
@media (max-width:980px){.quotes{grid-template-columns:minmax(0,1fr)}}

/* pricing */
.billing{display:inline-flex;padding:4px;border-radius:var(--r-pill);border:var(--bw) solid var(--c-border);background:var(--c-surface);gap:4px}
.billing button{border:0;background:transparent;padding:0 var(--s-4);min-height:44px;border-radius:var(--r-pill);font-weight:600;font-size:var(--t-small);color:var(--c-muted);display:inline-flex;align-items:center;gap:var(--s-2)}
.billing button[aria-pressed="true"]{background:var(--c-accent);color:var(--c-accent-fg)}
.billing .save{font-size:var(--t-caption);padding:2px 8px;border-radius:var(--r-pill);background:var(--c-accent-soft);color:var(--c-accent-text)}
.billing button[aria-pressed="true"] .save{background:rgba(255,255,255,.22);color:inherit}
.tiers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s-4);align-items:stretch}
.tier{display:grid;gap:var(--s-5);align-content:start;padding:var(--s-7) var(--s-6)}
.tier--featured{border-color:var(--c-accent);box-shadow:var(--sh-glow),var(--sh-md);position:relative;background:linear-gradient(to bottom,var(--c-accent-soft),var(--c-surface) 45%)}
.tier__tag{position:absolute;top:-13px;left:50%;transform:translateX(-50%);padding:4px 14px;border-radius:var(--r-pill);background:var(--c-accent);color:var(--c-accent-fg);font-size:var(--t-caption);font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.price{display:flex;align-items:baseline;gap:var(--s-2)}
.price strong{font-family:var(--f-display);font-size:var(--t-h1);font-weight:var(--fw-h1);line-height:1;letter-spacing:var(--tr-h1);font-variant-numeric:tabular-nums}
.price span{color:var(--c-muted);font-size:var(--t-small)}
.tier .btn{width:100%}
.tier .ticks li{color:var(--c-text);font-size:var(--t-small)}
@media (max-width:980px){.tiers{grid-template-columns:1fr;max-width:520px;margin-inline:auto}}

/* faq */
.faq{max-width:800px;margin-inline:auto;display:grid;gap:var(--s-3)}
.faq details{border:var(--bw) solid var(--c-border);border-radius:var(--r-lg);background:var(--c-surface);transition:border-color var(--dur-base)}
.faq details[open]{border-color:color-mix(in srgb,var(--c-accent) 40%,var(--c-border))}
.faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:var(--s-4);padding:var(--s-5) var(--s-6);min-height:56px;font-weight:600;font-size:var(--t-body-lg)}
.faq summary::-webkit-details-marker{display:none}
.faq summary svg{width:20px;height:20px;flex:none;color:var(--c-muted);transition:transform var(--dur-base) var(--ease)}
.faq details[open] summary svg{transform:rotate(45deg);color:var(--c-accent-text)}
.faq .ans{padding:0 var(--s-6) var(--s-6);color:var(--c-muted);max-width:68ch}

/* CTA band */
.cta-band{position:relative;overflow:hidden;isolation:isolate;border-radius:var(--r-xl);border:var(--bw) solid var(--c-border);padding:clamp(40px,7vw,96px) var(--s-6);text-align:center;display:grid;gap:var(--s-5);justify-items:center;background:var(--c-surface)}
.cta-band::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(50% 90% at 50% 120%,var(--accent-glow),transparent 70%)}
[data-style="editorial-paper"] .cta-band::before,[data-style="field-notes"] .cta-band::before{display:none}
[data-style="neo-brutal"] .cta-band{background:var(--c-accent);color:var(--c-accent-fg);box-shadow:var(--sh-lg)}
[data-style="neo-brutal"] .cta-band .lead{color:inherit}
[data-style="neo-brutal"] .cta-band .btn--primary{background:var(--c-text);color:var(--c-bg)}

/* footer */
.footer{border-top:var(--bw) solid var(--c-border);padding-block:var(--s-9) var(--s-7);background:var(--c-bg)}
.footer__grid{display:grid;grid-template-columns:minmax(0,1.6fr) repeat(3,minmax(0,1fr));gap:var(--s-7)}
.footer__brand{display:grid;gap:var(--s-4);align-content:start;max-width:34ch}
.footer h3{font-size:var(--t-small);font-weight:600;margin-bottom:var(--s-4);color:var(--c-text)}
.footer li+li{margin-top:var(--s-1)}
.footer li a{color:var(--c-muted);font-size:var(--t-small);transition:color var(--dur-fast);display:inline-flex;align-items:center;min-height:32px;padding:4px 0}
.footer li a:hover{color:var(--c-text)}
.footer__legal{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--s-3);margin-top:var(--s-8);padding-top:var(--s-5);border-top:var(--bw) solid var(--c-border);color:var(--c-muted);font-size:var(--t-small)}
@media (max-width:820px){.footer__grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.footer__brand{grid-column:1/-1}}

/* motion: opt-in, intensity-gated, always reduced-motion safe */
@media (prefers-reduced-motion:no-preference){
  html.js:not([data-motion="0"]) .reveal{opacity:0;transform:translateY(14px);transition:opacity var(--dur-slow) var(--ease),transform var(--dur-slow) var(--ease)}
  html.js:not([data-motion="0"]) .reveal.in{opacity:1;transform:none}
  html[data-motion="2"] .frame--float,html[data-motion="3"] .frame--float{animation:float 9s ease-in-out infinite}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;
