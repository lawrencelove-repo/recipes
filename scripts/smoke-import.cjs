const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  // Force a clean IndexedDB so schema v2 seed loads.
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("http://127.0.0.1:8099/", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".list .title", { timeout: 30000 });
  const countText = await page.locator(".subbar .count").textContent();
  const titles = await page.locator(".list .title").allTextContents();
  console.log("count label:", countText);
  console.log("first titles:", titles.slice(0, 8));
  console.log("listed:", titles.length);

  const banana = page.locator(".list li", { hasText: "Banana Punch" }).first();
  await banana.click();
  await page.waitForSelector(".detail h2");
  console.log("detail:", await page.locator(".detail h2").textContent());
  const ings = await page.locator(".ing-list li").count();
  const steps = await page.locator(".steps li").count();
  console.log("banana ingredients/steps:", ings, steps);

  if (errors.length) {
    console.log("ERRORS:", errors);
    process.exitCode = 1;
  } else if (!/9\d recipes/.test(countText || "") && !/100 recipes|99 recipes|98 recipes/.test(countText || "")) {
    console.log("Unexpected count");
    process.exitCode = 1;
  } else {
    console.log("OK");
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
