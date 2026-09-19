"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  COMPANY,
  CONTACT,
  NAV_LINKS,
  WHATSAPP_LINK,
  ABOUT_TEXT,
} from "@/lib/siteConfig";

/* أيقونة واتساب */
function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* أيقونة الموقع */
function PinIcon({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function MailIcon({ className = "h-4 w-4" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3 6.5 9 6 9-6" />
    </svg>
  );
}

/* عنوان فرعي في الفوتر */
function ColumnTitle({ children }) {
  return (
    <h3 className="mb-3 text-xs font-extrabold tracking-wide text-brand-200 sm:text-sm">
      {children}
    </h3>
  );
}

/* سطر بيانات بأيقونة */
function InfoRow({ icon, children }) {
  return (
    <li className="flex items-start gap-2.5 text-xs font-semibold leading-7 text-slate-300 sm:text-sm">
      <span className="mt-1 shrink-0 text-brand-300">{icon}</span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

/**
 * نفس منطق الهيدر: نستنى أي أنيميشن (قائمة موبايل) يخلص
 * قبل ما نحسب موضع القسم، عشان السكرول ما يطلعش غلط.
 */
function scrollToSection(event, id, attempt = 0) {
  event.preventDefault();

  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  const mobileNav = document.querySelector('nav[aria-label="التنقل على الموبايل"]');
  if (mobileNav && mobileNav.getBoundingClientRect().height > 1 && attempt < 12) {
    window.setTimeout(() => scrollToSection(event, id, attempt + 1), 60);
    return;
  }

  const header = document.querySelector("header");
  const offset = (header?.getBoundingClientRect().height ?? 64) + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative scroll-mt-16 overflow-hidden bg-brand-950 text-slate-300">
      {/* تدرّج علوي يفصل الفوتر عن باقي الصفحة */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-brand-500/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-brand-500/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-9 sm:gap-10 lg:grid-cols-12">
          {/* العمود 1: اللوجو + الوصف */}
          <div className="lg:col-span-5">
            {/* برواز زجاجي فاتح تحت اللوجو عشان ينطق على الخلفية الغامقة */}
            <div className="inline-flex max-w-full items-center rounded-2xl bg-white/95 px-4 py-2.5 backdrop-blur-sm">
              {/*
                نفس ملف الهيدر المصغّر (الفراغ مقصوص منه): الأبعاد الحقيقية
                113×80 بدل 2783×1379 الغلط اللي كان بيخلّي العرض يتلغبط.
              */}
              <Image
                src="/logo-header.png"
                alt={`${COMPANY.name} — ${COMPANY.tagline}`}
                width={114}
                height={80}
                sizes="170px"
                className="h-14 w-auto object-contain sm:h-16"
              />
            </div>

            <p className="mt-4 max-w-md text-xs font-semibold leading-8 text-slate-300 sm:text-sm">
              {ABOUT_TEXT}
            </p>

            <motion.a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="btn-shine mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-whatsapp-darker via-whatsapp-dark to-whatsapp px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-whatsapp/20 ring-1 ring-inset ring-white/15 transition-shadow hover:shadow-xl hover:shadow-whatsapp/30 sm:text-sm"
            >
              <WhatsAppIcon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">كلمنا على واتساب</span>
            </motion.a>
          </div>

          {/* العمود 2: روابط سريعة */}
          <div className="lg:col-span-3">
            <ColumnTitle>روابط سريعة</ColumnTitle>
            <ul className="space-y-1.5">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={(event) => scrollToSection(event, link.id)}
                    className="text-xs font-semibold text-slate-200 transition-colors hover:text-brand-300 sm:text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* العمود 3: بيانات التواصل */}
          <div className="lg:col-span-4">
            <ColumnTitle>بيانات التواصل</ColumnTitle>
            <ul className="space-y-3">
              <InfoRow icon={<PinIcon />}>
                <a
                  href={CONTACT.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words transition-colors hover:text-brand-300"
                >
                  {CONTACT.addressLines[0]}
                  <br />
                  {CONTACT.addressLines[1]}
                </a>
              </InfoRow>

              <InfoRow icon={<ClockIcon />}>
                مواعيد العمل: {CONTACT.workingHours}
                <br />
                ({CONTACT.workingDays})
              </InfoRow>

              <InfoRow icon={<MailIcon />}>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="break-all transition-colors hover:text-brand-300"
                >
                  {CONTACT.email}
                </a>
              </InfoRow>

              <InfoRow icon={<WhatsAppIcon className="h-4 w-4" />}>
                <span className="font-bold text-white">
                  {CONTACT.whatsappName}
                </span>
                {" — "}
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="inline-block break-all transition-colors hover:text-brand-300"
                >
                  {CONTACT.whatsappNumber}
                </a>
              </InfoRow>
            </ul>
          </div>
        </div>

        {/*
          قسم الخريطة التفاعلية
          - خريطة جوجل حقيقية (iframe) بعرض القسم كامل، المستخدم يعمل
            زووم ويسحب ويشوف المكان بوضوح من غير ما يسيب الصفحة.
          - زرار فورم التواصل اتشال من هنا (مكرر)، بقى زرار الهيدر هو
            اللي بيفتح المودال مباشرةً.
        */}
        <div className="mt-10 overflow-hidden rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-white sm:text-base">زورنا في مقرنا</h3>
              <p className="mt-1 text-xs font-semibold leading-7 text-slate-300 sm:text-sm">
                {CONTACT.addressLines[0]}
                <br />
                {CONTACT.addressLines[1]}
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              {/*
                مفيش زرار "تواصل معنا" هنا — العميل اعتمد إن زرار الهيدر فوق
                هو اللي بيفتح فورم التواصل مباشرةً، فشلنا الزرار المكرر ده
                خلاص عشان ما يبقاش فيه مصدرين لنفس المهمة.
              */}
              <a
                href={CONTACT.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-xl border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-slate-200 transition-all duration-300 hover:border-brand-500/40 hover:bg-white/10 sm:w-auto"
              >
                <span className="text-brand-300"><PinIcon className="h-4 w-4" /></span>
                الاتجاهات
              </a>
            </div>
          </div>

          {/* الخريطة التفاعلية بعرض القسم بالكامل */}
          <iframe
            title={`موقع ${COMPANY.name} على خريطة جوجل`}
            src={CONTACT.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full border-0 sm:h-80"
            allowFullScreen
          />
        </div>

        {/*
          سطر الحقوق.
          شلنا جملة "فرص عمل حقيقية مجانًا بالكامل — بدون أي رسوم" بطلب
          العميل، عشان يبقى قادر يضيف رسوم على التقديمات مستقبلًا لو حب،
          من غير ما يبقى فيه وعد صريح بالمجانية مكتوب في الموقع.
        */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="text-[11px] font-semibold text-slate-400 sm:text-xs">
            © {year} {COMPANY.name}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
