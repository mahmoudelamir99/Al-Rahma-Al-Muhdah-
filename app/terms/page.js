import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/siteConfig";
import { getSiteSettings } from "@/lib/siteSettings";

/**
 * صفحة الشروط والأحكام العامة.
 * ---------------------------------------------------------------------------
 * النص بيجي من لوحة التحكم (CMS) — نفس الجدول اللي بيقراه الموقع.
 * لو الأدمن لسه مكشتبش نص، بنعرض رسالة افتراضية معقولة.
 */

export const metadata = {
  title: "الشروط والأحكام | الرحمة المهداة للتوظيف",
  description: "الشروط والأحكام الخاصة باستخدام منصة الرحمة المهداة للتوظيف.",
};

export const revalidate = 30;

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const terms = (settings.terms_text || "").trim();

  return (
    <main dir="rtl" className="min-h-[100dvh] bg-surface-200">
      {/* ترويسة بسيطة مع لينك الرجوع */}
      <header className="glass sticky top-0 z-40 border-b border-white/50">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-header.png"
              alt={COMPANY.name}
              width={80}
              height={56}
              className="h-9 w-auto object-contain"
            />
            <span className="text-[14px] font-extrabold text-brand-900">{COMPANY.shortName}</span>
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-surface-300 px-4 py-2 text-[13px] font-bold text-brand-900/80 transition-colors hover:bg-surface-400"
          >
            الرجوع للرئيسية
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">الشروط والأحكام</h1>
        <p className="mt-2 text-[13.5px] font-semibold text-brand-900/60">
          آخر تحديث: {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="divider-soft my-6" />

        {terms ? (
          <div className="whitespace-pre-wrap text-[15px] font-semibold leading-9 text-brand-900/85">
            {terms}
          </div>
        ) : (
          <div className="rounded-2xl border-amber-200 bg-amber-50 p-5">
            <p className="text-[14px] font-bold text-amber-900">
              الشروط والأحكام لسه ما اتحددتش من الإدارة.
            </p>
            <p className="mt-2 text-[13.5px] font-semibold leading-7 text-amber-900/85">
              لمزيد من الاستفسارات، تواصل معنا عبر بيانات التواصل في الصفحة الرئيسية.
            </p>
          </div>
        )}

        <div className="divider-soft my-8" />

        <p className="text-center text-[13px] font-semibold text-brand-900/60">
          {COMPANY.name} — {COMPANY.tagline}
        </p>
      </article>
    </main>
  );
}
