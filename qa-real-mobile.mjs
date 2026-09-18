export default async function run(page) {
  const out = {};
  const contexts = [
    ['iphone-se', 375, 667],
    ['iphone-12-pro', 390, 844],
  ];
  for (const [name, width, height] of contexts) {
    await page.setViewportSize({ width, height });
    await page.goto('http://localhost:3000');
    await page.waitForSelector('main');
    await page.waitForTimeout(1500);

    const base = await page.evaluate(() => ({
      viewport: [innerWidth, innerHeight],
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));

    await page.locator('button[aria-label="فتح القائمة"]').click();
    await page.locator('nav[aria-label="التنقل على الموبايل"] button').click();
    await page.waitForTimeout(500);

    const modal = await page.evaluate(() => {
      const el = document.querySelector('[aria-label="تتبع طلبك"]');
      const inner = el?.firstElementChild;
      const r = inner?.getBoundingClientRect();
      return {
        parent: el?.parentElement?.tagName,
        top: Math.round(r?.top ?? -1),
        bottom: Math.round(r?.bottom ?? -1),
        left: Math.round(r?.left ?? -1),
        right: Math.round(r?.right ?? -1),
        width: Math.round(r?.width ?? -1),
        viewportH: innerHeight,
        viewportW: innerWidth,
      };
    });
    await page.screenshot({ path: `${name}-track-FINAL.png` });
    out[name] = { base, modal };
  }
  return out;
}