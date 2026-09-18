export default async function run(page) {
  const out = {};

  // 1) الصفحة الرئيسية: مفيش poster ومفيش صورة خلفية، والفيديو شغال
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/');
  await page.waitForSelector('main');
  await page.waitForTimeout(2000);

  out.home = await page.evaluate(() => {
    const video = document.querySelector('video');
    const source = video?.querySelector('source');
    const hero = document.getElementById('top');
    return {
      videoFound: !!video,
      posterAttribute: video?.getAttribute('poster') ?? null,
      autoplay: video?.autoplay,
      muted: video?.muted,
      loop: video?.loop,
      playsInline: video?.playsInline,
      preload: video?.preload,
      readyState: video?.readyState,
      currentSrc: source?.getAttribute('src') ?? null,
      videoWidth: video?.videoWidth,
      videoHeight: video?.videoHeight,
      heroInlineStyle: hero ? (hero.getAttribute('style') || '(none)') : 'no-hero',
      heroBackgroundImage: hero ? getComputedStyle(hero).backgroundImage : 'n/a',
      anyImgInHero: hero ? hero.querySelectorAll('img').length : -1,
      scrollWidth: document.documentElement.scrollWidth,
      viewport: [innerWidth, innerHeight],
    };
  });

  // 2) الفيديو نفسه: هل الملف فعلاً وصل للبراوزر وبأي حجم؟
  out.videoFile = await page.evaluate(async () => {
    const res = await fetch('/hero-video.mp4', { method: 'HEAD' });
    return { status: res.status, contentType: res.headers.get('content-type'), bytes: Number(res.headers.get('content-length')) };
  });

  await page.screenshot({ path: 'hero-final-mobile.png' });
  return out;
}