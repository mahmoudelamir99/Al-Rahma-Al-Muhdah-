"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { jobs } from "@/data/jobs";
import { submitApplication } from "@/app/actions/submitApplication";

const initialForm = {
  name: "", phone: "", age: "", gender: "", maritalStatus: "",
  governorate: "", city: "", education: "", specialization: "", militaryStatus: "",
  experienceYears: "", previousCompanies: "", expectedSalary: "", selectedJobId: "",
};

const steps = ["البيانات الأساسية", "السكن والمؤهل", "الخبرة", "تأكيد الوظيفة"];
const requiredByStep = [
  ["name", "phone", "age", "gender", "maritalStatus"],
  ["governorate", "city", "education", "specialization", "militaryStatus"],
  ["experienceYears", "previousCompanies", "expectedSalary"],
  ["selectedJobId"],
];

const options = {
  ages: Array.from({ length: 53 }, (_, index) => String(index + 18)),
  governorates: ["القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الشرقية", "الدقهلية", "المنوفية", "الغربية", "الإسماعيلية", "بورسعيد", "السويس", "أسيوط", "سوهاج", "قنا", "أسوان"],
  education: ["مؤهل عالي", "مؤهل متوسط", "فوق متوسط", "بدون مؤهل"],
  experience: ["بدون خبرة", "أقل من سنة", "1 - 3 سنوات", "3 - 5 سنوات", "أكثر من 5 سنوات"],
  salaries: ["أقل من 6,000 ج.م", "6,000 - 8,000 ج.م", "8,000 - 12,000 ج.م", "12,000 - 20,000 ج.م", "أكثر من 20,000 ج.م"],
};

/* حقول الإدخال: كومبوننتات خارجية ثابتة بره الكومبوننت الأساسي (حل مشكلة Focus Loss) */

const fieldClass = (invalid, disabled) =>
  `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 ${
    invalid ? "border-red-400 bg-red-50/70" : "border-slate-200 hover:border-slate-300"
  } ${disabled ? "cursor-not-allowed bg-slate-50 opacity-60" : ""}`;

function Field({ label, required = true, children }) {
  return (
    <label className="block text-xs font-bold text-slate-700 sm:text-sm">
      {label}{required && <span className="mr-1 text-red-500">*</span>}{children}
    </label>
  );
}

function TextInput({ name, label, form, errors, setField, type = "text", placeholder = "", disabled = false, required = true }) {
  return (
    <Field label={label} required={required}>
      <input
        type={type}
        value={form[name]}
        onChange={(event) => setField(name, event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={fieldClass(errors[name], disabled)}
      />
    </Field>
  );
}

function SelectInput({ name, label, values, form, errors, setField, placeholder = "اختر...", disabled = false, required = true }) {
  return (
    <Field label={label} required={required}>
      <select
        value={form[name]}
        onChange={(event) => setField(name, event.target.value)}
        disabled={disabled}
        className={fieldClass(errors[name], disabled)}
      >
        <option value="">{placeholder}</option>
        {values.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
    </Field>
  );
}

/* خطوات الفورم: كومبوننتات خارجية ثابتة */

function StepBasic({ form, errors, setField, disabled }) {
  const shared = { form, errors, setField, disabled };
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      <TextInput name="name" label="الاسم بالكامل" placeholder="اكتب اسمك بالكامل" {...shared} />
      <TextInput name="phone" label="رقم التليفون" type="tel" placeholder="01xxxxxxxxx" {...shared} />
      <SelectInput name="age" label="السن" values={options.ages} {...shared} />
      <SelectInput name="gender" label="النوع" values={["ذكر", "أنثى"]} {...shared} />
      <SelectInput name="maritalStatus" label="الحالة الاجتماعية" values={["أعزب", "متزوج", "مطلق", "أرمل"]} {...shared} />
    </div>
  );
}

function StepLocation({ form, errors, setField, disabled }) {
  const shared = { form, errors, setField, disabled };
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      <SelectInput name="governorate" label="المحافظة" values={options.governorates} {...shared} />
      <TextInput name="city" label="المدينة" placeholder="اكتب المدينة" {...shared} />
      <SelectInput name="education" label="المؤهل" values={options.education} {...shared} />
      <TextInput name="specialization" label="التخصص" placeholder="مثال: كهرباء / محاسبة" required={false} {...shared} />
      <SelectInput name="militaryStatus" label="الموقف من التجنيد" values={["أدى الخدمة", "إعفاء نهائي", "إعفاء مؤقت", "غير مطلوب"]} {...shared} />
    </div>
  );
}

function StepExperience({ form, errors, setField, disabled }) {
  const shared = { form, errors, setField, disabled };
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      <SelectInput name="experienceYears" label="سنوات الخبرة" values={options.experience} {...shared} />
      <TextInput name="previousCompanies" label="الشركات السابقة" placeholder="اكتب أسماء الشركات" required={false} {...shared} />
      <SelectInput name="expectedSalary" label="أقل مرتب متوقع" values={options.salaries} {...shared} />
    </div>
  );
}

