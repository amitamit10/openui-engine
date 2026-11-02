/** CSS for domain visuals (.vz) and the extended section library. Token-driven like css.ts. */
export const EXTRA_CSS = String.raw`
.ico{width:1.25em;height:1.25em;flex:none;display:inline-block;vertical-align:-.2em}
.ico-chip{width:40px;height:40px;border-radius:var(--r-md);background:var(--c-accent-soft);color:var(--c-accent-text);display:grid;place-items:center;border:var(--bw) solid color-mix(in srgb,var(--c-accent) 22%,transparent)}
.ico-chip .ico{width:20px;height:20px}
[data-style="neo-brutal"] .ico-chip{border-color:var(--c-border);background:var(--c-accent);color:var(--c-accent-fg)}

/* ── visual blocks ── */
.vz{border-radius:var(--r-lg);border:var(--bw) solid var(--c-border);background:var(--c-surface);overflow:hidden;box-shadow:var(--sh-md);text-align:left;font-size:var(--t-small);line-height:1.45;min-width:0}
.vz-bar{display:flex;align-items:center;gap:var(--s-2);padding:8px 16px;border-bottom:var(--bw) solid var(--c-border);background:var(--c-surface2);min-height:40px}
.vz-title{margin-left:var(--s-3);font-family:var(--f-mono);font-size:var(--t-caption);color:var(--c-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vz-right{margin-left:auto;font-size:var(--t-caption);color:var(--c-muted);white-space:nowrap}
.vz-pad{padding:var(--s-4)}
.vz small,.vz-metric small{font-size:var(--t-caption)}
.int small{font-size:var(--t-small)}
.vz-pill{display:inline-flex;align-items:center;padding:2px 10px;border-radius:var(--r-pill);font-size:var(--t-caption);font-weight:600;line-height:1.5;background:var(--c-surface2);color:var(--c-muted);white-space:nowrap;border:1px solid var(--c-border)}
.vz-pill.vz-ok{color:var(--c-success);background:color-mix(in srgb,var(--c-success) 12%,transparent);border-color:color-mix(in srgb,var(--c-success) 30%,transparent)}
.vz-pill.vz-warn{color:var(--c-warning);background:color-mix(in srgb,var(--c-warning) 12%,transparent);border-color:color-mix(in srgb,var(--c-warning) 30%,transparent)}
.vz-pill.vz-bad{color:var(--c-danger);background:color-mix(in srgb,var(--c-danger) 12%,transparent);border-color:color-mix(in srgb,var(--c-danger) 30%,transparent)}
.vz-pill.vz-info,.vz-pill.vz-now{color:var(--c-accent-text);background:var(--c-accent-soft);border-color:color-mix(in srgb,var(--c-accent) 30%,transparent)}
/* timeline */
.vz-tl{list-style:none;margin:0;padding:var(--s-3) var(--s-4)}
.vz-tl li{display:grid;grid-template-columns:62px 1fr auto;gap:var(--s-3);align-items:start;padding:8px 0 8px 16px;position:relative;border-left:2px solid var(--c-border);margin-left:6px}
.vz-tl li::before{content:"";position:absolute;left:-7px;top:15px;width:12px;height:12px;border-radius:50%;background:var(--c-bg);border:2px solid var(--c-muted)}
.vz-tl li.vz-ok::before{border-color:var(--c-success);background:var(--c-success)}.vz-tl li.vz-warn::before{border-color:var(--c-warning);background:var(--c-warning)}.vz-tl li.vz-bad::before{border-color:var(--c-danger);background:var(--c-danger)}.vz-tl li.vz-info::before,.vz-tl li.vz-now::before{border-color:var(--c-accent);background:var(--c-accent)}
.vz-tl time{font-family:var(--f-mono);font-size:var(--t-caption);color:var(--c-muted);padding-top:2px}
.vz-tl b{display:block;font-weight:600;color:var(--c-text)}.vz-tl small{display:block;color:var(--c-muted);font-size:var(--t-caption);margin-top:2px}
/* chat */
.vz-msgs{display:grid;gap:var(--s-3);padding:var(--s-4)}
.vz-msg{max-width:88%;padding:8px 16px;border-radius:var(--r-lg);background:var(--c-surface2);border:1px solid var(--c-border)}
.vz-msg p{margin:0}.vz-msg small{display:block;margin-top:4px;color:var(--c-muted);font-size:var(--t-caption)}
.vz-msg.me{justify-self:end;background:var(--c-accent);color:var(--c-accent-fg);border-color:transparent;border-bottom-right-radius:var(--r-sm)}.vz-msg.me small{color:inherit;opacity:.8}
.vz-msg.bot{border-bottom-left-radius:var(--r-sm)}
.vz-sugs{display:flex;gap:var(--s-2);flex-wrap:wrap;padding:0 var(--s-4) var(--s-3)}.vz-sugs span{padding:4px 12px;border:1px solid var(--c-border);border-radius:var(--r-pill);color:var(--c-muted);font-size:var(--t-caption)}
.vz-input{display:flex;align-items:center;justify-content:space-between;margin:0 var(--s-4) var(--s-4);padding:8px 16px;border:1px solid var(--c-border);border-radius:var(--r-pill);color:var(--c-muted);background:var(--c-bg)}.vz-input i{width:22px;height:22px;border-radius:50%;background:var(--c-accent)}
/* code */
.vz-code pre{margin:0;padding:var(--s-4);overflow:hidden;background:var(--c-bg);font-family:var(--f-mono);font-size:12.5px;line-height:1.75;color:var(--c-text)}
.vz-code code{display:block;white-space:pre;overflow:hidden;text-overflow:clip}
.vz-code .ln{display:inline-block;width:2.2em;margin-right:var(--s-3);color:var(--c-muted);opacity:.7;text-align:right;user-select:none}
.vz-code .k{color:var(--c-accent-text)}.vz-code .s{color:var(--c-success)}.vz-code .c{color:var(--c-muted);font-style:italic}.vz-code .n{color:var(--c-warning)}.vz-code .f{color:var(--c-text);font-weight:600}.vz-code .pr{color:var(--c-success)}
/* kanban */
.vz-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:var(--s-3);padding:var(--s-4);background:var(--c-bg)}
.vz-col h4{margin:0 0 var(--s-3);font-size:var(--t-caption);text-transform:uppercase;letter-spacing:.06em;color:var(--c-muted)}.vz-col h4 em{font-style:normal;margin-left:6px;padding:0 6px;border-radius:var(--r-pill);background:var(--c-surface2)}
.vz-card{display:grid;gap:4px;padding:8px 12px;margin-bottom:var(--s-2);border-radius:var(--r-md);background:var(--c-surface);border:1px solid var(--c-border)}.vz-card b{font-weight:600}.vz-card small{color:var(--c-muted)}.vz-card .vz-pill{justify-self:start}
/* table */
.vz-table table,.vz-invoice table{width:100%;border-collapse:collapse}
.vz-table th,.vz-invoice th{text-align:left;padding:8px 16px;font-size:var(--t-caption);text-transform:uppercase;letter-spacing:.05em;color:var(--c-muted);border-bottom:1px solid var(--c-border);font-weight:600}
.vz-table td,.vz-invoice td{padding:8px 16px;border-bottom:1px solid var(--c-border);font-variant-numeric:tabular-nums}
.vz-table tr:last-child td{border-bottom:0}
.vz-invoice tfoot td{font-weight:700;border-bottom:0;border-top:2px solid var(--c-border);font-size:var(--t-body)}.vz-invoice td:last-child,.vz-invoice th:last-child{text-align:right}
.vz-inv-head{display:flex;justify-content:space-between;gap:var(--s-3);margin-bottom:var(--s-4)}.vz-inv-head small{display:block;color:var(--c-muted)}.vz-inv-head strong{display:block;font-size:var(--t-body-lg);font-family:var(--f-display)}
/* dashboard */
.vz-dashgrid{display:grid;grid-template-columns:150px minmax(0,1fr);background:var(--c-bg)}.vz-dashgrid.nosb{grid-template-columns:minmax(0,1fr)}.vz-side{display:grid;align-content:start;gap:4px;padding:var(--s-4);border-right:var(--bw) solid var(--c-border);background:var(--c-surface)}.vz-side span{padding:8px 12px;border-radius:var(--r-md);color:var(--c-muted);font-weight:500}.vz-side span.on{background:var(--c-accent-soft);color:var(--c-accent-text)}
.vz-main{padding:var(--s-4);display:grid;gap:var(--s-4);min-width:0}.vz-main>.vz-head{margin:0;justify-content:space-between}.vz-main>.vz-head strong{font-size:var(--t-body-lg);letter-spacing:0;font-family:var(--f-body)}
.vz-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:var(--s-3)}.vz-kpi{padding:var(--s-3) var(--s-4);border-radius:var(--r-md);border:var(--bw) solid var(--c-border);background:var(--c-surface);display:grid;gap:2px}.vz-kpi small{color:var(--c-muted)}.vz-kpi strong{font-family:var(--f-display);font-size:var(--t-h3);line-height:1.2;font-variant-numeric:tabular-nums}.vz-kpi em{font-style:normal;font-size:var(--t-caption);color:var(--c-success);font-weight:600}
@media(max-width:640px){.vz-dashgrid{grid-template-columns:minmax(0,1fr)}.vz-side{display:none}}
/* chart */
.vz-head{display:flex;align-items:baseline;gap:var(--s-3);margin-bottom:var(--s-3)}.vz-head strong{font-family:var(--f-display);font-size:var(--t-h2);line-height:1;letter-spacing:var(--tr-h2);font-variant-numeric:tabular-nums}.vz-head em{font-style:normal;color:var(--c-success);font-weight:600}
.vz-svg{width:100%;height:170px;display:block}.vz-svg .gr line{stroke:var(--c-border)}.vz-svg .ln{fill:none;stroke-width:2.5;stroke-linecap:round}.vz-svg .ln0{stroke:var(--c-accent)}.vz-svg .ln1{stroke:var(--c-accent2);stroke-dasharray:5 5}.vz-svg .ln2{stroke:var(--c-success)}
.vz-svg .dot{fill:var(--c-accent);stroke:var(--c-surface);stroke-width:3}.vz-svg .b0,.vz-svg .d0{fill:var(--c-accent)}.vz-svg .b1,.vz-svg .d1{fill:var(--c-accent2)}.vz-svg .b2,.vz-svg .d2{fill:var(--c-success)}.vz-svg .d3{fill:var(--c-warning)}.vz-svg .d4{fill:var(--c-muted)}.vz-big{font-family:var(--f-display);font-size:26px;font-weight:700;fill:var(--c-text)}
.vz-xl{display:flex;justify-content:space-between;color:var(--c-muted);font-size:var(--t-caption);margin-top:6px}.vz-legend{display:flex;gap:var(--s-4);flex-wrap:wrap;margin-top:var(--s-3);color:var(--c-muted);font-size:var(--t-caption)}.vz-legend .sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;background:var(--c-accent)}.vz-legend .sw.d1{background:var(--c-accent2)}.vz-legend .sw.d2{background:var(--c-success)}.vz-legend .sw.d3{background:var(--c-warning)}.vz-legend .sw.d4{background:var(--c-muted)}
/* schedule */
.vz-sg{display:grid;grid-template-columns:90px repeat(var(--cols),1fr);gap:4px;padding:var(--s-4);align-items:stretch}
.vz-sg b{font-size:var(--t-caption);color:var(--c-muted);text-align:center;font-weight:600}.vz-sg .rl{font-size:var(--t-caption);color:var(--c-muted);align-self:center}
.vz-sg i{min-height:34px;border-radius:var(--r-sm);background:var(--c-surface2);font-style:normal;font-size:var(--t-caption);display:flex;align-items:center;justify-content:center;padding:0 6px;text-align:center;overflow:hidden}
.vz-sg i.blk{background:var(--c-accent-soft);color:var(--c-accent-text);font-weight:600}.vz-sg i.blk.vz-ok{background:color-mix(in srgb,var(--c-success) 16%,transparent);color:var(--c-success)}.vz-sg i.blk.vz-warn{background:color-mix(in srgb,var(--c-warning) 16%,transparent);color:var(--c-warning)}.vz-sg i.blk.vz-bad{background:color-mix(in srgb,var(--c-danger) 16%,transparent);color:var(--c-danger)}
/* gallery + products */
.vz-gallery{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:var(--s-3);border:0;background:transparent;box-shadow:none;overflow:visible}
.vz-gallery figure{margin:0;grid-column:span 2;border-radius:var(--r-lg);overflow:hidden;border:var(--bw) solid var(--c-border);background:var(--c-surface);box-shadow:var(--sh-sm)}.vz-gallery figure.g0{grid-column:span 3}.vz-gallery figure.g1{grid-column:span 3}
.vz-gallery svg{width:100%;height:150px;display:block}.vz-gallery figcaption{padding:var(--s-3) var(--s-4);display:grid;gap:2px}.vz-gallery figcaption small{color:var(--c-muted)}
.vz-gallery .s-bg,.vz-products .s-bg{fill:var(--c-surface2)}.vz-gallery .s0,.vz-products .s0{fill:var(--c-accent)}.vz-gallery .s1,.vz-products .s1{fill:var(--c-accent2)}.vz-gallery .s2,.vz-products .s2{fill:var(--c-text);opacity:.88}
.vz-products{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--s-3);border:0;background:transparent;box-shadow:none;overflow:visible}
.vz-prod{border-radius:var(--r-lg);border:var(--bw) solid var(--c-border);background:var(--c-surface);padding:var(--s-2);display:grid;gap:var(--s-2)}.vz-prod .ph{position:relative;border-radius:var(--r-md);overflow:hidden}.vz-prod .ph svg{width:100%;height:110px;display:block}.vz-prod .ph .vz-pill{position:absolute;left:8px;top:8px}
.vz-prod b{padding:0 var(--s-2);font-weight:600}.vz-prod .pr{padding:0 var(--s-2) var(--s-2);display:flex;justify-content:space-between;align-items:baseline;font-weight:700}.vz-prod .pr small{color:var(--c-muted);font-weight:400}
/* checklist + metrics */
.vz-check ul{list-style:none;margin:0;padding:var(--s-3) var(--s-4)}.vz-check li{display:flex;gap:var(--s-3);align-items:center;padding:8px 0;border-bottom:1px solid var(--c-border)}.vz-check li:last-child{border-bottom:0}.vz-check li i{width:18px;height:18px;border-radius:5px;border:2px solid var(--c-border);flex:none}.vz-check li.done i{background:var(--c-accent);border-color:var(--c-accent)}.vz-check li.done span{color:var(--c-muted);text-decoration:line-through}.vz-check small{margin-left:auto;color:var(--c-muted);font-size:var(--t-caption)}
.vz-metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--s-3);border:0;background:transparent;box-shadow:none;overflow:visible}
.vz-metric{display:grid;gap:2px;padding:var(--s-4);border-radius:var(--r-lg);border:var(--bw) solid var(--c-border);background:var(--c-surface)}.vz-metric small{color:var(--c-muted)}.vz-metric strong{font-family:var(--f-display);font-size:var(--t-h2);line-height:1.1;letter-spacing:var(--tr-h2);font-variant-numeric:tabular-nums}.vz-metric em{font-style:normal;font-weight:600;font-size:var(--t-caption)}.vz-metric em.up{color:var(--c-success)}.vz-metric em.dn{color:var(--c-danger)}.vz-metric svg{width:100%;height:36px;margin-top:var(--s-2)}.vz-metric .ln{fill:none;stroke-width:2;stroke-linecap:round}.vz-metric .ln0,.vz-metric .ln1{stroke:var(--c-accent)}
@media(max-width:720px){.vz-gallery figure,.vz-gallery figure.g0,.vz-gallery figure.g1{grid-column:span 6}.vz-products{grid-template-columns:repeat(2,minmax(0,1fr))}.vz-tl li{grid-template-columns:50px 1fr}.vz-tl li .vz-pill{display:none}.vz-sg{grid-template-columns:56px repeat(var(--cols),1fr);padding:var(--s-3)}}

/* hero with a generic visual */
.hero__visual .vz{box-shadow:var(--sh-glow),var(--sh-lg);border-radius:var(--r-xl)}
.hero__visual .vz.vz-timeline,.hero__visual .vz.vz-chat,.hero__visual .vz.vz-code,.hero__visual .vz.vz-table,.hero__visual .vz.vz-kanban,.hero__visual .vz.vz-invoice{max-width:760px;margin-inline:auto}
.hero--split .hero__visual .vz{margin-inline:0;max-width:none}

/* feature tabs */
.tabs{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--s-6)}
.tabs__list{display:flex;gap:var(--s-2);flex-wrap:wrap;justify-content:center;padding:4px;border:var(--bw) solid var(--c-border);border-radius:var(--r-pill);background:var(--c-surface);width:fit-content;max-width:100%;margin-inline:auto}
.tabs__tab{display:inline-flex;align-items:center;gap:var(--s-2);min-height:44px;padding:0 var(--s-4);border:0;border-radius:var(--r-pill);background:transparent;color:var(--c-muted);font-weight:600;font-size:var(--t-small)}
.tabs__tab[aria-selected="true"]{background:var(--c-accent);color:var(--c-accent-fg)}
.tabs__tab:not([aria-selected="true"]):hover{color:var(--c-text);background:var(--c-surface2)}
.tabs__panel{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(24px,5vw,64px);align-items:center}
.tabs__panel[hidden]{display:none}
.tabs__panel>*,.tabs__copy,.showcase>*,.stl>*,.frow>*{min-width:0}
.vz{max-width:100%}.vz-scroll{overflow-x:auto}.vz-scroll:focus-visible{outline-offset:-3px}
.tabs__copy{display:grid;gap:var(--s-4);justify-items:start}
@media(max-width:860px){.tabs__panel{grid-template-columns:minmax(0,1fr)}.tabs__list{border-radius:var(--r-lg);width:100%}.tabs__tab{flex:1 1 auto;justify-content:center}}
/* showcase */
.showcase{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--s-6)}
.showcase__calls{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--s-5)}
.call{display:grid;gap:var(--s-2);padding-top:var(--s-4);border-top:var(--bw) solid var(--c-border)}.call .ico-chip{margin-bottom:var(--s-2)}.call p{color:var(--c-muted)}
/* comparison */
.cmp{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--s-4)}.cmp__col{padding:var(--s-6);display:grid;gap:var(--s-4);align-content:start}
.cmp__col--us{border-color:var(--c-accent);background:linear-gradient(to bottom,var(--c-accent-soft),var(--c-surface) 55%);box-shadow:var(--sh-glow),var(--sh-md)}
.cmp__col li{display:flex;gap:var(--s-3);align-items:flex-start}.cmp__col li .ico{margin-top:2px}.cmp__col--them li{color:var(--c-muted)}.cmp__col--them li .ico{color:var(--c-danger)}.cmp__col--us li .ico{color:var(--c-success)}
.cmp__col ul{display:grid;gap:var(--s-3)}@media(max-width:760px){.cmp{grid-template-columns:minmax(0,1fr)}}
/* integrations */
.ints{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:var(--s-3)}
.int{display:flex;gap:var(--s-3);align-items:center;padding:var(--s-4);border-radius:var(--r-lg);border:var(--bw) solid var(--c-border);background:var(--c-surface);transition:border-color var(--dur-base),transform var(--dur-base) var(--ease)}.int:hover{border-color:color-mix(in srgb,var(--c-accent) 45%,var(--c-border));transform:translateY(-2px)}
.int b{display:block;font-weight:600}.int small{display:block;color:var(--c-muted)}
/* quotes */
.qf{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:clamp(24px,5vw,72px);align-items:center}
.qf--solo{grid-template-columns:1fr;max-width:900px;margin-inline:auto}.qf blockquote{font-family:var(--f-display);font-size:var(--t-h2);line-height:1.2;letter-spacing:var(--tr-h2);text-wrap:balance}
.qf figcaption{display:flex;gap:var(--s-3);align-items:center;margin-top:var(--s-5)}.qf__stats{display:grid;gap:var(--s-4)}.qf__stat{padding:var(--s-4) var(--s-5);border-radius:var(--r-lg);border:var(--bw) solid var(--c-border);background:var(--c-surface)}.qf__stat strong{display:block;font-family:var(--f-display);font-size:var(--t-h1);line-height:1;letter-spacing:var(--tr-h1)}.qf__stat span{color:var(--c-muted)}
@media(max-width:860px){.qf{grid-template-columns:minmax(0,1fr)}}
.wall{columns:3 260px;column-gap:var(--s-4)}.wall .card{break-inside:avoid;margin-bottom:var(--s-4);display:grid;gap:var(--s-4)}.wall blockquote{line-height:1.55}.wall .big{font-family:var(--f-display);font-size:var(--t-h3);line-height:1.3}
/* steps timeline */
.stl{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(24px,6vw,80px);align-items:start}
.stl__steps{display:grid;gap:0;counter-reset:s;position:relative}.stl__step{display:grid;grid-template-columns:44px 1fr;gap:var(--s-4);padding-bottom:var(--s-7);position:relative}.stl__step:last-child{padding-bottom:0}
.stl__step::before{counter-increment:s;content:counter(s);width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-family:var(--f-mono);font-weight:600;background:var(--c-accent);color:var(--c-accent-fg);position:relative;z-index:1}
.stl__step::after{content:"";position:absolute;left:19px;top:44px;bottom:4px;width:2px;background:var(--c-border)}.stl__step:last-child::after{display:none}
.stl__step p{color:var(--c-muted)}.stl__vis{position:sticky;top:96px}
@media(max-width:860px){.stl{grid-template-columns:minmax(0,1fr)}.stl__vis{position:static}}
/* CTA split + form */
.ctas{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(24px,5vw,64px);align-items:center;padding:clamp(28px,5vw,64px);border-radius:var(--r-xl);border:var(--bw) solid var(--c-border);background:var(--c-surface);position:relative;overflow:hidden;isolation:isolate}
.ctas::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(60% 90% at 100% 0%,var(--accent-glow),transparent 70%)}[data-style="editorial-paper"] .ctas::before,[data-style="neo-brutal"] .ctas::before{display:none}
.ctas__copy{display:grid;gap:var(--s-4)}.form{display:grid;gap:var(--s-3)}.form label{font-weight:600;font-size:var(--t-small)}
.form input{width:100%;min-height:48px;padding:0 var(--s-4);border-radius:var(--r-md);border:var(--bw) solid var(--c-border);background:var(--c-bg);color:var(--c-text);font:inherit}.form input::placeholder{color:var(--c-muted)}
.form .row{display:flex;gap:var(--s-3);flex-wrap:wrap}.form .row input{flex:1 1 200px}.form__note{color:var(--c-muted);font-size:var(--t-small)}.form__ok{color:var(--c-success);font-weight:600}
@media(max-width:860px){.ctas{grid-template-columns:minmax(0,1fr)}}
/* metrics spark / marquee / faq split */
.marq{overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
.marq__track{display:flex;gap:var(--s-8);width:max-content;padding:var(--s-2) 0}
@media(prefers-reduced-motion:no-preference){html:not([data-motion="0"]) .marq__track{animation:marq 38s linear infinite}html:not([data-motion="0"]) .marq:hover .marq__track{animation-play-state:paused}@keyframes marq{to{transform:translateX(-50%)}}}
@media(prefers-reduced-motion:reduce){.marq{overflow:auto}}
.fqs{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:clamp(24px,6vw,80px);align-items:start}.fqs__head{position:sticky;top:96px;display:grid;gap:var(--s-4);justify-items:start}.fqs .faq{max-width:none;margin:0}
@media(max-width:860px){.fqs{grid-template-columns:minmax(0,1fr)}.fqs__head{position:static}}
`;
