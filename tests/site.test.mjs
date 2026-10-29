import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import {
  projects,
  profile,
  capabilities,
  experience,
} from "../content/portfolio.mjs";
import { escape } from "../scripts/components.mjs";
const root = path.resolve("_site");
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? files(path.join(dir, e.name))
          : path.join(dir, e.name),
      ),
    )
  ).flat();
}
test("content has unique slugs, six selected projects, and safe URLs", () => {
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length);
  assert.equal(projects.filter((p) => p.featured).length, 6);
  for (const p of projects) {
    assert.match(p.slug, /^[a-z0-9-]+$/);
    assert.ok(p.title && p.description && p.overview);
    for (const link of p.links) assert.match(link.url, /^https:\/\//);
  }
  assert.equal(escape('<script>"&'), "&lt;script&gt;&quot;&amp;");
});
test("every published internal link, fragment, image, font, and CSS asset resolves", async () => {
  for (const file of await files(root)) {
    if (!/\.(html|css)$/.test(file)) continue;
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(
      source,
      /<!-- (WORK|SOCIALS|SKILLS|EXPERIENCE|CONTACT_ACTION|WRITING) -->/,
    );
    const refs = file.endsWith(".html")
      ? [...source.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1])
      : [...source.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map((m) => m[1]);
    for (const ref of refs.map((r) =>
      r.replace("https://iddangunawan.github.io", ""),
    )) {
      if (/^(https?:|mailto:|data:)/.test(ref)) continue;
      const [url, hash] = ref.split("#");
      let target = url
        ? url.startsWith("/")
          ? path.join(root, url)
          : path.resolve(path.dirname(file), url)
        : file;
      if ((await stat(target)).isDirectory())
        target = path.join(target, "index.html");
      const targetSource = await readFile(target);
      if (hash)
        assert.ok(
          targetSource.toString().includes(`id="${hash}"`),
          `${file}: missing ${ref}`,
        );
    }
  }
});
test("homepage has core sections and no unsupported email or current-role claim", async () => {
  const home = await readFile("_site/index.html", "utf8");
  for (const id of [
    "main",
    "work",
    "capabilities",
    "experience",
    "about",
    "writing",
    "contact",
  ])
    assert.ok(home.includes(`id="${id}"`));
  assert.equal(
    (home.match(/class="project-card /g) || []).length,
    projects.length,
  );
  const work = home.split('class="project-grid"')[1].split("</section>")[0];
  assert.deepEqual(
    [...work.matchAll(/href="\/projects\/([^/]+)\/"/g)].map(
      (match) => match[1],
    ),
    projects.map((project) => project.slug),
  );
  assert.ok(
    home.includes(`<span>${String(projects.length).padStart(2, "0")}</span>`),
  );
  assert.doesNotMatch(
    home,
    /example\.com|Lorem ipsum|Present|Available for work/,
  );
  if (!profile.email) assert.doesNotMatch(home, /mailto:|copy-email/);
  assert.match(home, /role="status"/);
  assert.match(home, /og:image/);
  const image =
    /property="og:image" content="https:\/\/iddangunawan.github.io\/([^"]+)"/.exec(
      home,
    );
  assert.ok(image);
  assert.ok((await stat(path.join(root, image[1]))).size > 0);
});
test("all case studies are static pages with metadata, context, and next project", async () => {
  for (const p of projects) {
    const page = await readFile(`_site/projects/${p.slug}/index.html`, "utf8");
    assert.ok(page.includes(`<h1>${escape(p.title)}</h1>`));
    assert.ok(page.includes('class="next-project"'));
    assert.ok(
      page.includes(`https://iddangunawan.github.io/projects/${p.slug}/`),
    );
    if (p.media) {
      if (p.media.store) assert.match(page, /Official store previews/);
      else if (p.media.cover) assert.match(page, /class="project-cover"/);
      else assert.match(page, /Portfolio preview/);
      assert.match(page, /Inside the app/);
      assert.equal(
        (page.match(/data-gallery-image/g) || []).length,
        p.gallery.length,
      );
      assert.doesNotMatch(page, /View full image/);
      assert.doesNotMatch(
        page,
        /Original product screenshots are not currently available/,
      );
    } else assert.match(page, /not a product screenshot/);
    if (!p.role) assert.doesNotMatch(page, /<h2>My contribution/);
  }
});

