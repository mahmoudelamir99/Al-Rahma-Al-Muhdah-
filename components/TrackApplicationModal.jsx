"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { jobs } from "@/data/jobs";
import { cancelApplication, trackApplication } from "@/app/actions/trackApplication";
import ErrorBoundary from "@/components/ErrorBoundary";
import CompletionForm from "@/components/CompletionForm";
import ModalPortal from "./ModalPortal";

/* ==========================================================================
   شاشة تتبع الطلب — سجل الطلبات (Applications History)
   --------------------------------------------------------------------------
   كان بيعرض طلب واحد بس؛ دلوقتي بيعرض **كل** طلبات العامل في كروت تحت بعض
   (الأحدث فوق). ده بيمنع اللخبطة لما العامل يقدم على أكتر من وظيفة بنفس
   رقم الموبايل.
   ========================================================================== */

/**
 * إعدادات كل حالة — التسمية + ألوان الكارت.
 * نفس مفاتيح الحالات اللي في قاعدة البيانات واللوحة.
 */
const STATUS_META = {
  pending: {
    label: "قيد المراجعة",
    chip: "bg-sky-50 text-sky-800 ring-sky-200",
    dot: "bg-sky-500",
    card: "border-sky-200 bg-sky-50/40",
    accent: "bg-sky-500",
  },
  reviewed: {
    label: "قيد المراجعة",
    chip: "bg-sky-50 text-sky-800 ring-sky-200",
    dot: "bg-sky-500",
    card: "border-sky-200 bg-sky-50/40",
    accent: "bg-sky-500",
  },
  needs_info: {
    label: "مطلوب استكمال بيانات",
    chip: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    card: "border-amber-300 bg-amber-50/50",
    accent: "bg-amber-500",
  },
  accepted: {
    label: "مقبول",
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50/40",
    accent: "bg-emerald-500",
  },
  rejected: {
    label: "مرفوض",
    chip: "bg-red-50 text-red-800 ring-red-200",
    dot: "bg-red-500",
    card: "border-red-200 bg-red-50/40",
    accent: "bg-red-500",
  },
  cancelled: {
    label: "ملغي",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
    card: "border-slate-200 bg-slate-50/60",
    accent: "bg-slate-400",
  },
};

function statusMeta(value) {
  return STATUS_META[value] || STATUS_META.pending;
}

/** تنسيق التاريخ بالعربي */
function formatDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

/** ترتيب الطلبات تنازلياً (الأحدث أول) — حماية إضافية على الواجهة */
function sortByNewest(list) {
  return [...list].sort((a, b) => {
    const ta = new Date(a?.created_at || 0).getTime();
    const tb = new Date(b?.created_at || 0).getTime();
    return tb - ta;
  });
}

