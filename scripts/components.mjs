import { profile } from "../content/portfolio.mjs";
export const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const arrow = '<span aria-hidden="true">↗</span>';
export const socialLinks = () =>
  `<div class="social-links">${profile.socials.map(([name, url]) => `<a href="${url}">${name} ${arrow}</a>`).join("")}</div>`;
export const header = () =>
  `<a class="skip-link" href="#main">Skip to content</a><header class="site-header wrap"><a class="brand" href="/" aria-label="Iddan Gunawan, home">IG<span>.</span></a><a class="header-name" href="/">Iddan Gunawan<span>Mobile Engineer</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav" hidden>Menu <span aria-hidden="true">+</span></button><nav id="site-nav" aria-label="Main navigation"><a href="/#work">Work</a><a href="/#about">About</a><a href="/#writing">Writing</a><a class="nav-contact" href="/#contact">Let’s talk ${arrow}</a></nav></header>`;
export const footer = () =>
  `<footer class="site-footer wrap"><a class="brand" href="/" aria-label="Iddan Gunawan, home">IG<span>.</span></a><p>© <span data-year>${new Date().getFullYear()}</span> Iddan Gunawan</p><nav aria-label="Footer navigation"><a href="/#work">Work</a><a href="/#about">About</a><a href="/#contact">Contact</a><a href="#top">Back to top ↑</a></nav>${socialLinks()}</footer>`;
export const tags = (items) =>
  `<div class="tags">${items.map((x) => `<span>${escape(x)}</span>`).join("")}</div>`;
const conceptualArtwork = (p) =>
  `<div class="project-art ${p.art}" aria-hidden="true"><span class="art-corner">${escape(p.category)} / ${escape(p.slug === "koltitrace-mis" ? "Traceability" : "Mobile experience")}</span><div class="art-orbit"></div><span class="art-symbol">${escape(p.symbol)}</span><span class="art-title">${escape(p.title)}</span><span class="art-caption">Conceptual project artwork · not a product screenshot</span><span class="art-index">${p.slug === "koltitrace-mis" ? "01 — FIELD TO FUTURE" : "BUILT FOR THE EVERYDAY"}</span></div>`;
export const image = (asset, className = "") =>
  `<img class="${className}" src="${escape(asset.src)}" alt="${escape(asset.alt || "")}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async">`;
export const artwork = (p) => {
  if (!p.media) return conceptualArtwork(p);
  if (p.media.cover)
    return `<div class="project-art supplied-art ${p.art}">${image(p.media.cover, "project-cover")}</div>`;
  const previews = [
    p.thumbnail,
    ...p.gallery.filter((item) => item !== p.thumbnail),
  ].slice(0, 2);
  return `<div class="project-art store-art ${p.art}"><span class="art-corner">${p.media.store ? "Official store previews" : "Portfolio preview"}</span>${p.media.icon ? image(p.media.icon, "store-app-icon") : ""}<div class="store-previews">${previews.map((asset) => image(asset)).join("")}</div><span class="art-caption">${escape(p.media.publisher || profile.name)} / ${escape(p.media.store || "Portfolio")}</span></div>`;
};
export const projectGallery = (p) => {
  if (!p.gallery.length) return "";
  const source = p.media.store
    ? `Official screenshots from <a href="${escape(p.media.url)}">${escape(p.media.publisher)} on ${escape(p.media.store)}</a>${p.media.listingName ? ` (currently listed as ${escape(p.media.listingName)})` : ""}. Store images may show product versions released after my involvement.`
    : escape(p.media.source);
  return `<section class="project-gallery" aria-label="Project screenshots"><h2>Inside the app</h2><p class="source-note">${source}</p><div class="gallery-grid">${p.gallery.map((asset) => `<a href="${escape(asset.src)}" data-gallery-image aria-label="Enlarge: ${escape(asset.alt)}">${image(asset)}</a>`).join("")}</div></section>`;
};
export const projectCard = (p, index) =>
  `<article class="project-card ${index === 0 ? "featured" : ""}" data-category="${escape(p.category)}"><a href="/projects/${p.slug}/" class="project-link">${artwork(p)}<div class="project-info"><div><p class="eyebrow">${String(index + 1).padStart(2, "0")} / ${escape(p.category)}</p><h3>${escape(p.title)}</h3></div><span class="circle-arrow" aria-hidden="true">↗</span></div><p class="project-description">${escape(p.description)}</p><span class="sr-only">View project</span></a>${tags(p.technologies)}</article>`;
export function document({
  title,
  description,
  path = "",
  body,
  image = "assets/img/brand/social.png",
}) {
  const url = `https://iddangunawan.github.io/${path}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#F8F7F3"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://iddangunawan.github.io/${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/img/brand/favicon.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/space-grotesk.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/assets/css/portfolio.css"><script type="module" src="/assets/js/portfolio.js"></script></head><body id="top">${header()}${body}${footer()}</body></html>`;
}
