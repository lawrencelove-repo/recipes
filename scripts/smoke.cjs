const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("http://127.0.0.1:8099/", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector(".list .title", { timeout: 30000 });
  const titles = await page.locator(".list .title").allTextContents();
  console.log("list titles:", titles);

  await page.click(".list li");
  await page.waitForSelector(".detail h2");
  console.log("detail title:", await page.locator(".detail h2").textContent());
  const ings = await page.locator(".ing-list li").allTextContents();
  console.log("ingredients:", ings);
  const steps = await page.locator(".steps li").allTextContents();
  console.log("steps:", steps.length, steps.map((s) => s.slice(0, 40)));

  await page.click('[data-act="export"]');
  await page.click('[data-act="cook-now"]');
  await page.click('[data-act="scale"][data-scale="2"]');
  await page.click('[data-act="cook-go"]');
  await page.waitForSelector(".qty-scaled");
  const scaled = await page.locator(".ing-list li").allTextContents();
  console.log("scaled x2:", scaled);

  await page.click("text=FINISH");
  await page.click('[data-go*="edit"]');
  await page.waitForSelector('input[name="title"]');
  console.log("edit title:", await page.inputValue('input[name="title"]'));
  await page.click('[data-act="tab"][data-tab="2"]');
  const raw = await page.inputValue(".editor-text");
  console.log("ingredients editor starts with:", raw.split("\n").slice(0, 3));

  if (errors.length) {
    console.log("ERRORS:", errors);
    process.exitCode = 1;
  } else {
    console.log("OK");
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
