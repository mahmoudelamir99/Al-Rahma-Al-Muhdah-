export default async function run(page) {
  const result = {};
  for (const [name, width, height] of [['iphone-se', 375, 667], ['iphone-12-pro', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3600);
    result[name] = await page.evaluate(() => ({ viewport: [innerWidth, innerHeight], scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth }));
    await page.screenshot({ path: `${name}-verified.png`, fullPage: false });
  }
  return result;
}