import { SITE_URL } from "@/lib/siteConfig";

/**
 * robots.txt تلقائي — Next.js بيولده وقت الـ build
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // مسارات مش محتاجة تتأرشف
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
