"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ABOUT_TEXT, COMPANY } from "@/lib/siteConfig";

/* القيم/المميزات — ثابتة بره الكومبوننت */
const FEATURES = [
  {
    title: "مجاني تماماً",
    desc: "مفيش أي رسوم على الباحثين عن عمل",
    icon: (
      <path d="M12 3v18M5 8h14M5 16h14" />
    ),
  },
  {
    title: "شركات كبرى",
    desc: "تعاقدات مع شركات عالمية في مصر",
    icon: (
      <>
        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-5h6v5" />
      </>
    ),
  },
  {
    title: "بيئة آمنة",
    desc: "ضمان بيئة عمل مستقرة ومحترمة",
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
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
                className="group/feat rounded-2xl border-white/70 bg-white/70 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-300/70 hover:shadow-lg hover:shadow-brand-900/10"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-700/10 text-brand-700 transition-transform duration-300 group-hover/feat:scale-110">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </svg>
                </span>
                <p className="mt-3 text-sm font-extrabold text-brand-900">{item.title}</p>
                <p className="mt-1 text-xs leading-6 text-slate-500 [text-wrap:pretty]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
