const { chromium } = require('playwright');

(async () => {
  const targets = ['http://127.0.0.1:5173/create-post', 'http://127.0.0.1:5174/create-post'];
  for (const url of targets) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const logs = [];
    page.on('console', (msg) => logs.push(`[console:${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));
    page.on('requestfailed', (req) => logs.push(`[requestfailed] ${req.url()} => ${req.failure()?.errorText}`));

    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      logs.push(`[status] ${res ? res.status() : 'no response'}`);
      await page.waitForTimeout(1200);
      const htmlLen = await page.locator('body').innerText().then((t) => t.length).catch(() => -1);
      logs.push(`[bodyTextLength] ${htmlLen}`);
      await page.screenshot({ path: `pw-${new URL(url).port}.png`, fullPage: true });
    } catch (e) {
      logs.push(`[goto-error] ${e.message}`);
    }

    console.log(`=== ${url} ===`);
    for (const line of logs) console.log(line);
    await browser.close();
  }
})();
