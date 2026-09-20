import "./globals.css";
import { SITE_URL, COMPANY } from "@/lib/siteConfig";

const TITLE = "الرحمة المهداة للتوظيف | فرص عمل بالشركات العالمية";
const DESCRIPTION =
  "منصتكم الأولى للتوظيف بالشركات العالمية الموجودة بمصر. نوفر فرص عمل مناسبة بشكل مجاني تماماً للباحثين عن عمل.";

/**
 * ملاحظة: الـ OG Image موجود مؤقتاً في /public/og-image.png
 * ولما العميل يبعت اللوجو النهائي، بيتستبدل بنفس الاسم
 * من غير أي تعديل في الكود.
 */
const OG_IMAGE = "/og-image.png";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "توظيف",
    "فرص عمل",
    "وظائف مصر",
    "وظائف العاشر من رمضان",
    "الرحمة المهداة للتوظيف",
    "وظائف الشركات العالمية",
    "شغل في مصر",
    "فرص عمل مجانية",
  ],
  authors: [{ name: COMPANY.name }],
  creator: COMPANY.name,
  publisher: COMPANY.name,

  // رابط رسمي واحد لكل صفحة (يمنع تكرار المحتوى)
  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: SITE_URL,
    siteName: COMPANY.name,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${COMPANY.name} — ${COMPANY.tagline}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },

  category: "business",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* خط Cairo العربي - خفيف ومريح للموبايل */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-cairo:'Cairo',system-ui,sans-serif}`}</style>
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