/** كارت طلب واحد في السجل */
function ApplicationCard({ application, onOpenCompletion, onCancel }) {
  const meta = statusMeta(application.status);
  const isRejected = application.status === "rejected";
  const note = application.hr_notes || (isRejected ? application.rejection_reason : "");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-label={`طلب ${application.selected_job}`}
      className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${meta.card}`}
    >
      {/* شريط لون الحالة على الجنب */}
      <span className={`absolute inset-y-0 right-0 w-1.5 ${meta.accent}`} aria-hidden="true" />

      <div className="pr-2.5">
        {/* الوظيفة + شارة الحالة */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-500">الوظيفة</p>
            <h3 className="mt-0.5 break-words text-[15px] font-extrabold text-slate-900">
              {application.selected_job || "—"}
            </h3>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold ring-1 ring-inset ${meta.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
            {meta.label}
          </span>
        </div>

        {/* تاريخ التقديم */}
        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
            <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
            <path d="M8 3v3M16 3v3M3.5 9.5h17" strokeLinecap="round" />
          </svg>
          تاريخ التقديم: {formatDate(application.created_at)}
        </p>

        {/* ملاحظات الـ HR */}
        {note && (
          <div className={`mt-3 rounded-xl border px-3 py-2.5 ${isRejected ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
            <p className={`text-[11.5px] font-extrabold ${isRejected ? "text-red-800" : "text-amber-900"}`}>
              {isRejected ? "سبب الرفض / ملاحظات الـ HR" : "ملاحظات فريق الموارد البشرية"}
            </p>
            <p className={`mt-1 whitespace-pre-wrap text-[13px] font-semibold leading-6 ${isRejected ? "text-red-700" : "text-amber-900"}`}>
              {note}
            </p>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="mt-3.5 flex-wrap gap-2">
          {application.status === "needs_info" && (
            <button
              type="button"
              onClick={() => onOpenCompletion(application)}
              className="rounded-xl bg-gradient-to-l from-amber-500 to-yellow-400 px-4 py-2.5 text-[13px] font-extrabold text-slate-950 shadow-sm shadow-amber-500/30 transition-shadow hover:shadow-md"
            >
              استكمال البيانات
            </button>
          )}

          {isRejected && (
            <button
              type="button"
              onClick={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-700"
            >
              قدم على وظيفة تانية
            </button>
          )}

          {application.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onCancel(application)}
              className="rounded-xl px-3 py-2.5 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50"
            >
              إلغاء الطلب
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function TrackApplicationModal({ onClose }) {
  const [credentials, setCredentials] = useState({ phoneNumber: "", nationalId: "" });
  const [applications, setApplications] = useState(null); // مصفوفة الطلبات بعد البحث
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  /* الطلب اللي العامل بيفتح استكمال بياناته دلوقتي (null = بنعرض السجل) */
  const [completionTarget, setCompletionTarget] = useState(null);

  /* حالة الإلغاء */
  const [cancelStage, setCancelStage] = useState("idle");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const updateCredential = (key, value) =>
    setCredentials((current) => ({ ...current, [key]: value }));

  /** البحث: بيرجّع كل طلبات العامل ويبني السجل */
  function search() {
    startTransition(async () => {
      setError("");
      const result = await trackApplication(credentials);
      if (!result?.ok) {
        setApplications(null);
        setError(result?.error || "تعذّر إيجاد الطلبات، جرّب تاني.");
        return;
      }
      setApplications(sortByNewest(result.applications || []));
      setCompletionTarget(null);
    });
  }

  /** تحديث طلب واحد في المصفوفة من غير إعادة البحث */
  function patchApplication(id, patch) {
    setApplications((current) =>
      (current || []).map((app) => (app.id === id ? { ...app, ...patch } : app))
    );
  }

  /** رجوع من فورم الاستكمال لشاشة الكروت + تحديث الكارت لـ "قيد المراجعة" */
  function handleCompletionDone(updated) {
    if (completionTarget?.id) {
      patchApplication(completionTarget.id, {
        status: "pending",
        completion_fields: [],
        ...(updated || {}),
      });
    }
    setCompletionTarget(null);
  }

  function openCancel(application) {
    setCancelTarget(application);
    setCancelStage("alternatives");
    setError("");
  }

  function closeCancel() {
    setCancelTarget(null);
    setCancelStage("idle");
    setReason("");
  }

  function confirmCancel() {
    if (!cancelTarget) return;
    startTransition(async () => {
      const result = await cancelApplication({
        id: cancelTarget.id,
        ...credentials,
        reason,
      });
      if (!result?.ok) {
        setError(result?.error || "تعذّر إلغاء الطلب، جرّب تاني.");
        return;
      }
      patchApplication(cancelTarget.id, { status: "cancelled" });
      closeCancel();
    });
  }

  const alternatives = useMemo(
    () => jobs.filter((job) => job.applicants < job.required).slice(0, 2),
    []
  );

  const needsInfoCount = (applications || []).filter((a) => a.status === "needs_info").length;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="تتبع طلبك"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-0 left-0 right-0 z-[9999] max-h-[90vh] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:max-w-2xl sm:rounded-2xl sm:p-8 sm:shadow-2xl"
        >
          {/* ================= الترويسة ================= */}
          <div className="flex justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-amber-600">متابعة الطلب</p>
              <h2 className="text-xl font-extrabold text-slate-900">
                {completionTarget ? "استكمال البيانات" : "سجل طلباتك"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 shrink-0 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>

          <ErrorBoundary>
            {/*
             * ================= الحالة 1: لسه مبحثناش =================
             * فورم البحث برقم الموبايل (والرقم القومي اختياري).
             */}
            {applications === null && (
              <div className="mt-6 space-y-4">
                <p className="text-sm leading-7 text-slate-600">
                  اكتب رقم الموبايل اللي قدمت بيه. الرقم القومي اختياري، بس لو كتبته بيساعدنا نلاقي طلباتك أسرع.
                </p>
                <input
                  value={credentials.phoneNumber}
                  onChange={(e) => updateCredential("phoneNumber", e.target.value)}
                  type="tel"
                  placeholder="رقم الموبايل"
                  aria-label="رقم الموبايل"
                  className="w-full rounded-xl border-slate-300 px-3 py-3 text-sm outline-none focus:border-brand-500"
                />
                <input
                  value={credentials.nationalId}
                  onChange={(e) => updateCredential("nationalId", e.target.value)}
                  placeholder="الرقم القومي (14 رقم) — اختياري"
                  aria-label="الرقم القومي"
                  inputMode="numeric"
                  maxLength={14}
                  dir="ltr"
                  className="w-full rounded-xl border-slate-300 px-3 py-3 text-sm outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={search}
                  disabled={isPending}
                  className="w-full rounded-xl bg-gradient-to-l from-amber-500 to-yellow-400 px-4 py-3 text-sm font-extrabold text-slate-950 disabled:opacity-70"
                >
                  {isPending ? "جارٍ البحث..." : "ابحث عن طلباتي"}
                </button>
              </div>
            )}

            {/*
             * ================= الحالة 2: فورم استكمال بيانات =================
             * الفورم المتجمّد — بيفتح بس الحقول اللي الـ HR طلبها.
             */}
            {applications !== null && completionTarget && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setCompletionTarget(null)}
                  className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-brand-700 hover:text-brand-800"
                >
                  <span aria-hidden="true">→</span>
                  رجوع لسجل الطلبات
                </button>
                <CompletionForm
                  application={completionTarget}
                  credentials={credentials}
                  onComplete={handleCompletionDone}
                />
              </div>
            )}

            {/*
             * ================= الحالة 3: سجل الطلبات (كروت) =================
             */}
            {applications !== null && !completionTarget && (
              <div className="mt-5">
                {/* ملخص سريع */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[13px] font-bold text-slate-700">
                    عدد طلباتك: <span className="text-brand-700">{applications.length}</span>
                  </p>
                  {needsInfoCount > 0 && (
                    <p className="rounded-lg bg-amber-100 px-2.5 py-1 text-[12px] font-extrabold text-amber-800">
                      ⚠ فيه {needsInfoCount} طلب محتاج استكمال بيانات
                    </p>
                  )}
                </div>

                {/* الكروت — الأحدث فوق */}
                <div className="mt-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {applications.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onOpenCompletion={setCompletionTarget}
                        onCancel={openCancel}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* بحث من جديد */}
                <button
                  type="button"
                  onClick={() => {
                    setApplications(null);
                    setError("");
                    closeCancel();
                  }}
                  className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-200"
                >
                  بحث برقم تاني
                </button>
              </div>
            )}

            {/* ================= الإلغاء ================= */}
            {cancelTarget && applications !== null && !completionTarget && (
              <div className="mt-4 rounded-2xl border-red-200 bg-red-50/60 p-4">
                {cancelStage === "alternatives" ? (
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">
                      قبل الإلغاء، ممكن الفرص دي تناسبك:
                    </p>
                    <div className="mt-3 grid gap-2">
                      {alternatives.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" })}
                          className="rounded-xl border-brand-100 bg-brand-50 px-3 py-2 text-right text-xs font-bold text-brand-800"
                        >
                          {job.title} — {job.company}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCancelStage("reason")}
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white"
                      >
                        مُصر على الإلغاء
                      </button>
                      <button
                        type="button"
                        onClick={closeCancel}
                        className="rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700"
                      >
                        تراجع
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      سبب الإلغاء (اختياري)
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-1 w-full rounded-xl border-slate-200 p-3 text-sm"
                        rows={2}
                      />
                    </label>
                    <div className="mt-3 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={confirmCancel}
                        disabled={isPending}
                        className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white disabled:opacity-70"
                      >
                        {isPending ? "جارٍ الإلغاء..." : "تأكيد إلغاء الطلب"}
                      </button>
                      <button
                        type="button"
                        onClick={closeCancel}
                        className="rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700"
                      >
                        تراجع
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ================= الأخطاء ================= */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </ErrorBoundary>
        </motion.div>
      </div>
    </ModalPortal>
  );
}
