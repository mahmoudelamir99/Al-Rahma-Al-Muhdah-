"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ABOUT_TEXT, COMPANY } from "@/lib/siteConfig";

/*
 * أيقونات المميزات (Realistic / 3D-style)
 * -----------------------------------------
 * العميل طلب نبدل الأيقونات المسطحة (Flat) بأيقونات واقعية ملونة عالية
 * الجودة. بدل ما نحمّل صور PNG خارجية (وزن زيادة + طلبات شبكة + احتمال
 * إن الصورة تبان مكسّرة)، بنرسم الأيقونات بـ SVG متعدد الطبقات:
 *   - gradients خطية (linearGradient) للوضوح والحجم الثلاثي
 *   - طبقات highlight + ظل داخلي عشان الأيقونة تبان بارزة (3D)
 *   - drop-shadow خارجي خفيف يعطيها العمق
 * النتيجة: أيقونة خفيفة (بتتنزّل مع الصفحة نفسها) بس شكلها "بريميوم".
 */

function GradientDefs({ id }) {
  return (
    <defs>
      <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="45%" stopColor="#ffffff" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.12" />
      </linearGradient>
      <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/* أيقونة 1: عملات ذهبية — "مجاني تماماً" */
function Money3DIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-9 w-9 drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]" aria-hidden="true">
      <GradientDefs id="money" />
      <ellipse cx="32" cy="50" rx="20" ry="7" fill="#7c4a03" opacity="0.4" />
      <circle cx="32" cy="42" r="15" fill="#f59e0b" />
      <circle cx="32" cy="42" r="15" fill="url(#money-face)" />
      <circle cx="32" cy="42" r="11" fill="none" stroke="#fff" strokeWidth="1.4" strokeOpacity="0.55" />
      <path d="M32 34v16M28 37.5h6a2.6 2.6 0 0 1 0 5.2h-6M28 42.7h6.5a2.6 2.6 0 0 1 0 5.2H28" fill="none" stroke="#fff8e7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="30" r="15" fill="#fbbf24" />
      <circle cx="32" cy="30" r="15" fill="url(#money-face)" />
      <ellipse cx="26" cy="24" rx="6" ry="3.4" fill="url(#money-gloss)" transform="rotate(-32 26 24)" />
      <circle cx="32" cy="30" r="10.5" fill="none" stroke="#fff" strokeWidth="1.4" strokeOpacity="0.65" />
      <text x="32" y="35" textAnchor="middle" fontSize="13" fontWeight="800" fill="#92400e">$</text>
    </svg>
  );
}

/* أيقونة 2: مبنى شركة زجاجي — "شركات كبرى" */
function Company3DIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-9 w-9 drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]" aria-hidden="true">
      <GradientDefs id="company" />
      <ellipse cx="32" cy="55" rx="23" ry="6" fill="#0f172a" opacity="0.28" />
      <polygon points="14,54 14,22 32,13 50,22 50,54" fill="#1d4ed8" />
      <polygon points="14,54 14,22 32,13 50,22 50,54" fill="url(#company-face)" />
      <polygon points="32,13 32,54 50,54 50,22" fill="#1e3a8a" opacity="0.35" />
      <polygon points="14,22 32,13 32,22 14,30" fill="#3b82f6" />
      <polygon points="50,22 32,13 32,22 50,30" fill="#172554" opacity="0.7" />
      <g fill="#93c5fd">
        <rect x="20" y="28" width="6" height="6" rx="1" />
        <rect x="20" y="38" width="6" height="6" rx="1" />
        <rect x="29" y="28" width="6" height="6" rx="1" />
        <rect x="29" y="38" width="6" height="6" rx="1" />
        <rect x="38" y="28" width="6" height="6" rx="1" opacity="0.85" />
        <rect x="38" y="38" width="6" height="6" rx="1" opacity="0.85" />
      </g>
      <rect x="28" y="46" width="8" height="8" rx="1.4" fill="#fbbf24" />
      <polygon points="14,22 32,13 32,20 14,28" fill="url(#company-gloss)" opacity="0.7" />
    </svg>
  );
}

