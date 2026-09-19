"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sendContactMessage } from "@/app/actions/sendContactMessage";
import ModalPortal from "./ModalPortal";
import { CONTACT } from "@/lib/siteConfig";

/*
 * أسباب التواصل — select عشان البيانات تتنظم في قاعدة البيانات.
 * آخر قيمة "أخرى" بتخلي المستخدم يوضّح في خانة الرسالة.
 */
const REASONS = [
  "الاستفسار عن وظيفة معينة",
  "التقديم على الوظائف المتاحة",
  "استفسار عن شركة أو تعاقد",
  "شكوى أو اقتراح",
  "أخرى",
];

const initialForm = { full_name: "", phone_number: "", reason: "", message: "" };

const fieldClass = (invalid, disabled) =>
  `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 ${invalid ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"
  } ${disabled ? "cursor-not-allowed opacity-60" : ""}`;

/*
 * نفس ستايل مودالات الموقع المعتمد:
 *  - الموبايل: Bottom Sheet بيطلع من تحت (rounded-t-3xl + safe-area).
 *  - الديسكتوب: مودال في وسط الشاشة.
 * بنستخدم ModalPortal عشان المودال يتثبت على حدود الشاشة مهما كان الأب
 * عنده transform/overflow (ده اللي كان بيكسر الـ fixed قبل كده).
 */
export default function ContactModal({ onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const closeTimer = useRef(null);

  const isSending = status === "sending" || isPending;

  useEffect(() => {
    const keydown = (event) => {
      if (event.key === "Escape" && !isSending) onClose();
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      clearTimeout(closeTimer.current);
    };
  }, [isSending, onClose]);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: false }));
  };

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = true;
    if (!form.phone_number.trim()) next.phone_number = true;
    else if (!/^01[0125][0-9]{8}$/.test(form.phone_number.trim())) next.phone_number = true;
    if (!form.reason) next.reason = true;
    if (!form.message.trim()) next.message = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event) => {
    event.preventDefault();
    if (isSending || !validate()) return;
    setStatus("sending");
    setServerError("");
    startTransition(async () => {
      const result = await sendContactMessage(form);
      if (!result?.ok) {
        setStatus("error");
        setServerError(result?.error || "تعذّر إرسال الرسالة، جرّب تاني.");
        return;
      }
      setStatus("success");
      closeTimer.current = window.setTimeout(onClose, 3000);
    });
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        onClick={isSending ? undefined : onClose}
        role="dialog"
        aria-modal="true"
        aria-label="تواصل معنا"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-h-[92vh] overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] sm:max-w-lg sm:rounded-2xl sm:p-8 sm:shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-brand-600">فريق الرحمة المهداة</p>
              <h3 className="text-lg font-extrabold text-slate-900 sm:text-2xl">تواصل معنا</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              disabled={isSending}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
            >
              ×
            </button>
          </div>

          {status === "success" ? (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp text-3xl font-bold text-white">
                ✓
              </div>
              <h4 className="mt-5 text-xl font-extrabold text-slate-900">تم إرسال رسالتك بنجاح</h4>
              <p className="mt-2 text-sm text-slate-500">هنرد عليك في أقرب وقت. شكراً لتواصلك معانا.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block text-xs font-bold text-slate-700 sm:text-sm">
                الاسم
                <span className="mr-1 text-red-500">*</span>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(event) => setField("full_name", event.target.value)}
                  placeholder="اكتب اسمك"
                  disabled={isSending}
                  className={fieldClass(errors.full_name, isSending)}
                />
              </label>

              <label className="block text-xs font-bold text-slate-700 sm:text-sm">
                رقم التليفون
                <span className="mr-1 text-red-500">*</span>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(event) => setField("phone_number", event.target.value)}
                  placeholder="01xxxxxxxxx"
                  disabled={isSending}
                  className={fieldClass(errors.phone_number, isSending)}
                />
              </label>

              <label className="block text-xs font-bold text-slate-700 sm:text-sm">
                سبب التواصل
                <span className="mr-1 text-red-500">*</span>
                <select
                  value={form.reason}
                  onChange={(event) => setField("reason", event.target.value)}
                  disabled={isSending}
                  className={fieldClass(errors.reason, isSending)}
                >
                  <option value="">اختر...</option>
                  {REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-bold text-slate-700 sm:text-sm">
                الرسالة
                <span className="mr-1 text-red-500">*</span>
                <textarea
                  value={form.message}
                  onChange={(event) => setField("message", event.target.value)}
                  placeholder="اكتب رسالتك بالتفصيل..."
                  rows={4}
                  disabled={isSending}
                  className={`${fieldClass(errors.message, isSending)} resize-none`}
                />
              </label>

              <AnimatePresence>
                {status === "error" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    role="alert"
                    className="rounded-xl border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                  >
                    {serverError}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSending}
                className="btn-shine w-full rounded-xl bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-950/20 ring-1 ring-inset ring-white/20 transition-shadow hover:shadow-xl disabled:opacity-60"
              >
                <span className="relative z-10">{isSending ? "جارٍ الإرسال..." : "إرسال الرسالة"}</span>
              </button>

              <p className="text-center text-xs font-semibold text-slate-500">
                أو كلّمنا مباشرة على واتساب: {CONTACT.whatsappNumber}
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </ModalPortal>
  );
}
