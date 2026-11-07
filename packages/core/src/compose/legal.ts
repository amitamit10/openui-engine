import { esc } from "./util.js";

export interface LegalInfo { name: string; holder?: string; email?: string; address?: string; jurisdiction?: string; date?: string }
type Doc = { title: string; intro: string; sections: Array<{ h: string; p: string[] }> };

const contact = (i: LegalInfo) => [i.email ? `Email: ${i.email}` : "", i.address ? `Postal address: ${i.address}` : ""].filter(Boolean);

export function legalDoc(kind: "privacy" | "terms", i: LegalInfo): Doc {
  const who = i.holder || i.name, juris = i.jurisdiction ? ` These terms are governed by the laws of ${i.jurisdiction}.` : "";
  if (kind === "privacy") return {
    title: "Privacy policy", intro: `This policy explains what ${who} (“we”) collects when you use ${i.name}, why, and the choices you have.`,
    sections: [
      { h: "What we collect", p: ["Information you give us directly, such as your name and email address when you enrol, book, order or contact us.", "Basic technical data (browser type, pages viewed) that our hosting provider records to keep the site secure and working."] },
      { h: "How we use it", p: ["To provide what you asked for, reply to your messages, send service updates you have requested, and improve the site.", "We do not sell your personal information."] },
      { h: "Cookies", p: [`${i.name} does not use advertising cookies. If we add analytics, we will say so here and ask first where the law requires it.`] },
      { h: "Sharing", p: ["We share data only with service providers who help us run the site or deliver your order (for example hosting, payments and email), and when the law requires it."] },
      { h: "Your rights", p: ["You can ask us to access, correct or delete the personal information we hold about you, and to stop contacting you, at any time."] },
      { h: "Retention", p: ["We keep personal information only as long as needed for the purpose it was collected, or as the law requires."] },
      { h: "Contact", p: contact(i).length ? contact(i) : ["Use the contact details on our website."] },
    ],
  };
  return {
    title: "Terms of use", intro: `These terms apply to your use of the ${i.name} website, operated by ${who}.`,
    sections: [
      { h: "Using this site", p: ["You may browse and use this site for lawful, personal or business purposes. Please do not misuse it, disrupt it, or try to access it in an unauthorised way."] },
      { h: "Our content", p: [`Unless stated otherwise, the text, design, logo and original images on this site belong to ${who} and are protected by copyright. Some photographs are used under the Unsplash licence and credited in the footer.`] },
      { h: "Orders, bookings and prices", p: ["Descriptions and prices are given in good faith and may change. A booking or order is confirmed when we tell you so in writing."] },
      { h: "No warranty", p: ["The site is provided “as is”. We try to keep information accurate but do not guarantee it is complete or error-free."] },
      { h: "Liability", p: ["To the extent the law allows, we are not liable for indirect or consequential loss arising from use of this site. Nothing here limits liability that cannot be limited by law."] },
      { h: "Changes and law", p: [`We may update these terms; the version on this page applies.${juris}`] },
      { h: "Contact", p: contact(i).length ? contact(i) : ["Use the contact details on our website."] },
    ],
  };
}

/** A standalone legal page that reuses the site's stylesheets. */
export function renderLegalPage(kind: "privacy" | "terms", i: LegalInfo, head: { fonts: string; lang?: string; icon: string; navHtml: string; footerHtml: string }): string {
  const d = legalDoc(kind, i), date = i.date ?? new Date().toISOString().slice(0, 10);
  return `<!doctype html>
<html lang="${esc(head.lang ?? "en")}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(d.title)} — ${esc(i.name)}</title><meta name="robots" content="noindex">${head.icon}${head.fonts}
<link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="styles.css"></head>
<body>
<!-- Template text for a small business site. Review with a qualified adviser before relying on it. -->
${head.navHtml}
<main class="container legal"><h1 class="h1">${esc(d.title)}</h1><p class="muted small">Last updated ${esc(date)}</p><p class="lead">${esc(d.intro)}</p>
${d.sections.map((s) => `<section><h2 class="h3">${esc(s.h)}</h2>${s.p.map((t) => `<p>${esc(t)}</p>`).join("")}</section>`).join("\n")}
</main>
${head.footerHtml}
</body></html>
`;
}
