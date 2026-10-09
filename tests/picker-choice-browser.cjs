// Start scripts/serve-ux.cjs first. SENTRI_PLAYWRIGHT may point to an external Playwright install.
const { chromium } = require(process.env.SENTRI_PLAYWRIGHT || "playwright");
const fs = require("fs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: "chromium",
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  await page.route("**/favicon.ico", (r) => r.fulfill({ status: 204 }));
  page.on("pageerror", (e) => errors.push({ url: page.url(), error: e.stack }));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const base = process.env.SENTRI_PREVIEW_URL || "http://127.0.0.1:4317";
  const proof = "ux/design-system/components/picker-choice-proof";
  fs.mkdirSync(proof, { recursive: true });
  const results = [];
  for (const name of ["PickerField", "ChoiceList"])
    for (const v of JSON.parse(
      fs.readFileSync(`ux/design-system/components/${name}/variants.json`),
    )) {
      const html = fs.readFileSync(
        `ux/design-system/components/${name}/variants/${v.id}.html`,
        "utf8",
      );
      await page.goto(base + "/ux/design-system/tokens.css");
      await page.setContent(
        `<link rel="stylesheet" href="${base}/ux/design-system/tokens.css"><link rel="stylesheet" href="${base}/ux/design-system/components/bundle.css"><style>body{margin:0;padding:var(--space-16);font-family:var(--font-sans);color:var(--ink)}section[data-state]{margin-bottom:var(--space-24)}</style><script src="${base}/ux/design-system/components/bundle.js"></script>` +
          html,
      );
      await page.waitForTimeout(250);
      let small = await targets(page, true);
      let overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      results.push({ variant: name + "/" + v.id, small, overflow });
      await page.setViewportSize({ width: 375, height: 844 });
      const proof375 = {
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        small: await targets(page, true),
      };
      if (proof375.overflow || proof375.small.length)
        throw Error(
          "375px proof failed: " +
            name +
            "/" +
            v.id +
            " " +
            JSON.stringify(proof375),
        );
      await page.screenshot({
        path: `${proof}/${name}-${v.id}.png`,
        fullPage: true,
      });
      await page.setViewportSize({ width: 390, height: 844 });
    }
  let screens = [];
  function walk(n) {
    if (Array.isArray(n)) n.forEach(walk);
    else if (n && typeof n === "object") {
      if (
        n.id &&
        n.url &&
        ((n.id.startsWith("health-record.") &&
          [
            "record-health",
            "condition-picker",
            "medicine-picker",
            "treatment",
            "edit-finding",
              "resolve-conditions",
          ].includes(n.id.split(".").at(-1))) ||
          n.id === "pig-profile.log" || n.id === "workbench.choose-unit" ||
          n.url.includes("view=sections") ||
          (n.url.includes("farrowing-astra-concept") &&
            /death|edit$|edit-finished$|finish$|born$|mortality|identity|correction|fault/.test(
              n.id,
            )) ||
          (n.url.includes("piglet-processing/simple") &&
            /adjust|move/.test(n.id)))
      )
        screens.push(n);
      Object.values(n).forEach(walk);
    }
  }
  walk(JSON.parse(fs.readFileSync("atlas/atlas.json")));
  for (const s of screens) {
    await page.goto(base + s.url + "&screen=" + encodeURIComponent(s.id));
    await page.waitForTimeout(1800);
    results.push({
      screen: s.id,
      url: s.url,
      ready: await page.evaluate(() =>
        document.documentElement.classList.contains("atlas-ready"),
      ),
      small: await targets(page),
    });
    await page.screenshot({ path: `${proof}/${s.id}.png` });
    if (s.id === "pig-profile.log") {
      await page.locator('.atlas-phone > .sheet [data-action="log-date-open"]').click();
      await page.screenshot({path: `${proof}/inspection-log-date.png`});
      const small = await targets(page);
      if (small.length) throw Error('Log date targets: '+JSON.stringify(small));
    }
    if (s.id === "farrowing.finish") {
      await page
        .locator(
          ".atlas-phone [data-action=finishOptional][data-value=assisted]",
        )
        .click();
      await page
        .locator(".atlas-phone [data-action=assistance][data-value=false]")
        .click();
      await page.screenshot({ path: `${proof}/farrowing-assisted.png` });
      const small = await targets(page);
      if (small.length)
        throw Error("Assistance targets: " + JSON.stringify(small));
    }
    if (s.id === "farrowing.death") {
      await page
        .locator(".atlas-phone [data-action=mode][data-value=sow]")
        .click();
      await page
        .locator(".atlas-phone [data-action=sowCause][data-value=Other]")
        .click();
      await page.screenshot({ path: `${proof}/farrowing-sow-cause.png` });
      const small = await targets(page);
      if (small.length)
        throw Error("Sow cause targets: " + JSON.stringify(small));
    }
    if (s.id === "health-record.condition-picker") {
      await page
        .locator(
          '.atlas-phone > .sheet [data-action="condition-level"][data-value="Symptom"]',
        )
        .click();
      await page
        .locator(
          '.atlas-phone > .sheet [data-action="condition-level"][data-value="General appearance"]',
        )
        .click();
      let boxes = page.locator(".atlas-phone > .sheet input[data-condition]");
      let before = await boxes.count();
      await boxes.first().check();
      if ((await boxes.count()) !== before) throw Error("List disappeared");
      await boxes.nth(1).check();
      if (
        (await page
          .locator(".atlas-phone > .sheet input[data-condition]:checked")
          .count()) !== 2
      )
        throw Error("Second tick failed");
      await page.screenshot({ path: `${proof}/condition-two-ticks.png` });
      const search = page.locator(".atlas-phone > .sheet input[type=search]");
      await search.fill("fever");
      await page.waitForTimeout(200);
      if (
        !(await page
          .locator(".atlas-phone > .sheet input[data-condition]")
          .count())
      )
        throw Error("Whole tree search failed");
      await page.screenshot({ path: `${proof}/condition-search.png` });
    }
  }
  for (const name of ["PickerField", "ChoiceList"]) {
    await page.goto(base + "/atlas/");
    await page.waitForTimeout(500);
    for (const v of JSON.parse(
      fs.readFileSync(`ux/design-system/components/${name}/variants.json`),
    )) {
      const html = fs.readFileSync(
        `ux/design-system/components/${name}/variants/${v.id}.html`,
        "utf8",
      );
      const isolated = await page.evaluate((html) => {
        const d = new DOMParser().parseFromString(html, "text/html");
        return Array.from(d.querySelectorAll("[data-state]")).map(
          (s) => s.outerHTML,
        );
      }, html);
      for (const state of isolated) {
        await page.setContent(
          `<link rel="stylesheet" href="${base}/ux/design-system/tokens.css"><link rel="stylesheet" href="${base}/ux/design-system/components/bundle.css"><script src="${base}/ux/design-system/components/bundle.js"></script>` +
            state,
        );
        if (!(await page.locator("[data-state] [data-ds]").count()))
          throw Error("Atlas state failed: " + name + "/" + v.id);
      }
    }
    await page.setContent(
      `<link rel="stylesheet" href="${base}/ux/design-system/tokens.css"><link rel="stylesheet" href="${base}/ux/design-system/components/bundle.css"><script src="${base}/ux/design-system/components/bundle.js"></script>` +
        fs.readFileSync(
          `ux/design-system/components/${name}/preview.html`,
          "utf8",
        ),
    );
    if (!(await page.locator("[data-ds]").count()))
      throw Error("Preview failed " + name);
  }
  fs.writeFileSync(
    proof + "/browser-results.json",
    JSON.stringify({ errors, results }, null, 2),
  );
  console.log(JSON.stringify({ errors, results }, null, 2));
  await browser.close();
  if (
    errors.length ||
    results.some((r) => r.small.length || r.overflow || r.ready === false)
  )
    process.exitCode = 1;
})();
async function targets(page, all = false) {
  return page.evaluate(
    (all) =>
      Array.from(
        document.querySelectorAll(
          "button,input:not([type=hidden]):not([type=file]),textarea,a,summary",
        ),
      )
        .filter((el) => {
          const r = el.getBoundingClientRect(),
            c = getComputedStyle(el);
          return (
            r.width &&
            r.height &&
            c.visibility !== "hidden" &&
            !el.closest("[inert],[data-atlas-hide]") &&
            (all || (r.top < 844 && r.bottom > 0))
          );
        })
        .map((el) => {
          let box = el.type === "checkbox" ? el.closest("label") || el : el;
          let r = box.getBoundingClientRect();
          return {
            tag: el.tagName,
            text: (
              el.textContent ||
              el.getAttribute("aria-label") ||
              el.type ||
              ""
            ).slice(0, 45),
            w: Math.round(r.width * 100) / 100,
            h: Math.round(r.height * 100) / 100,
          };
        })
        .filter((r) => r.w < 47.99 || r.h < 47.99),
    all,
  );
}
