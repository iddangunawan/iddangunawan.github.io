import {
  profile,
  projects,
  experience,
  capabilities,
} from "../content/portfolio.mjs";
import { professional, documents } from "../content/professional.mjs";
import { escape } from "./components.mjs";

export const documentActions = () =>
  `<nav class="document-actions" aria-label="Professional documents"><a class="button button-pink" href="/cv/">View CV <span aria-hidden="true">↗</span></a>${documents.map((d) => `<a class="document-download" href="/assets/documents/${d.filename}" download="${d.filename}">${d.label} <span aria-hidden="true">↓</span></a>`).join("")}</nav>`;
const list = (items) =>
  `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>`;
const contact = () =>
  `<p class="doc-contact"><a href="mailto:${profile.email}">${profile.email}</a> · Bandung, Indonesia</p><p class="doc-contact">${profile.socials
    .slice(0, 2)
    .map(
      ([name, url]) =>
        `<a href="${url}">${name}: ${url.replace("https://", "")}</a>`,
    )
    .join(" · ")}</p>`;
const education = () =>
  `<section><h2>Education &amp; training</h2><p><strong>${escape(professional.education.program)}</strong> · ${escape(professional.education.institution)}<br>${escape(professional.education.dates)}</p><p>${escape(professional.training)}</p></section>`;
const skills = () =>
  `<section><h2>Technical skills</h2>${capabilities.map(([, , title, items]) => `<p><strong>${escape(title)}:</strong> ${items.map(escape).join(", ")}</p>`).join("")}</section>`;
const roles = (items, detailed = true) =>
  `<section><h2>Work experience</h2>${items.map((e) => `<article class="doc-role"><h3>${escape(e.title)}${e.verifiedTitle ? "" : " (contribution area)"}</h3><p class="doc-meta">${escape(e.company)} · ${escape(e.dates || "Dates not confirmed")}</p><p>${escape(e.summary)}</p>${detailed && e.responsibilities ? list(e.responsibilities) : ""}${e.note ? `<p class="doc-note">${escape(e.note)}</p>` : ""}</article>`).join("")}</section>`;
const selected = () => projects.filter((p) => p.featured);
const projectSummary = (p) =>
  `<article class="doc-project"><h3>${escape(p.title)}</h3><p>${escape(p.description)}</p>${p.role ? `<p><strong>Contribution:</strong> ${escape(p.role)}</p>` : `<p class="doc-note">Personal contribution details are not yet published.</p>`}${p.technologies.length ? `<p><strong>Technologies:</strong> ${p.technologies.map(escape).join(", ")}</p>` : ""}${p.outcomes.length ? list(p.outcomes) : ""}<a href="https://iddangunawan.github.io/projects/${p.slug}/">iddangunawan.github.io/projects/${p.slug}/</a></article>`;
const masthead = (label) =>
  `<header class="doc-masthead"><p class="doc-label">${label} / Iddan Gunawan</p><h1>${escape(profile.name)}</h1><p class="doc-position">${escape(profile.title)}</p>${contact()}</header>`;
export function cvContent() {
  return `${masthead("Curriculum vitae")}<section><h2>Professional summary</h2><p>${escape(professional.summary)}</p></section>${roles(experience)}${skills()}${education()}<section><h2>Relevant projects &amp; documented achievements</h2>${selected().map(projectSummary).join("")}</section><p class="doc-note">${escape(professional.sourceNote)}</p>`;
}
export function printContent(kind) {
  if (kind === "cv") return cvContent();
  if (kind === "resume")
    return `<div class="resume-page">${masthead("Resume")}<section><h2>Professional summary</h2><p>${escape(professional.summary)}</p></section>${roles(experience.slice(0, 3), false)}<section><h2>Selected achievement</h2><p>${escape(projects.find((p) => p.slug === "sally-mobile").outcomes[0])}</p></section></div><div class="resume-page"><header class="doc-continuation"><strong>${profile.name}</strong> / Resume</header>${skills()}<section><h2>Selected mobile work</h2>${["globalpark", "koltitrace-mis"].map((slug) => projectSummary(projects.find((p) => p.slug === slug))).join("")}</section>${education()}<p class="doc-note">${escape(professional.sourceNote)}</p></div>`;
  if (kind !== "portfolio") throw new Error(`Unknown document: ${kind}`);
  return `<section class="portfolio-cover">${masthead("Selected project portfolio")}<h2>Good code.<br>Better experiences.</h2><p>${escape(professional.summary)}</p><p>Android · Cross-platform · Connected devices</p><p class="doc-note">A selection of six projects. Product context and personal contributions are presented separately. Store imagery may show versions released after my involvement.</p><a href="https://iddangunawan.github.io/">iddangunawan.github.io</a></section>${selected()
    .map(
      (p, i) =>
        `<section class="portfolio-case"><p class="doc-label">${String(i + 1).padStart(2, "0")} / ${escape(p.category)}</p><h1>${escape(p.title)}</h1><p>${escape(p.overview)}</p><div class="doc-gallery">${p.gallery
          .slice(0, 2)
          .map(
            (a) =>
              `<img src="${a.src}" width="${a.width}" height="${a.height}" alt="${escape(a.alt)}">`,
          )
          .join(
            "",
          )}</div>${p.role ? `<h2>My contribution</h2><p>${escape(p.role)}</p>` : `<p class="doc-note">Personal contribution details are not yet published; the overview describes the product.</p>`}${p.technologies.length ? `<p><strong>Documented technologies:</strong> ${p.technologies.map(escape).join(", ")}</p>` : ""}${p.outcomes.length ? list(p.outcomes) : ""}<p class="doc-note">${escape(p.media?.publisher ? `Official product imagery: ${p.media.publisher}.` : "Product imagery supplied by Iddan Gunawan.")}</p><p class="doc-links"><a href="https://iddangunawan.github.io/projects/${p.slug}/">Read project online</a>${p.links.map((l) => ` · <a href="${l.url}">${escape(l.label)}</a>`).join("")}</p></section>`,
    )
    .join("")}`;
}
