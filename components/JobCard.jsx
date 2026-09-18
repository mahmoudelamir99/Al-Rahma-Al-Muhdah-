"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

/**
 * هل الجهاز ده ماوس/تراك پاد حقي؟
 *
 * السبب: تأثير الـ 3D Tilt بيعتمد على mousemove، وعلى شاشات التاتش مفيش
 * hover حقي فبيرد بحركة غريبة ويستهلك معالج على الفاضي. كمان لما النسخة
 * اللي على السيرفر (SSR) تختلف عن العميل، React بيعمل hydration mismatch،
 * فبنبدأ بـ false وبعدين نقيسها بعد التركيب.
 */

const MAX_TILT = 7; // درجات — خفيف جداً، أكتر من كده يبان رخيص
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function Icon({ name }) {
  const paths = {
    money: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 6v2m12-2v2M6 16v2m12-2v2" /></>,
    location: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  };
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">{paths[name]}</svg>;
}

export default function JobCard({ job, onApply }) {
  const isFull = job.applicants >= job.required;
  const progress = Math.min((job.applicants / job.required) * 100, 100);

  const cardRef = useRef(null);
  const canTilt = useRef(false);

  // قيم الميل — Spring عشان الحركة تبقى ناعمة ومترددة شوية
  const rotateX = useSpring(0, { stiffness: 220, damping: 24, mass: 0.4 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 24, mass: 0.4 });

  // موضع الإضاءة (الـ glow) بنسبة مئوية
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowBackground = useMotionTemplate`radial-gradient(240px circle at ${glowX}% ${glowY}%, rgba(96,165,250,0.28), rgba(37,99,235,0.10) 45%, transparent 72%)`;

  /** نقيس قدرة الجهاز مرة واحدة (عند أول تفاعل) — من غير useEffect */
  const ensureCapability = () => {
    if (canTilt.current) return true;
    const ok =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    canTilt.current = ok;
    return ok;
  };

  const handlePointerMove = (event) => {
    // ماوس حقي بس — التاتش يستبعد تماماً (أداء الموبايل)
    if (event.pointerType !== "mouse" || !ensureCapability()) return;
    const node = cardRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    rotateY.set((px - 0.5) * 2 * MAX_TILT);
    rotateX.set((0.5 - py) * 2 * MAX_TILT);

    glowX.set(px * 100);
    glowY.set(py * 100);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  return (
    <motion.article
      ref={cardRef}
      variants={cardVariants}
      whileHover={{ y: isFull ? -2 : -6, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      whileTap={{ scale: 0.985, transition: { type: "spring", stiffness: 400, damping: 22 } }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`glass-card card-glow group relative flex h-full flex-col rounded-2xl p-5 shadow-sm shadow-brand-950/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-brand-900/10 sm:p-6 ${isFull ? "opacity-70 grayscale-[0.15]" : ""}`}
      data-status={isFull ? "full" : "available"}
    >
      {/*
        إضاءة تتبع الماوس جوه الكارت — على الأجهزة اللي فيها ماوس بس
        (hidden md:block) عشان الموبايل ميشيلش طبقة أو شغل زيادة.
      */}
      <motion.span
        aria-hidden="true"
        style={{ background: glowBackground }}
        className="pointer-events-none absolute inset-0 hidden rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block"
      />

      <span className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-l from-brand-400 to-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[10px] font-black tracking-tight text-white shadow-md ${job.companyTone}`} aria-label={`لوجو ${job.company}`}>
          {job.companyLogo}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{job.company}</p>
          <h3 className="text-base font-extrabold leading-relaxed text-brand-900 sm:text-lg">{job.title}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">{job.description}</p>

      <div className="mt-5 grid-cols-1 gap-2.5 text-xs text-slate-700 sm:grid-cols-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/50 px-2.5 py-2 font-semibold"><Icon name="money" />{job.salary}</span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/50 px-2.5 py-2"><Icon name="location" />{job.location}</span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/50 px-2.5 py-2"><Icon name="clock" />{job.schedule}</span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">
          <span>مطلوب: {job.required}</span>
          <span>المتقدمين: {job.applicants}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/60" role="progressbar" aria-valuenow={job.applicants} aria-valuemin="0" aria-valuemax={job.required} aria-label={`نسبة اكتمال ${job.title}`}>
          <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} className={`h-full rounded-full ${isFull ? "bg-slate-500" : "bg-gradient-to-l from-brand-400 to-brand-600"}`} />
        </div>
      </div>

      <motion.button
        type="button"
        onClick={() => onApply(job)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className={`group/apply relative mt-5 w-full max-w-md overflow-hidden rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-colors ${isFull ? "bg-slate-500 text-white hover:bg-slate-600" : "bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 text-white shadow-brand-900/20 hover:shadow-lg hover:shadow-brand-600/40"}`}
      >
        <span className="relative z-10">
          {isFull ? "العدد اكتمل - سجل في تخصص آخر" : "التفاصيل والتقديم"}
        </span>

        {/* لمعة بتعدّي على الزرار عند الـ hover — ماوس بس */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 hidden w-1/3 skew-x-[-22deg] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover/apply:translate-x-[420%] md:block"
        />
      </motion.button>
    </motion.article>
  );
}
