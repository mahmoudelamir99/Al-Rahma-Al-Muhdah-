"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApplyModal from "./ApplyModal";

const requestedJob = { id: "requested-job", title: "وظيفة من اختيارك", applicants: 0, required: 1 };

export default function RequestJobSection() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section id="request-job" className="relative overflow-hidden bg-slate-950 py-14 sm:py-20">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(245,158,11,.2),transparent_35%),radial-gradient(circle_at_15%_100%,rgba(37,99,235,.28),transparent_40%)]" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="text-xs font-extrabold tracking-wide text-amber-300">فرصتك لسه موجودة</p>
        <h2 className="mt-3 text-xl font-extrabold leading-loose text-white sm:text-3xl">إذا لم تجد الوظيفة المناسبة في الوظائف الموضحة أمامك، نرجو أن تترك بياناتك هنا وسنتواصل معك عند توفر الوظيفة التي ستذكرها.</h2>
        <motion.button type="button" onClick={() => setIsOpen(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-shine mt-7 w-full max-w-sm rounded-xl bg-gradient-to-l from-amber-500 via-yellow-400 to-amber-300 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-xl shadow-amber-500/20 ring-1 ring-white/25 sm:w-auto sm:text-base"><span className="relative z-10">اطلب وظيفتك</span></motion.button>
      </div>
      <AnimatePresence>{isOpen && <ApplyModal job={requestedJob} requestMode onClose={() => setIsOpen(false)} />}</AnimatePresence>
    </section>
  );
}
