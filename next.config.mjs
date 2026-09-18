/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // إطفاء أيقونة التطوير لعرض نضيف أثناء المراجعة
  devIndicators: false,
  // السماح بالوصول من أي جهاز على الشبكة المحلية أثناء التطوير
  allowedDevOrigins: ["192.168.1.3", "localhost", "127.0.0.1"],
};

export default nextConfig;
