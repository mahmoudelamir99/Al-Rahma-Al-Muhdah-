export default async function run(page) {
  const output = {};
  for (const [name, width, height] of [['iphone-se', 375, 667], ['iphone-12-pro', 390, 844], ['desktop', 1280, 720]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://localhost:3000');
    await page.waitForSelector('main');
    await page.waitForTimeout(3600);
    const base = await page.evaluate(() => ({ viewport: [innerWidth, innerHeight], scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > innerWidth }));
    if (width < 500) {
      await page.locator('button[aria-label="فتح القائمة"]').click();
      await page.locator('nav[aria-label="التنقل على الموبايل"] button').click();
      await page.waitForTimeout(250);
    } else {
      await page.locator('button').filter({ hasText: 'تبع طلبك' }).first().click();
      await page.waitForTimeout(250);
    }
    const track = await page.evaluate(() => { const d = document.querySelector('[aria-label="تبع طلبك"] > div'); const r = d?.getBoundingClientRect(); return r && { top: r.top, bottom: r.bottom, height: r.height, viewportHeight: innerHeight }; });
    await page.screenshot({ path: `${name}-track.png`, fullPage: false });
    await page.locator('[aria-label="إغلاق"]').first().click({ force: true });
    if (width < 500) await page.evaluate(() => document.getElementById('request-job')?.scrollIntoView());
    await page.locator('button').filter({ hasText: 'اطلب وظيفتك' }).click();
    await page.waitForTimeout(250);
    const request = await page.evaluate(() => { const d = document.querySelector('[aria-label="نموذج التقديم"] > div'); const r = d?.getBoundingClientRect(); return r && { top: r.top, bottom: r.bottom, height: r.height, viewportHeight: innerHeight, scrollHeight: d.scrollHeight }; });
    await page.screenshot({ path: `${name}-request.png`, fullPage: false });
    output[name] = { base, track, request };
  }
  return output;
}