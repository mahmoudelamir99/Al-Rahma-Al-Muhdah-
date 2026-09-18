"use client";

import { motion } from "framer-motion";
import { COMPANY, ABOUT_TEXT } from "@/lib/siteConfig";

export default function Hero() {
  const handleScrollToJobs = () => {
    const jobsSection = document.getElementById("jobs");
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="top" className="relative">
      {/*
        بانر الفيديو بنسبته الطبيعية (16:9) — بنحدد الارتفاع من العرض
        عبر aspect-video، فالفيلم يبان كامل من غير أي قص من فوق أو من تحت.
        في الموبايل الطولي 16:9 بيكون قصير شوية فبنخليه 4:3 لكن برضه عارض
        الفيلم كامل (object-contain) بدل ما نقصه.
      */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-950 sm:aspect-video">
      <div className="absolute inset-x-4 top-5 z-10 text-center sm:top-8">
        <h1 className="text-xl font-extrabold text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
          فرص عمل حقيقية في كبرى الشركات
        </h1>
      </div>

      {/*
        فيديو الخلفية.
        الأربع خصائص دول مش تفاصيل: من غير muted + playsinline الموبايل
        (خصوصاً iOS) هيمنع التشغيل التلقائي ويفتح مشغل ملء الشاشة.
        poster بيمنع الشاشة الفاضية لحد ما الفيديو يجهز.
      */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero-workers.jpg"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain object-center"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
        </video>

      </div>

      <div className="sr-only">
        <p>{`${COMPANY.name} — ${COMPANY.tagline}`}</p>
        <p>{ABOUT_TEXT}</p>
      </div>

      <div className="relative z-10 flex justify-center px-4 py-8 sm:py-10">
        <motion.button
          type="button"
          onClick={handleScrollToJobs}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          whileHover={{
            scale: 1.04,
            transition: { type: "spring", stiffness: 320, damping: 20 },
          }}
          whileTap={{
            scale: 0.97,
            transition: { type: "spring", stiffness: 400, damping: 22 },
          }}
          className="btn-shine btn-pulse group w-full max-w-xs rounded-xl bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-brand-950/30 ring-1 ring-inset ring-white/20 transition-shadow hover:shadow-2xl hover:shadow-brand-600/40 sm:w-auto sm:px-10 sm:text-lg"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            شاهد الوظائف المتاحة
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1 sm:h-5 sm:w-5"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </span>
        </motion.button>
      </div>
    </section>
  );
}
