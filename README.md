# Iddan Gunawan — Developer Portfolio

An editorial portfolio for a Mobile Engineer & Engineering Leader, designed around warm paper, generous typography, restrained pink accents, and varied project presentations.

## Build and preview

Requires Node.js 22+; no package install or runtime dependency is needed.

```sh
node scripts/build.mjs
node --test
python3 -m http.server 4173 --directory _site
```

Open http://localhost:4173. `index.html` is the homepage body template; preview the **built `_site` directory**, not the source checkout. Generated output is ignored by Git.

## Structure

- `index.html` — homepage composition and editorial copy.
- `content/tokodistributor-assets.mjs` — user-supplied Tokodistributor cover and five gallery images, with original filenames.
- `content/batian-assets.mjs` — user-supplied Batian banner and six gallery images, with original source URLs.
- `content/portfolio-assets.mjs` — real Masskredit, Gaji Cermat, and Bebas Akuntansi previews extracted from the portfolio PDF.
- `content/store-assets.mjs` — official store image paths, dimensions, publisher attribution, and source URLs.
- `content/portfolio.mjs` — documented project schema, 16 projects, capabilities, experience, social links, and verified writing. Content and rendering are separate.
- `scripts/components.mjs` — shared HTML document, header, navigation, footer, buttons/links, tags, section headings, project artwork, and project cards.
- `scripts/build.mjs` — dependency-free static generation: homepage, project detail pages, 404, legacy redirects, sitemap, robots, and asset allowlist.
- `assets/css/portfolio.css` — centralized color, spacing, type, layout, and radius tokens; responsive components; reduced-motion and keyboard focus support.
- `assets/js/portfolio.js` — progressive enhancement for menu, filters, section feedback, year, and optional copy-email. Content and navigation remain usable without JavaScript.
- `tests/site.test.mjs` — content invariants, static routes, internal links/fragments, CSS/font/image assets, metadata, and unsupported-claim checks.
- `CONTENT-SOURCES.md` — provenance and facts still needing verification.

The original template libraries, images, legacy source pages, and PHP example remain in the checkout. They are excluded from the production bundle; GitHub Pages cannot run PHP and the original form was unconfigured.

## Content and design

The homepage includes all projects in `content/portfolio.mjs` array order with category filters, capability groups, expandable experience, a real portrait, one verified writing link, and contact/social links. Each project has a real static directory route, so refreshes and direct navigation work on GitHub Pages without a JavaScript routing fallback. Gallery images open in a native dialog with Escape, close-button, and backdrop dismissal; direct image links remain usable without JavaScript. Gallery, links, outcomes, contributions, and detailed sections are optional and only rendered when populated.

The December 2024 résumé, a seven-page portfolio, and the supplied GlobalPark presentation have now been inspected. Contact uses the résumé’s verified public email with mailto and accessible clipboard feedback. Recent titles and dates follow the résumé; the conflicting Tokodistributor LinkedIn record is shown alongside it. Overlapping roles are retained. Current employment is not inferred from these historical documents.

All six selected projects now have authentic imagery. KoltiTrace MIS and AroundChess each use eight supplied WebP previews; Batian and Tokodistributor use supplied banners and galleries; Sally and GlobalPark use official Google Play images. ManyOption/MOaja and HRIS ETHOS also have store imagery. Three projects use screenshots extracted from the original portfolio. Unknown contributions, stacks, timelines, and project URLs remain omitted; remaining placeholders are labeled conceptual artwork. Source PDFs, phone numbers, and residential addresses are not published. See `CONTENT-SOURCES.md` for the source record.

## GitHub Pages

Production URL: https://iddangunawan.github.io/ (root-domain asset paths).

No workflow existed in the checkout. `.github/workflows/pages.yml` builds/tests pull requests and publishes only when **manually run on main**. After reviewing and merging these changes, set repository **Settings → Pages → Source → GitHub Actions**, then run **Build and publish portfolio** from the Actions tab. The artifact directory is `_site`; no generated files, secrets, or tokens need committing. Publishing requires the repository's GitHub Pages environment to allow the deployment.

Nothing is pushed or deployed by the local build. Root `404.html` is generated for real unknown routes; old template URLs redirect to the relevant homepage sections.

## Quality checks

```sh
node --check scripts/build.mjs
node --check scripts/components.mjs
node --check assets/js/portfolio.js
node scripts/build.mjs
node --test
```

There was no existing lint, formatter, type-check, or test configuration. The site uses plain JavaScript with JSDoc for project records; no framework migration was introduced.

Optional browser regression (Chrome installed, preview server running):

```sh
npm install --prefix /tmp/portfolio-browser-qa --no-audit --no-fund playwright @axe-core/playwright
NODE_PATH=/tmp/portfolio-browser-qa/node_modules node scripts/browser-check.cjs
```

Set `BROWSER_PATH` to use a different Chrome executable. This checks seven viewport widths, axe WCAG A/AA rules, filtering and project order, experience expansion, menu dismissal, all project detail refreshes at mobile and desktop widths, image decoding, gallery popup keyboard/focus/dismissal behavior, and gallery accessibility, reduced motion, JavaScript-disabled navigation, copy-email success/failure, and runtime/network errors. Screenshots are written to `/tmp/portfolio-390.png` and `/tmp/portfolio-1440.png`. Browser tooling stays outside the project dependencies.