/* أيقونة 3: درع حماية — "بيئة آمنة" */
function Shield3DIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-9 w-9 drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]" aria-hidden="true">
      <GradientDefs id="shield" />
      <path d="M32 6 52 13v16c0 13-8.5 22-20 27C20 51 12 42 12 29V13Z" fill="#047857" />
      <path d="M32 6 52 13v16c0 13-8.5 22-20 27C20 51 12 42 12 29V13Z" fill="url(#shield-face)" />
      <path d="M32 6 52 13v16c0 13-8.5 22-20 27V6Z" fill="#064e3b" opacity="0.3" />
      <path d="M32 12 46 17v12c0 9.6-6 16.6-14 20.5C24 45.6 18 38.6 18 29V17Z" fill="#10b981" />
      <path d="M32 12 46 17v12c0 9.6-6 16.6-14 20.5C24 45.6 18 38.6 18 29V17Z" fill="url(#shield-face)" opacity="0.8" />
      <path d="m25 31 5 5 9-11" fill="none" stroke="#ffffff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 6 46 11.3 32 16.6Z" fill="url(#shield-gloss)" opacity="0.75" />
    </svg>
  );
}

/* القيم/المميزات — ثابتة بره الكومبوننت */
const FEATURES = [
  {
    title: "مجاني تماماً",
    desc: "مفيش أي رسوم على الباحثين عن عمل",
    icon: <Money3DIcon />,
    glow: "from-amber-400/30 to-amber-600/10",
  },
  {
    title: "شركات كبرى",
    desc: "تعاقدات مع شركات عالمية في مصر",
    icon: <Company3DIcon />,
    glow: "from-blue-400/30 to-blue-700/10",
  },
  {
    title: "بيئة آمنة",
    desc: "ضمان بيئة عمل مستقرة ومحترمة",
    icon: <Shield3DIcon />,
    glow: "from-emerald-400/30 to-emerald-700/10",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-white via-brand-50 to-white py-12 sm:py-16"
    >
      {/* بقع لونية خفيفة تبرز التأثير الزجاجي */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-4 h-56 w-56 rounded-full bg-brand-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 bottom-0 h-48 w-48 rounded-full bg-brand-400/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl border-white/70 bg-white/55 shadow-2xl shadow-brand-950/10 backdrop-blur-xl"
        >
          {/*
            الترتيب مقصود من فوق لتحت (مش جنب لجنب):
              1) شريط اللوجو في وسط القسم
              2) النص التعريفي بعده بعرض كامل
              3) كروت المميزات في الآخر
            قبل كده كان اللوجو والنص في عمودين جنب بعض، فالنص كان بيتحشر في
            عمود ضيق والكلام يتزاحم ويركب على بعضه على شاشة الكمبيوتر. دلوقتي
            كل عنصر واخد عرض القسم كامل، فمفيش أي تزاحم.
          */}
          <div className="flex items-center justify-center bg-brand-950 px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex items-center justify-center rounded-3xl bg-white p-5 shadow-2xl shadow-black/30 sm:p-7">
              <Image
                src="/logo-full.png"
                alt={`${COMPANY.name} — ${COMPANY.tagline}`}
                width={1784}
                height={1255}
                sizes="(max-width: 640px) 200px, 280px"
                className="h-24 w-auto object-contain sm:h-32"
              />
            </div>
          </div>

          {/* نص التعريف — عرض كامل، مركز، ومساحة مريحة للكلام */}
          <div className="mx-auto max-w-3xl px-5 py-7 text-center sm:px-10 sm:py-9">
            <span className="inline-flex items-center gap-2 rounded-full border-brand-200/70 bg-brand-50/80 px-3 py-1 text-[10px] font-bold text-brand-700 sm:text-xs">
              من نحن
            </span>

            <h2 className="text-gradient-brand mt-3 text-xl font-extrabold sm:text-3xl">
              {COMPANY.name}
            </h2>

            <p className="mt-4 text-sm leading-9 text-slate-600 sm:text-base sm:leading-10">
              {ABOUT_TEXT}
            </p>
          </div>

          {/* المميزات — عرض كامل بتقسيمة متساوية */}
          <div className="grid gap-3 border-t border-white/60 bg-white/30 p-5 sm:grid-cols-3 sm:gap-4 sm:p-8">
            {FEATURES.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: 0.1 + index * 0.09 }}
                className="group/feat flex items-start gap-3 rounded-2xl border-white/70 bg-white/70 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/70 hover:shadow-lg hover:shadow-brand-900/10"
              >
                {/*
                  بلوك الأيقونة: برواز زجاجي ملوّن (حسب لون كل ميزة) بيتحط
                  جواه أيقونة الـ 3D. البرواز بيتكهرب (glow) مع الـ hover.
                */}
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.glow} p-1 ring-1 ring-inset ring-white/60 shadow-inner shadow-white/40 transition-transform duration-300 group-hover/feat:scale-110`}
                >
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <p className="text-sm font-extrabold text-brand-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500 [text-wrap:pretty]">{item.desc}</p>
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
