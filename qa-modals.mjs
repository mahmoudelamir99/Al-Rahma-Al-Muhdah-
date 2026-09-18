export default async function run(page, ui) {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3500);
  await page.locator('button[aria-label="فتح القائمة"]').click();
  await page.locator('nav[aria-label="التنقل على الموبايل"] button').click();
  await page.waitForTimeout(400);
  const track = await page.evaluate(() => { const dialog = document.querySelector('[aria-label="تبع طلبك"] > div'); const r = dialog?.getBoundingClientRect(); return r ? { top: r.top, bottom: r.bottom, height: r.height, viewportHeight: innerHeight, className: dialog.className } : null; });
  await page.screenshot({ path: 'track-modal-after.png', fullPage: false });
  const close = await page.locator('[aria-label="إغلاق"]').first(); await close.click();
  await page.evaluate(() => document.getElementById('request-job')?.scrollIntoView());
  const request = page.getByRole('button', { name: 'اطلب وظيفتك' }); await request.click();
  await page.waitForTimeout(400);
  const apply = await page.evaluate(() => { const dialog = document.querySelector('[aria-label="نموذج التقديم"] > div'); const r = dialog?.getBoundingClientRect(); return r ? { top: r.top, bottom: r.bottom, height: r.height, viewportHeight: innerHeight, className: dialog.className } : null; });
  await page.screenshot({ path: 'request-modal-after.png', fullPage: false });
  return { track, apply };
}