test("store assets retain provenance and correct intrinsic image dimensions", async () => {
  const { artwork } = await import("../scripts/components.mjs");
  for (const p of projects.filter((item) => item.media?.store)) {
    assert.ok(p.media.publisher && p.media.retrieved);
    assert.match(
      p.media.url,
      /^https:\/\/play\.google\.com\/store\/apps\/details\?id=/,
    );
    assert.ok(p.gallery.length > 0);
    assert.ok(p.gallery.includes(p.thumbnail));
    for (const asset of [p.media.icon, ...p.gallery]) {
      assert.ok(asset.width > 0 && asset.height > 0);
      assert.match(asset.src, /^\/assets\/img\/projects\//);
      if (asset.originalUrl) {
        assert.match(
          asset.originalUrl,
          /^https:\/\/(?:play-lh|lh3)\.googleusercontent\.com\//,
        );
      } else {
        assert.match(asset.originalFile, /^[^/]+\.webp$/);
      }
      assert.ok((await stat(path.join(root, asset.src))).size > 0);
    }
    for (const asset of p.gallery) assert.ok(asset.alt);
    assert.doesNotMatch(artwork(p), /aria-hidden/);
  }
});

test("Batian uses the supplied cover and all six promotional screenshots locally", async () => {
  const batian = projects.find((p) => p.slug === "batian");
  const { artwork, projectGallery } = await import("../scripts/components.mjs");
  assert.equal(batian.gallery.length, 6);
  assert.equal(batian.thumbnail, batian.media.cover);
  assert.equal(batian.links.length, 0);
  assert.match(artwork(batian), /class="project-cover"/);
  assert.doesNotMatch(artwork(batian), /Conceptual|Official store previews/);
  assert.match(projectGallery(batian), /supplied by Iddan Gunawan/);
  assert.doesNotMatch(
    projectGallery(batian),
    /Official screenshots from|Google Play|undefined/,
  );
  for (const asset of [batian.media.cover, ...batian.gallery]) {
    assert.ok(asset.alt && asset.width > 0 && asset.height > 0);
    assert.match(
      asset.originalUrl,
      /^https:\/\/scontent\.fbdo13-1\.fna\.fbcdn\.net\//,
    );
    assert.match(asset.src, /^\/assets\/img\/projects\/batian\//);
    assert.ok((await stat(path.join(root, asset.src))).size > 0);
  }
  const home = await readFile("_site/index.html", "utf8");
  const detail = await readFile("_site/projects/batian/index.html", "utf8");
  assert.ok(home.includes(batian.media.cover.src));
  for (const asset of batian.gallery) assert.ok(detail.includes(asset.src));
  assert.doesNotMatch(
    detail,
    /fbcdn\.net|Original product screenshots are not currently available/,
  );
});

test("ManyOption retains its historical title and labels the current MOaja listing", async () => {
  const project = projects.find((p) => p.slug === "manyoption");
  assert.equal(project.title, "ManyOption");
  assert.equal(project.gallery.length, 5);
  assert.equal(project.media.listingName, "MOaja");
  assert.equal(project.media.publisher, "Nusatek");
  assert.equal(new Set(project.gallery.map((asset) => asset.src)).size, 5);
  assert.equal(project.features.length, 5);
  assert.equal(
    project.role,
    "Development of multiple ManyOption applications at Nusantara Sukses Teknologi.",
  );
  assert.equal(project.dates, null);
  assert.deepEqual(project.technologies, []);
  assert.equal(
    project.links[0].url,
    "https://play.google.com/store/apps/details?id=com.manyoption",
  );
  const page = await readFile("_site/projects/manyoption/index.html", "utf8");
  assert.match(page, /currently listed as MOaja/);
  assert.match(page, /<h2>My contribution<\/h2>/);
  assert.match(page, /View on Google Play/);
  assert.equal((page.match(/data-gallery-image/g) || []).length, 5);
  const overview = page.slice(
    page.indexOf("<h2>Overview"),
    page.indexOf("<h2>My contribution"),
  );
  for (const feature of project.features)
    assert.ok(overview.includes(feature.title));
  assert.doesNotMatch(overview, /25%|30%/);
  assert.match(page, /<h1>ManyOption<\/h1>/);
  assert.match(page, /com\.manyoption/);
  for (const asset of [project.media.icon, ...project.gallery])
    assert.ok(page.includes(asset.src));
  assert.doesNotMatch(
    page,
    /Original product screenshots are not currently available/,
  );
});

test("verified résumé contact and source discrepancies are visible", async () => {
  const home = await readFile("_site/index.html", "utf8");
  assert.match(home, /mailto:iddandunk@gmail\.com/);
  assert.match(home, /class="copy-email"/);
  assert.equal(capabilities.length, 5);
  assert.equal(experience[0].title, "Principal Engineer (Mobile)");
  assert.equal(experience[0].dates, "Mar 2024 — Nov 2024");
  assert.match(home, /Mar 2020–May 2023/);
  assert.match(home, /Jun 2022–May 2023/);
  assert.match(home.replace(/\s+/g, " "), /No current role is implied/);
  for (const [name, url] of profile.socials) {
    const footer = home.slice(home.indexOf("<footer"));
    assert.ok(footer.includes(url), name);
  }
  const output = await files(root);
  assert.ok(
    output.every(
      (file) =>
        !/\.php$/i.test(file) &&
        (!/\.pdf$/i.test(file) ||
          /assets\/documents\/iddan-gunawan-(cv|resume|portfolio)\.pdf$/.test(
            file,
          )),
    ),
    "Private source PDFs and PHP are not published",
  );
});

test("Gaji Cermat keeps its title and separates KerjaCermat product features from unconfirmed contributions", async () => {
  const project = projects.find((p) => p.slug === "gaji-cermat");
  assert.equal(project.title, "Gaji Cermat");
  assert.equal(project.media.listingName, "KerjaCermat");
  assert.equal(project.gallery.length, 6);
  assert.equal(new Set(project.gallery.map((asset) => asset.src)).size, 6);
  assert.equal(project.features.length, 7);
  assert.equal(project.role, null);
  assert.equal(project.dates, null);
  assert.deepEqual(project.technologies, []);
  assert.deepEqual(project.outcomes, []);
  assert.deepEqual(project.links, [
    {
      label: "View on Google Play",
      url: "https://play.google.com/store/apps/details?id=com.uangcermat.kerjacermatess&hl=id",
    },
    {
      label: "View on the App Store",
      url: "https://apps.apple.com/id/app/kerjacermat/id1629850957",
    },
  ]);
  const employment = experience.find(
    (e) => e.company === "PT. Gajicermat Mandiri Digital Indonesia",
  );
  assert.equal(employment.title, "Senior Frontend Developer");
  assert.equal(employment.dates, "Jul 2021 — Dec 2021");
  const page = await readFile("_site/projects/gaji-cermat/index.html", "utf8");
  assert.match(page, /<h1>Gaji Cermat<\/h1>/);
  assert.match(page, /currently listed as KerjaCermat/);
  assert.equal((page.match(/data-gallery-image/g) || []).length, 6);
  for (const asset of project.gallery) {
    assert.equal(asset.width, 720);
    assert.equal(asset.height, 1560);
    assert.match(asset.src, /kerjacermat-0[1-6]\.png$/);
    const bytes = await readFile(path.join(root, asset.src));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.ok(page.includes(asset.src));
  }
  for (const feature of project.features)
    assert.ok(page.includes(feature.title));
  assert.doesNotMatch(
    page,
    /<h2>My contribution|<h2>Documented outcomes|src="https?:/,
  );
});

test("GardaKu shows six official images and product features without inventing contributions", async () => {
  const project = projects.find((p) => p.slug === "gardaku");
  assert.equal(project.title, "GardaKu");
  assert.equal(project.media.listingName, "GardaKu - App Petugas Keamanan");
  assert.equal(project.media.publisher, "PT RAKSASA KINERJA DIGITAL INDONESIA");
  assert.equal(project.gallery.length, 6);
  assert.equal(new Set(project.gallery.map((asset) => asset.src)).size, 6);
  assert.equal(project.features.length, 7);
  assert.equal(project.role, null);
  assert.equal(project.dates, null);
  assert.deepEqual(project.technologies, []);
  assert.deepEqual(project.outcomes, []);
  assert.deepEqual(project.links, [
    {
      label: "View on Google Play",
      url: "https://play.google.com/store/apps/details?id=com.uangcermat.rapiku.gardaku&hl=id",
    },
  ]);
  const page = await readFile("_site/projects/gardaku/index.html", "utf8");
  assert.match(page, /<h1>GardaKu<\/h1>/);
  assert.match(page, /GajiCermat HRIS platform/);
  assert.equal((page.match(/data-gallery-image/g) || []).length, 6);
  for (const asset of project.gallery) {
    assert.equal(asset.width, 960);
    assert.equal(asset.height, 1707);
    assert.match(asset.src, /gardaku-0[1-6]\.png$/);
    const bytes = await readFile(path.join(root, asset.src));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.ok(page.includes(asset.src));
  }
  for (const feature of project.features)
    assert.ok(page.includes(feature.title));
  assert.doesNotMatch(
    page,
    /<h2>My contribution|<h2>Documented outcomes|src="https?:/,
  );
});

test("emitra preserves its identity and displays eight official previews separately from its icon", async () => {
  const project = projects.find((p) => p.slug === "emitra");
  assert.equal(project.title, "emitra");
  assert.equal(project.media.listingName, "emitra - Belanja Grosir Online");
  assert.equal(project.gallery.length, 8);
  assert.equal(new Set(project.gallery.map((asset) => asset.src)).size, 8);
  assert.ok(
    !project.gallery.some((asset) => asset.src === project.media.icon.src),
  );
  assert.equal(project.features.length, 8);
  assert.equal(project.role, null);
  assert.equal(project.dates, null);
  assert.deepEqual(project.technologies, []);
  assert.deepEqual(project.outcomes, []);
  assert.deepEqual(project.links, [
    {
      label: "View on Google Play",
      url: "https://play.google.com/store/apps/details?id=com.chatcommerce.edot&hl=id",
    },
  ]);
  const page = await readFile("_site/projects/emitra/index.html", "utf8");
  assert.equal((page.match(/data-gallery-image/g) || []).length, 8);
  assert.match(page, /applicable offer terms for eligibility/);
  for (const [i, asset] of project.gallery.entries()) {
    assert.equal(asset.width, 960);
    assert.equal(asset.height, i < 5 ? 1707 : 719);
    const bytes = await readFile(path.join(root, asset.src));
    if (asset.src.endsWith(".png"))
      assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    else assert.equal(bytes.subarray(0, 2).toString("hex"), "ffd8");
    assert.ok(page.includes(asset.src));
  }
  for (const feature of project.features)
    assert.ok(page.includes(feature.title));
  assert.doesNotMatch(
    page,
    /<h2>My contribution|<h2>Documented outcomes|src="https?:/,
  );
});

test("HRIS ETHOS reuses official screens and adds the supplied banner without inventing contributions", async () => {
  const project = projects.find((p) => p.slug === "hris-ethos");
  assert.equal(project.title, "HRIS ETHOS");
  assert.equal(project.media.publisher, "Ethos Kreatif Indonesia");
  assert.equal(project.gallery.length, 4);
  assert.equal(new Set(project.gallery.map((asset) => asset.src)).size, 4);
  assert.equal(project.features.length, 3);
  assert.equal(project.role, null);
  assert.equal(project.dates, null);
  assert.deepEqual(project.technologies, []);
  assert.deepEqual(project.outcomes, []);
  assert.deepEqual(project.links, [
    {
      label: "View on Google Play",
      url: "https://play.google.com/store/apps/details?id=com.waizly.hris.prod.hris",
    },
  ]);
  const page = await readFile("_site/projects/hris-ethos/index.html", "utf8");
  assert.match(
    page,
    /internal Human Resource Information System application for Ethos Waizly/,
  );
  assert.equal((page.match(/data-gallery-image/g) || []).length, 4);
  assert.ok(
    !project.gallery.some((asset) => asset.src === project.media.icon.src),
  );
  for (const [i, asset] of project.gallery.entries()) {
    assert.equal(asset.width, i < 3 ? 720 : 512);
    assert.equal(asset.height, i < 3 ? 1600 : 250);
    const bytes = await readFile(path.join(root, asset.src));
    if (i < 3) assert.equal(bytes.subarray(0, 2).toString("hex"), "ffd8");
    else assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.ok(page.includes(asset.src));
  }
  for (const feature of project.features)
    assert.ok(page.includes(feature.title));
  assert.doesNotMatch(
    page,
    /<h2>My contribution|<h2>Documented outcomes|src="https?:/,
  );
});

test("GUIDE includes four official screens, its icon, and clinical scope without invented contributions", async () => {
  const project = projects.find((p) => p.slug === "guide");
  assert.equal(project.title, "GUIDE");
  assert.equal(project.media.listingName, "GUIDE by DoubleLogic");
  assert.equal(project.media.publisher, "DoubleLogic Sdn Bhd");
  assert.equal(project.gallery.length, 4);
  assert.equal(new Set(project.gallery.map((a) => a.src)).size, 4);
  assert.equal(project.features.length, 6);
  assert.equal(project.role, null);
  assert.equal(project.dates, null);
  assert.deepEqual(project.technologies, []);
  assert.deepEqual(project.outcomes, []);
  assert.deepEqual(project.links, [
    {
      label: "View on Google Play",
      url: "https://play.google.com/store/apps/details?id=com.doublelogichealthcare.guide",
    },
  ]);
  const page = await readFile("_site/projects/guide/index.html", "utf8");
  assert.equal((page.match(/data-gallery-image/g) || []).length, 4);
  assert.match(page, /does not replace clinical judgment/);
  assert.match(page, /does not diagnose or treat patients/);
  assert.ok(!project.gallery.some((a) => a.src === project.media.icon.src));
  for (const asset of [project.media.icon, ...project.gallery]) {
    assert.equal(asset.width, asset === project.media.icon ? 256 : 500);
    assert.equal(asset.height, asset === project.media.icon ? 256 : 1024);
    const bytes = await readFile(path.join(root, asset.src));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.ok(page.includes(asset.src));
  }
  for (const feature of project.features)
    assert.ok(page.includes(feature.title));
  assert.doesNotMatch(
    page,
    /<h2>My contribution|<h2>Documented outcomes|src="https?:/,
  );
});

test("WoKu includes every discovered product image and preserves unconfirmed contribution fields", async () => {
  const project = projects.find((p) => p.slug === "woku");
  assert.equal(project.title, "WoKu");
  assert.equal(project.media.publisher, "DoubleLogic Sdn Bhd");
  assert.equal(project.gallery.length, 8);
  assert.equal(new Set(project.gallery.map((a) => a.src)).size, 8);
  assert.equal(project.features.length, 5);
  assert.equal(project.role, null);
  assert.equal(project.dates, null);
  assert.deepEqual(project.technologies, []);
  assert.deepEqual(project.outcomes, []);
  assert.deepEqual(project.links, [
    {
      label: "View on Google Play",
      url: "https://play.google.com/store/apps/details?id=com.doublelogic.woku",
    },
  ]);
  const page = await readFile("_site/projects/woku/index.html", "utf8");
  assert.equal((page.match(/data-gallery-image/g) || []).length, 8);
  assert.ok(!project.gallery.some((a) => a.src === project.media.icon.src));
  for (const [i, asset] of [...project.gallery, project.media.icon].entries()) {
    assert.equal(asset.width, i < 7 ? 500 : i === 7 ? 1024 : 256);
    assert.equal(asset.height, i < 7 ? 1024 : i === 7 ? 500 : 256);
    const bytes = await readFile(path.join(root, asset.src));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.ok(page.includes(asset.src));
  }
  for (const feature of project.features)
    assert.ok(page.includes(feature.title));
  assert.doesNotMatch(
    page,
    /<h2>My contribution|<h2>Documented outcomes|src="https?:/,
  );
});

test("SENTRY Nurse is listed once with all official product images and configuration limits", async () => {
  const entries = projects.filter((p) => p.slug === "sentry-nurse");
  assert.equal(entries.length, 1);
  const project = entries[0];
  assert.equal(project.title, "SENTRY Nurse by DoubleLogic");
  assert.equal(project.featured, false);
  assert.equal(project.media.publisher, "DoubleLogic Sdn Bhd");
  assert.equal(project.gallery.length, 9);
  assert.equal(new Set(project.gallery.map((a) => a.src)).size, 9);
  assert.equal(project.features.length, 7);
  assert.equal(project.role, null);
  assert.equal(project.dates, null);
  assert.deepEqual(project.technologies, []);
  assert.deepEqual(project.outcomes, []);
  assert.deepEqual(project.links, [
    {
      label: "View on Google Play",
      url: "https://play.google.com/store/apps/details?id=com.doublelogichealthcare.sentry",
    },
  ]);
  const page = await readFile("_site/projects/sentry-nurse/index.html", "utf8");
  assert.equal((page.match(/data-gallery-image/g) || []).length, 9);
  assert.match(page, /factory infirmaries/);
  assert.match(page, /An account and an assigned workplace are required/);
  assert.match(page, /Available features depend on/);
  assert.ok(!project.gallery.some((a) => a.src === project.media.icon.src));
  for (const [i, asset] of [...project.gallery, project.media.icon].entries()) {
    assert.equal(asset.width, i < 8 ? 500 : i === 8 ? 1024 : 256);
    assert.equal(asset.height, i < 8 ? 1024 : i === 8 ? 500 : 256);
    const bytes = await readFile(path.join(root, asset.src));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.ok(page.includes(asset.src));
  }
  const home = await readFile("_site/index.html", "utf8");
  assert.equal(
    (home.match(/href="\/projects\/sentry-nurse\/"/g) || []).length,
    1,
  );
  const sitemap = await readFile("_site/sitemap.xml", "utf8");
  assert.ok(
    sitemap.includes("https://iddangunawan.github.io/projects/sentry-nurse/"),
  );
  for (const feature of project.features)
    assert.ok(page.includes(feature.title));
  assert.doesNotMatch(
    page,
    /<h2>My contribution|<h2>Documented outcomes|src="https?:/,
  );
});

test("professional documents have distinct PDFs, accessible actions, and a readable static CV", async () => {
  const { documents, professional } =
    await import("../content/professional.mjs");
  const { cvContent, printContent } = await import("../scripts/documents.mjs");
  const home = await readFile("_site/index.html", "utf8");
  const cv = await readFile("_site/cv/index.html", "utf8");
  assert.ok(home.includes('href="/cv/"'));
  assert.doesNotMatch(home, /href="\/cv\/"[^>]*download/);
  assert.match(cv, /<title>CV — Iddan Gunawan/);
  assert.ok(cv.includes('href="/">← Back to the portfolio'));
  for (const heading of [
    "Professional summary",
    "Work experience",
    "Technical skills",
    "Education &amp; training",
    "Relevant projects &amp; documented achievements",
  ])
    assert.ok(cv.includes(heading));
  assert.ok(cv.includes(escape(professional.education.institution)));
  for (const role of experience) assert.ok(cv.includes(escape(role.company)));
  assert.doesNotMatch(cv, /082214296034|Currently contributing|10\+ years/);
  const buffers = [];
  for (const doc of documents) {
    const link = `href="/assets/documents/${doc.filename}" download="${doc.filename}"`;
    assert.ok(home.includes(link));
    if (doc.id === "cv") assert.ok(cv.includes(link));
    const bytes = await readFile(
      path.join(root, "assets/documents", doc.filename),
    );
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.ok(bytes.length > 10000);
    assert.ok(bytes.includes(Buffer.from("/Font")));
    buffers.push(bytes);
  }
  assert.ok(
    !buffers[0].equals(buffers[1]) &&
      !buffers[1].equals(buffers[2]) &&
      !buffers[0].equals(buffers[2]),
  );
  assert.equal(cvContent(), printContent("cv"));
  assert.equal(
    (printContent("resume").match(/class="resume-page"/g) || []).length,
    2,
  );
  assert.equal(
    (printContent("portfolio").match(/class="portfolio-case"/g) || []).length,
    projects.filter((p) => p.featured).length,
  );
  assert.throws(() => printContent("invalid"), /Unknown document/);
  assert.ok(
    (await readFile("_site/sitemap.xml", "utf8")).includes(
      "https://iddangunawan.github.io/cv/",
    ),
  );
});
