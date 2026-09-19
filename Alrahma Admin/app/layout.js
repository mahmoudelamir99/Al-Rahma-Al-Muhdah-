import "./globals.css";

export const metadata = {
  title: "لوحة التحكم | الرحمة المهداة للتوظيف",
  description: "لوحة تحكم الإدارة — دخول مقفول للمصرّح لهم فقط.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2f2f1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* خط Cairo العربي — نفس هوية الموقع الأساسي */}
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
      <body className="font-sans antialiased bg-surface-200 text-brand-800">{children}</body>
    </html>
  );
}
