import { mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  profile,
  projects,
  experience,
  capabilities,
  writing,
} from "../content/portfolio.mjs";
import {
  document,
  escape,
  arrow,
  socialLinks,
  tags,
  artwork,
  projectCard,
  projectGallery,
} from "./components.mjs";
process.chdir(fileURLToPath(new URL("../", import.meta.url)));
await mkdir("_site", { recursive: true });
// Publish only site assets; the original template and its unused libraries stay in the repository.
for (const dir of ["css", "js", "fonts", "img/brand"]) {
  await mkdir(`_site/assets/${dir}`, { recursive: true });
}
for (const path of ["css/portfolio.css", "js/portfolio.js", "img/portrait.jpg"])
  await cp(`assets/${path}`, `_site/assets/${path}`);
await cp("assets/fonts", "_site/assets/fonts", { recursive: true });
await cp("assets/img/brand", "_site/assets/img/brand", { recursive: true });
await cp("assets/img/projects", "_site/assets/img/projects", {
  recursive: true,
});
const experienceItem = (e) =>
  `<article class="experience-item"><p class="eyebrow">${escape(e.dates || "Dates not published")}</p><div><h3>${escape(e.company)}</h3><p class="role">${escape(e.title)}${e.verifiedTitle ? "" : ' <span class="role-note">/ contribution area</span>'}</p><p>${escape(e.summary)}</p>${e.note ? `<p class="source-note">${escape(e.note)}</p>` : ""}</div><span aria-hidden="true">↗</span></article>`;
const contactAction = profile.email
  ? `<a class="button button-pink" href="mailto:${escape(profile.email)}">Say hello ${arrow}</a><button class="copy-email" data-email="${escape(profile.email)}">Copy email</button><p role="status" class="copy-status"></p>`
  : `<a class="button button-pink" href="${profile.socials[1][1]}">Say hello on LinkedIn ${arrow}</a>`;
let home = await readFile("index.html", "utf8");
const slots = {
  WORK: projects.map(projectCard).join(""),
  FILTERS: ["All", ...new Set(projects.map((p) => p.category))]
    .map(
      (c, i) =>
        `<button class="filter ${i === 0 ? "selected" : ""}" data-filter="${escape(c)}" aria-pressed="${i === 0}">${escape(c)}${i === 0 ? ` <span>${String(projects.length).padStart(2, "0")}</span>` : ""}</button>`,
    )
    .join(""),
  SKILLS: capabilities
    .map(
      ([n, title, subtitle, items]) =>
        `<article class="skill-group"><span class="eyebrow">${n} /</span><h3>${title}</h3><p>${subtitle}</p>${tags(items)}</article>`,
    )
    .join(""),
  EXPERIENCE:
    experience.slice(0, 3).map(experienceItem).join("") +
    `<details class="older-experience"><summary>Earlier experience <span aria-hidden="true">+</span></summary>${experience.slice(3).map(experienceItem).join("")}</details>`,
  WRITING: writing
    .map(
      (a) =>
        `<a class="writing-card" href="${a.url}"><div class="writing-art" aria-hidden="true"><span>{ }</span><p>Notes from<br>the codebase.</p><small>ANDROID / ENGINEERING</small></div><div class="writing-copy">${tags(a.tags)}<h3>${escape(a.title)}</h3><p>${escape(a.description)}</p><span class="text-link">Read on Medium ${arrow}</span></div></a>`,
    )
    .join(""),
  SOCIALS: socialLinks(),
  CONTACT_ACTION: contactAction,
};
for (const [slot, value] of Object.entries(slots))
  home = home.replaceAll(`<!-- ${slot} -->`, value);
await writeFile(
  "_site/index.html",
  document({
    title: `${profile.name} — ${profile.title}`,
    description:
      "Mobile experiences that solve real problems. Explore Iddan Gunawan’s work in Android, cross-platform products, and connected devices.",
    body: home,
  }),
);
for (const [i, p] of projects.entries()) {
  const next = projects[(i + 1) % projects.length];
  const body = `<main id="main" class="project-detail wrap"><a class="text-link" href="/#work">← All work</a><p class="eyebrow detail-label">${escape(p.category)} / Project notes</p><h1>${escape(p.title)}</h1><p class="detail-deck">${escape(p.description)}</p>${artwork(p)}<div class="detail-content"><aside><p class="eyebrow">Project context</p><p>${escape(p.category)}</p>${p.technologies.length ? `<p class="eyebrow">Verified technologies</p>${tags(p.technologies)}` : ""}<p class="source-note">Product context and documented contributions are presented separately.</p></aside><div><section><h2>Overview</h2><p>${escape(p.overview)}</p>${p.features.length ? `<ul class="feature-list">${p.features.map((feature) => `<li><strong>${escape(feature.title)}:</strong> ${escape(feature.body)}</li>`).join("")}</ul>` : ""}</section>${p.role ? `<section><h2>My contribution</h2><p>${escape(p.role)}</p></section>` : ""}${p.sections.map((s) => `<section><h2>${escape(s.title)}</h2><p>${escape(s.body)}</p></section>`).join("")}${p.outcomes.length ? `<section><h2>Documented outcomes</h2>${p.outcomes.map((o) => `<p>${escape(o)}</p>`).join("")}</section>` : ""}${projectGallery(p)}${p.links.map((l) => `<a class="text-link" href="${escape(l.url)}">${escape(l.label)} ${arrow}</a>`).join("")}${p.media ? "" : '<p class="source-note">The artwork above is an editorial interpretation. Original product screenshots are not currently available on this site.</p>'}</div></div><a class="next-project" href="/projects/${next.slug}/"><span class="eyebrow">Next project</span><span>${escape(next.title)} ${arrow}</span></a></main>`;
  await mkdir(`_site/projects/${p.slug}`, { recursive: true });
  await writeFile(
    `_site/projects/${p.slug}/index.html`,
    document({
      title: `${p.title} — Iddan Gunawan`,
      description: p.description,
      path: `projects/${p.slug}/`,
      body,
    }),
  );
}
await writeFile(
  "_site/404.html",
  document({
    title: "Page not found — Iddan Gunawan",
    description: "Find your way back to Iddan Gunawan’s portfolio.",
    path: "404.html",
    body: '<main id="main" class="not-found wrap"><p class="eyebrow">404 / A small detour</p><h1>This route<br>needs a reroute.</h1><p>The page you’re looking for isn’t here.</p><a class="button" href="/">Back to the portfolio ↗</a></main>',
  }),
);
for (const [old, target] of [
  ["inner-page.html", "/#about"],
  ["portfolio-details.html", "/#work"],
])
  await writeFile(
    `_site/${old}`,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${target}"><title>Iddan Gunawan — Portfolio</title></head><body><a href="${target}">Continue to Iddan Gunawan’s portfolio</a></body></html>`,
  );
await writeFile(
  "_site/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${["", ...projects.map((p) => `projects/${p.slug}/`)].map((p) => `<url><loc>https://iddangunawan.github.io/${p}</loc></url>`).join("")}</urlset>`,
);
await writeFile(
  "_site/robots.txt",
  "User-agent: *\nAllow: /\nSitemap: https://iddangunawan.github.io/sitemap.xml\n",
);
await writeFile("_site/.nojekyll", "");
console.log(
  `Built homepage, ${projects.length} project pages, 404, legacy redirects, sitemap, and robots.txt in _site/`,
);