function StepConfirm({ form, errors, setField, job, selectedJob, isFull, disabled }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/80 p-3.5 sm:p-4">
        <p className="text-[10px] font-bold text-brand-600 sm:text-xs">الوظيفة المختارة</p>
        <p className="mt-1 text-base font-extrabold text-brand-900 sm:text-lg">{selectedJob.title}</p>
        <p className="text-xs text-slate-600 sm:text-sm">{selectedJob.company} · {selectedJob.location}</p>
        <p className="mt-2 text-xs leading-6 text-slate-600 sm:text-sm">{selectedJob.description}</p>
      </div>
      {isFull && (
        <SelectInput name="selectedJobId"
            label="العدد اكتمل — اختار وظيفة متاحة"
            required
            values={jobs.filter((item) => item.applicants < item.required).map((item) => `${item.title} — ${item.company} — ${item.location}`)}
            placeholder="اختار تخصصك من الوظائف المتاحة..."
            form={form}
            errors={errors}
            setField={setField}
            disabled={disabled}
          />
      )}
      <p className="text-xs leading-7 text-slate-500 sm:text-sm">راجع بياناتك قبل الإرسال. بتقدر ترجع خطوة للوراء وتعدّل أي حاجة.</p>
    </div>
  );
}

function Stepper({ current }) {
  return (
    <div className="mt-5 flex items-start justify-between gap-1" dir="rtl">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center" dir="ltr">
              <div className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${index > 0 ? (done || active ? "bg-brand-500" : "bg-slate-200") : "bg-transparent"}`} />
              <motion.div
                animate={active ? { scale: 1.12 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ring-2 transition-colors duration-300 sm:h-8 sm:w-8 sm:text-xs ${
                  done
                    ? "bg-brand-500 text-white ring-brand-200"
                    : active
                      ? "bg-brand-600 text-white ring-brand-200 shadow-md shadow-brand-500/30"
                      : "bg-white text-slate-400 ring-slate-200"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : index + 1}
              </motion.div>
              <div className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${index < steps.length - 1 ? (done ? "bg-brand-500" : "bg-slate-200") : "bg-transparent"}`} />
            </div>
            <p className={`w-full truncate text-center text-[9px] font-bold leading-none sm:text-[10px] ${active ? "text-brand-700" : done ? "text-brand-500/80" : "text-slate-400"}`}>
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function ApplyModal({ job, onClose }) {
  const isFull = job.applicants >= job.required;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...initialForm, selectedJobId: isFull ? "" : String(job.id) });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const closeTimer = useRef(null);

  const phoneField = "phone";

  // Loading = إرسال جاري أو Server Action معلّقة
  const isSending = status === "sending" || isPending;

  useEffect(() => {
    const handleKey = (event) => {
      // ممنوع الإغلاق بالـ Escape أثناء الإرسال
      if (event.key === "Escape" && status !== "sending") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, status]);

  // تنظيف التايمر لو المودال اتقفل قبل الـ 3 ثواني
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const selectedJob = useMemo(
    () => (isFull ? jobs.find((item) => item.title === (form.selectedJobId || "").split(" — ")[0]) || job : job),
    [form.selectedJobId, job, isFull]
  );

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: false }));
  };

  const validateStep = () => {
    const nextErrors = {};
    requiredByStep[step].forEach((field) => {
      if (!String(form[field] || "").trim()) nextErrors[field] = true;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((current) => Math.min(current + 1, 3));
  };
  const previousStep = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  };

  /**
   * الإرسال الحقي: بيعمل تحويل بيانات الفورم لشكل الجدول
   * ويبعتها للـ Server Action (السيرفر هو اللي بيكلم Supabase).
   */
  const submit = () => {
    if (isSending) return; // حماية من الدوس مرتين
    if (!validateStep()) return;

    const rateLimitKey = "alrahma:last-application";
    const lastApplication = Number.parseInt(window.localStorage.getItem(rateLimitKey) || "0", 10);
    const remainingSeconds = Math.ceil((60_000 - (Date.now() - lastApplication)) / 1000);
    if (lastApplication && remainingSeconds > 0) {
      setRateLimitMessage(`ممكن تقدم طلب جديد بعد ${remainingSeconds} ثانية.`);
      return;
    }

    setRateLimitMessage("");
    setServerError("");
    setStatus("sending");

    const payload = {
      full_name: form.name,
      phone_number: form[phoneField],
      age: form.age,
      gender: form.gender,
      marital_status: form.maritalStatus,
      governorate: form.governorate,
      city: form.city,
      education_level: form.education,
      specialization: form.specialization,
      military_status: form.militaryStatus,
      experience_years: form.experienceYears,
      previous_companies: form.previousCompanies,
      expected_salary: form.expectedSalary,
      selected_job: isFull ? selectedJob.title : job.title,
    };

    startTransition(async () => {
      const result = await submitApplication(payload);

      if (!result?.ok) {
        setStatus("error");
        setServerError(result?.error || "تعذّر إرسال الطلب، جرّب تاني.");
        if (result?.fieldErrors) setErrors(result.fieldErrors);
        return;
      }

      // نجاح → Form Reset + رسالة نجاح + إغلاق تلقائي بعد 3 ثواني
      window.localStorage.setItem(rateLimitKey, String(Date.now()));
      setForm({ ...initialForm, selectedJobId: isFull ? "" : String(job.id) });
      setErrors({});
      setStatus("success");
      closeTimer.current = setTimeout(() => onClose(), 3000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="نموذج التقديم"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[94vh] w-[95%] max-w-md overflow-y-auto rounded-3xl border border-white/60 bg-white/85 p-4 shadow-2xl shadow-slate-950/25 backdrop-blur-xl sm:max-w-2xl sm:p-7"
      >
        {/* رأس المودال */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-brand-600 sm:text-xs">طلب تسجيل بيانات</p>
            <h3 className="text-lg font-extrabold text-slate-900 sm:text-2xl">التقديم على الوظائف</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 sm:h-9 sm:w-9"
          >
            ×
          </button>
        </div>

        {status === "success" ? (
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center sm:py-14">
            {/* علامة صح بتتحرك مع حلقة خضرا نابضة */}
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
              <motion.span
                aria-hidden="true"
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ scale: [0.8, 1.45, 1.45], opacity: [0.7, 0.25, 0] }}
                transition={{ duration: 1.6, times: [0, 0.6, 1], ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-whatsapp/30"
              />
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp shadow-lg shadow-whatsapp/35 sm:h-20 sm:w-20"
              >
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M4 12.5 9.5 18 20 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.35, ease: "easeInOut" }}
                  />
                </motion.svg>
              </motion.div>
            </div>

            <motion.h4
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.35 }}
              className="mt-5 text-lg font-extrabold text-slate-900 sm:text-2xl"
            >
              تم إرسال بياناتك بنجاح
            </motion.h4>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.35 }}
              className="mx-auto mt-2 max-w-xs text-xs leading-7 text-slate-500 sm:max-w-sm sm:text-sm"
            >
              سنتواصل معك قريباً
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="mt-6"
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500 sm:py-3"
              >
                إغلاق
              </button>
              <p className="mt-3 text-[10px] text-slate-400 sm:text-xs">النافذة هتتقفل تلقائياً خلال 3 ثواني...</p>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <Stepper current={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.22 }}
                className="mt-5 min-h-[220px] sm:mt-6 sm:min-h-[250px]"
              >
                {step === 0 && <StepBasic form={form} errors={errors} setField={setField} disabled={isSending} />}
                {step === 1 && <StepLocation form={form} errors={errors} setField={setField} disabled={isSending} />}
                {step === 2 && <StepExperience form={form} errors={errors} setField={setField} disabled={isSending} />}
                {step === 3 && <StepConfirm form={form} errors={errors} setField={setField} job={job} selectedJob={selectedJob} isFull={isFull} disabled={isSending} />}
              </motion.div>
            </AnimatePresence>

            {/* حماية بسيطة من تكرار الإرسال من نفس المتصفح */}
            <AnimatePresence>
              {rateLimitMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  className="mt-4 rounded-xl border-amber-200 bg-amber-50/90 px-3 py-2.5 text-xs font-semibold leading-6 text-amber-700 sm:text-sm"
                >
                  {rateLimitMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* رسالة خطأ من السيرفر */}
            <AnimatePresence>
              {status === "error" && serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl border-red-200 bg-red-50/90 px-3 py-2.5 text-xs font-semibold leading-6 text-red-700 sm:text-sm"
                >
                  <span aria-hidden="true" className="mt-0.5">⚠</span>
                  <span>{serverError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-4 sm:mt-6 sm:pt-5">
              <button
                type="button"
                onClick={step === 0 ? onClose : previousStep}
                disabled={isSending}
                className="rounded-xl bg-white/70 px-4 py-2.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {step === 0 ? "إلغاء" : "السابق"}
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isSending}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                  التالي
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={isSending}
                  aria-busy={isSending}
                  className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-whatsapp/25 transition hover:bg-whatsapp-dark disabled:cursor-not-allowed disabled:opacity-80 sm:text-sm"
                >
                  {isSending && (
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                  )}
                  {isSending ? "جارٍ الإرسال..." : "تأكيد وإرسال"}
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
