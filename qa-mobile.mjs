export default async function run(page, ui) {
  const results = {};
  for (const [name, width, height] of [['iphone-se', 375, 667], ['iphone-12-pro', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3500);
    results[name] = await page.evaluate(() => ({
      viewport: { width: window.innerWidth, height: window.innerHeight },
      bodyScrollWidth: document.body.scrollWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      buttons: [...document.querySelectorAll('button')].map((button) => ({ text: button.innerText.trim(), width: Math.round(button.getBoundingClientRect().width), right: Math.round(button.getBoundingClientRect().right) })),
    }));
    await page.screenshot({ path: `${name}-after.png`, fullPage: false });
  }
  return results;
}