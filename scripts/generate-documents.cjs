// Optional local tooling: NODE_PATH=/tmp/portfolio-browser-qa/node_modules node scripts/generate-documents.cjs
const { chromium } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { pathToFileURL } = require("node:url");
(async () => {
  const root = path.resolve(__dirname, "..");
  const { printContent } = await import("./documents.mjs");
  const { documents } = await import("../content/professional.mjs");
  const { escape } = await import("./components.mjs");
  const temporary = await fs.mkdtemp(
    path.join(os.tmpdir(), "portfolio-documents-"),
  );
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_PATH ||
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  try {
    const page = await browser.newPage();
    await fs.mkdir(path.join(root, "assets/documents"), { recursive: true });
    for (const doc of documents) {
      const content = printContent(doc.id).replaceAll(
        'src="/assets/',
        `src="${pathToFileURL(root + "/assets/")}`,
      );
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Iddan Gunawan — ${escape(doc.title)}</title><link rel="stylesheet" href="${pathToFileURL(root + "/assets/css/documents.css")}"></head><body class="${doc.id}">${content}</body></html>`;
      const file = path.join(temporary, doc.id + ".html");
      await fs.writeFile(file, html);
      await page.goto(pathToFileURL(file).href);
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => image.decode()));
      });
      await page.pdf({
        path: path.join(root, "assets/documents", doc.filename),
        format: "A4",
        preferCSSPageSize: true,
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: "<span></span>",
        footerTemplate:
          '<div style="font:8px Arial;color:#565650;width:100%;margin:0 17mm;display:flex;justify-content:space-between"><span>Iddan Gunawan · iddangunawan.github.io</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
      });
      console.log(`Generated ${doc.filename}`);
    }
  } finally {
    await browser.close();
    await fs.rm(temporary, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
