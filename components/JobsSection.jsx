"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JobCard from "./JobCard";
import ApplyModal from "./ApplyModal";
import { jobs } from "@/data/jobs";

// إعداد stagger: كل كارت يظهر بعد اللي قبله
const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

export default function JobsSection() {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <section
      id="jobs"
      className="mesh-bg relative scroll-mt-16 overflow-hidden py-14 sm:py-20"
    >
      {/*
        طبقة تبييض خفيفة فوق الـ mesh عشان الكروت الزجاجية تنطق
        ومحتوى الكروت يتقرا بسهولة — الـ mesh لوحده غامق شوية.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/72 via-white/62 to-white/78"
      />

      {/* بقع لونية يتجلى عليها التأثير الزجاجي للكروت */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-gradient-brand text-xl font-extrabold sm:text-3xl">
            الوظائف المتاحة
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            فرص عمل مجانية تماماً بالشركات العالمية الموجودة في مصر
          </p>
        </motion.div>

        {/* شبكة الكروت - ملائمة للموبايل (عمود واحد) */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {jobs.map((job, index) => (
            <JobCard
              key={job.id}
              job={job}
              index={index}
              onApply={setSelectedJob}
            />
          ))}
        </motion.div>
      </div>

      {/* المودال - SPA بدون صفحة جديدة */}
      <AnimatePresence>
        {selectedJob && (
          <ApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
