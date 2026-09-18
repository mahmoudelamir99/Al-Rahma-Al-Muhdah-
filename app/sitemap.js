import { SITE_URL } from "@/lib/siteConfig";

/**
 * sitemap.xml تلقائي — Next.js بيولده وقت الـ build
 */
export default function sitemap() {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
