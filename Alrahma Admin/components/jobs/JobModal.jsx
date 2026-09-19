"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconClose, IconLoader } from "@/components/icons";

/* خيارات جاهزة لتسريع الإدخال (مع إمكانية الكتابة الحرة) */
const JOB_SUGGESTIONS = [
  "فني كهرباء",
  "مهندس مدني",
  "عامل إنتاج",
  "سائق نقل ثقيل",
  "لحام ارجون",
  "سائق ريتش",
  "عامل مستودع",
  "فني صيانة",
];

const COMPANY_OPTIONS = ["ليوني", "LG", "الرحمة المهداة", "أخرى"];

const EMPTY = {
  title: "",
  company: "",
  company_logo: "",
  company_tone: "bg-brand-600",
  description: "",
  experience: "",
  qualification: "",
  salary_from: "",
  salary_to: "",
  required_count: "1",
  status: "available",
  location: "",
  schedule: "",
  employment_type: "دوام كامل",
};

/**
 * نافذة إضافة/تعديل وظيفة — حقول شاملة.
 * onSave(busy) بترجّع نتيجة { ok, error, message }.
 */
export default function JobModal({ open, job, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const firstFieldRef = useRef(null);

  const isEdit = Boolean(job?.id);

  // نحمّل بيانات الوظيفة عند التعديل، ونصفّر الفورم عند الإضافة
  useEffect(() => {
    if (!open) return;
    if (job) {
      setForm({
        title: job.title ?? "",
        company: job.company ?? "",
        company_logo: job.company_logo ?? "",
        company_tone: job.company_tone ?? "bg-brand-600",
        description: job.description ?? "",
        experience: job.experience ?? "",
        qualification: job.qualification ?? "",
        salary_from: job.salary_from ?? "",
        salary_to: job.salary_to ?? "",
        required_count: String(job.required_count ?? 1),
        status: job.status ?? "available",
        location: job.location ?? "",
        schedule: job.schedule ?? "",
        employment_type: job.employment_type ?? "دوام كامل",
      });
    } else {
      setForm(EMPTY);
    }
    setError("");
    setBusy(false);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [open, job]);

  // قفل بـ Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);

    const result = await onSave(isEdit ? job.id : null, form);

    if (!result?.ok) {
      setError(result?.error || "حصل خطأ غير متوقع.");
      setBusy(false);
      return;
    }
    setBusy(false);
    onClose();
  }

  const label = "mb-1.5 block text-[12.5px] font-bold text-brand-900/75";
  const field =
    "w-full rounded-2xl border-surface-500 bg-white px-3.5 py-2.5 text-[14px] text-brand-900 transition-colors duration-150 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      {/* الخلفية */}
      <div
        className="fixed inset-0 bg-brand-950/30"
        onClick={() => !busy && onClose()}
        aria-hidden="true"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "تعديل وظيفة" : "إضافة وظيفة"}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative z-10 my-auto w-full max-w-3xl rounded-3xl border-white/80 bg-surface-100 shadow-lift"
      >
        {/* الترويسة */}
        <div className="flex items-center justify-between gap-3 border-b border-surface-400 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-[16px] font-extrabold text-brand-900">
              {isEdit ? "تعديل وظيفة" : "إضافة وظيفة جديدة"}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-brand-900/50">
              {isEdit ? "عدّل البيانات ثم اضغط حفظ." : "املأ البيانات ثم اضغط إضافة."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="إغلاق"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-900/60 transition-colors duration-150 hover:bg-surface-300 hover:text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:opacity-50"
          >
            <IconClose className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* الفورم */}
        <form onSubmit={submit} className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* اسم الوظيفة */}
            <div className="sm:col-span-2">
              <label className={label} htmlFor="job-title">
                اسم الوظيفة <span className="text-rose-500">*</span>
              </label>
              <input
                id="job-title"
                ref={firstFieldRef}
                list="job-suggestions"
                value={form.title}
                onChange={set("title")}
                placeholder="اكتب أو اختر من القائمة"
                className={field}
                required
              />
              <datalist id="job-suggestions">
                {JOB_SUGGESTIONS.map((j) => (
                  <option key={j} value={j} />
                ))}
              </datalist>
            </div>

            {/* الشركة */}
            <div>
              <label className={label} htmlFor="job-company">
                الشركة
              </label>
              <input
                id="job-company"
                list="company-options"
                value={form.company}
                onChange={set("company")}
                placeholder="اسم الشركة"
                className={field}
              />
              <datalist id="company-options">
                {COMPANY_OPTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* الموقع */}
            <div>
              <label className={label} htmlFor="job-location">
                المكان
              </label>
              <input
                id="job-location"
                value={form.location}
                onChange={set("location")}
                placeholder="مثال: العاشر من رمضان"
                className={field}
              />
            </div>

            {/* وصف الوظيفة */}
            <div className="sm:col-span-2">
              <label className={label} htmlFor="job-desc">
                وصف الوظيفة
              </label>
              <textarea
                id="job-desc"
                rows={3}
                value={form.description}
                onChange={set("description")}
                placeholder="اكتب وصف مختصر لمهام الوظيفة"
                className={`${field} resize-y`}
              />
            </div>

            {/* المتطلبات */}
            <div>
              <label className={label} htmlFor="job-exp">
                الخبرة المطلوبة
              </label>
              <input
                id="job-exp"
                value={form.experience}
                onChange={set("experience")}
                placeholder="مثال: سنتان على الأقل"
                className={field}
              />
            </div>

            <div>
              <label className={label} htmlFor="job-qual">
                المؤهل المطلوب
              </label>
              <input
                id="job-qual"
                value={form.qualification}
                onChange={set("qualification")}
                placeholder="مثال: دبلوم صنايع"
                className={field}
              />
            </div>

            {/* الراتب */}
            <div>
              <label className={label} htmlFor="job-salary-from">
                الراتب من (ج.م)
              </label>
              <input
                id="job-salary-from"
                type="number"
                min="0"
                inputMode="numeric"
                value={form.salary_from}
                onChange={set("salary_from")}
                placeholder="8000"
                className={field}
              />
            </div>

            <div>
              <label className={label} htmlFor="job-salary-to">
                الراتب إلى (ج.م)
              </label>
              <input
                id="job-salary-to"
                type="number"
                min="0"
                inputMode="numeric"
                value={form.salary_to}
                onChange={set("salary_to")}
                placeholder="10000"
                className={field}
              />
            </div>

            {/* العدد والحالة */}
            <div>
              <label className={label} htmlFor="job-required">
                العدد المطلوب تعيينه <span className="text-rose-500">*</span>
              </label>
              <input
                id="job-required"
                type="number"
                min="0"
                inputMode="numeric"
                value={form.required_count}
                onChange={set("required_count")}
                className={field}
                required
              />
            </div>

            <div>
              <label className={label} htmlFor="job-status">
                حالة الوظيفة
              </label>
              <select
                id="job-status"
                value={form.status}
                onChange={set("status")}
                className={field}
              >
                <option value="available">متاحة</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>

            {/* تفاصيل إضافية */}
            <div>
              <label className={label} htmlFor="job-schedule">
                مواعيد العمل
              </label>
              <input
                id="job-schedule"
                value={form.schedule}
                onChange={set("schedule")}
                placeholder="مثال: 8 ساعات / ورديات"
                className={field}
              />
            </div>

            <div>
              <label className={label} htmlFor="job-type">
                نوع الدوام
              </label>
              <input
                id="job-type"
                value={form.employment_type}
                onChange={set("employment_type")}
                placeholder="دوام كامل"
                className={field}
              />
            </div>
          </div>

          {/* الخطأ */}
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-2xl border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[13px] font-semibold text-rose-700"
            >
              {error}
            </p>
          )}
        </form>

        {/* الأزرار */}
        <div className="flex flex-col-reverse gap-2.5 border-t border-surface-400 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-2xl bg-white px-5 py-2.5 text-[13.5px] font-bold text-brand-900/70 transition-colors duration-150 hover:bg-surface-300 hover:text-brand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-2.5 text-[13.5px] font-bold text-white transition-colors duration-150 hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <>
                <IconLoader className="h-4 w-4 animate-spin" />
                جاري الحفظ…
              </>
            ) : isEdit ? (
              "حفظ التعديلات"
            ) : (
              "إضافة الوظيفة"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
