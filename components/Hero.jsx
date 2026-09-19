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

        مفيش poster ومفيش أي خلفية صورة — الموقع بيفتح على الفيديو مباشرة
        زي ما العميل طلب، مفيش أي صورة تظهر قبل الفيديو.
      */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-950 sm:aspect-video">
      {/*
        فيديو الخلفية.
        الخواص دي مش تفاصيل: من غير muted + playsinline الموبايل
        (خصوصاً iOS) هيمنع التشغيل التلقائي ويفتح مشغل ملء الشاشة.
        و preload="auto" عشان الفيديو يبدأ ينزّل مع تحميل الصفحة فوراً.
        مفيش poster — أول فريم من الفيديو هو اللي بيبان على طول.

        الترتيب مقصود: WebM (VP9) الأول لأنه أخف وأسرع، ولو المتصفح مش
        داعمه (Safari القديم مثلاً) بينزل تلقائياً على MP4 كـ Fallback.
        الفيديو من غير صوت أصلاً (اتشال وقت الضغط) فالـ Hero ما بيستهلكش
        صوت ولا بيحتاج أي تحكم.
      */}
      <video
        autoPlay
        playsInline
        muted
        loop
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        className="pointer-events-none absolute inset-0 h-full w-full object-contain object-center"
      >
        {/*
          بنسيب الـ sources تطلع من السيرفر مباشرة (مش عن طريق حالة React
          بعد الـ hydration) عشان الفيديو يبدأ ينزّل فور فتح الصفحة،
          وأول فريم يبان من غير أي تأخير.
        */}
        <source src="/hero-video.webm" type="video/webm" />
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/*
        الدرك أوفرلاي (خفيف): طبقة متدرجة خفيفة فوق الفيديو بتدي لمسة فخامة
        من غير ما تطمس تفاصيل الفيديو. العميل طلب تخفيفها عشان الفيديو ينوّر
        ويبان أوضح، فخليتها تتراوح مابين 20% و35% بالكتير بدل 55-70%.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-950/30 via-brand-950/20 to-brand-950/35"
      />

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
          className="btn-shine btn-pulse group w-full max-w-sm rounded-xl bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 px-6 py-3 text-sm font-extrabold text-white shadow-xl shadow-brand-950/30 ring-1 ring-inset ring-white/20 transition-shadow hover:shadow-2xl hover:shadow-brand-600/40 sm:w-auto sm:px-8 sm:text-base"
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
