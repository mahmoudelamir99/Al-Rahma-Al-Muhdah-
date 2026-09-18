export default async function run(page) {
  const out = {};
  for (const [name, width, height] of [['iphone-se', 375, 667], ['iphone-12-pro', 390, 844], ['desktop', 1280, 800]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://localhost:3000');
    await page.waitForSelector('main');
    await page.waitForTimeout(1200);
    const base = await page.evaluate(() => ({ viewport: [innerWidth, innerHeight], scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth, hasLoading: !!document.querySelector('[role=status]') }));
    if (width < 500) {
      await page.locator('button[aria-label="فتح القائمة"]').click();
      await page.locator('nav[aria-label="التنقل على الموبايل"] button').click();
    } else {
      await page.locator('button').filter({ hasText: 'تتبع طلبك' }).first().click();
    }
    await page.waitForTimeout(400);
    const track = await page.evaluate(() => { const d = document.querySelector('[aria-label="تتبع طلبك"] > div'); const r = d?.getBoundingClientRect(); return r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height), viewportHeight: innerHeight, scrollWidth: document.documentElement.scrollWidth } : null; });
    await page.screenshot({ path: `${name}-track-v2.png` });
    await page.evaluate(() => document.querySelector('[aria-label="تتبع طلبك"]')?.remove());
    await page.evaluate(() => document.getElementById('request-job')?.scrollIntoView());
    await page.waitForTimeout(200);
    await page.locator('button').filter({ hasText: 'اطلب وظيفتك' }).click();
    await page.waitForTimeout(400);
    const request = await page.evaluate(() => { const d = document.querySelector('[aria-label="نموذج التقديم"] > div'); const r = d?.getBoundingClientRect(); return r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height), viewportHeight: innerHeight, scrollWidth: document.documentElement.scrollWidth } : null; });
    await page.screenshot({ path: `${name}-request-v2.png` });
    out[name] = { base, track, request };
  }
  return out;
}