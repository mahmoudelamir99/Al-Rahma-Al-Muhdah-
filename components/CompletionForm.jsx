"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { completeApplicationDetails } from "@/app/actions/trackApplication";
import { FORM_FIELDS, READONLY_KEYS, SELECT_OPTIONS, LABELS } from "@/lib/formFields";

/* ==========================================================================
   فورم استكمال البيانات — بيتفتح للمتقدم لما يتطلب منه استكمال
   ---------------------------------------------------------------------------
   المنطق المطلوب بالحرف:
     - الفورم بييجي مليان ببيانات المتقدم القديمة.
     - **كل** الحقول متجمّدة (disabled) وغير قابلة للتعديل.
     - الحقول اللي الـ HR علّم عليها في اللوحة بس هي اللي بتفتح للتعديل.
     - زرار "إعادة إرسال" بيحفظ التعديلات ويرجّع الحالة لـ "قيد المراجعة".

   ملاحظة أمنية: القفل الحقي بيحصل على السيرفر كمان (الـ action بتتحقق
   من الحقول المسموحة) — التجميد في الواجهة للتوضيح بس، مش خط الدفاع الوحيد.
   ========================================================================== */

/** قراءة قيمة الحقل من الطلب المتسجل في القاعدة → حقل الفورم */
function toFormValues(application) {
  const values = {};
  for (const field of FORM_FIELDS) {
    const raw = application?.[field.key];
    let value = raw === null || raw === undefined ? "" : String(raw);

    values[field.key] = value;
  }
  return values;
}

/** حقل واحد — متجمّد أو مفتوح حسب طلب الـ HR */
function CompletionField({ field, value, editable, onChange }) {
  const disabled = !editable;

  const base =
    "mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition " +
    (disabled
      ? "cursor-not-allowed border-slate-200 bg-slate-100 font-semibold text-slate-500"
      : "border-amber-400 bg-white font-semibold text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200");

  const options = SELECT_OPTIONS[field.key];
  const isLongText = field.key === "address" || field.key === "previous_companies";

  /*
   * لو القيمة المخزّنة مش من ضمن الخيارات المتاحة (زي "ليسانس" لو
   * الأدمن شالها من القايمة)، بنضيفها كخيار أول عشان بيانات المتقدم
   * تفضل ظاهرة بدل ما تبان خانة فاضية.
   */
  const allOptions =
    options && value && !options.includes(value) ? [value, ...options] : options;

  return (
    <label className={`block text-xs font-bold sm:text-sm ${disabled ? "text-slate-500" : "text-slate-800"}`}>
      <span className="flex items-center justify-between gap-2">
        <span>{field.label}</span>
        {editable ? (
          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
            مطلوب تعديله
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400">مقفل</span>
        )}
      </span>

      {options ? (
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={base}
          aria-label={field.label}
        >
          <option value="">اختر...</option>
          {allOptions.map((option) => (
            <option key={option} value={option}>
              {field.key === "expected_salary"
                ? `${Number(option).toLocaleString("ar-EG")} ج.م`
                : option}
            </option>
          ))}
        </select>
      ) : isLongText ? (
        <textarea
          rows={2}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={`${base} resize-y`}
          aria-label={field.label}
        />
      ) : (
        <input
          type={field.type === "tel" ? "tel" : field.type === "number" ? "number" : "text"}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={base}
          aria-label={field.label}
        />
      )}
    </label>
  );
}

export default function CompletionForm({ application = {}, credentials = {}, onComplete }) {
  /*
   * الحقول اللي الـ HR طلبها من قاعدة البيانات.
   * بنشيل منها حقول الهوية (الرقم القومي/التليفون/الاسم) — دي مش بتفتح
   * أبداً لأنها مفتاح التحقق بتاع العامل نفسه.
   *
   * حماية: القيمة ممكن ترجع نص مش array (لو العمود postgres اترجع
   * بشكل غير متوقع)، فبنحوّلها بأمان بدل ما نرمي استثناء يكسر الصفحة.
   */
  const requested = (Array.isArray(application?.completion_fields)
    ? application.completion_fields
    : []
  )
    .map((key) => (typeof key === "string" ? key : String(key ?? "")))
    .filter((key) => key && !READONLY_KEYS.has(key));

  const [form, setForm] = useState(() => toFormValues(application));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  /*
   * حماية: الكومبوننت ده بيرسم على العميل بس (بيظهر بعد بحث المستخدم
   * في المودال)، فبنضمن إن القيم الأساسية موجودة قبل أي استخدام.
   * لو حصل أي حال غير متوقع، بنعرض رسالة بدل ما الصفحة كلها تقع.
   */
  if (!application?.id) {
    return (
      <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-600">
        مش قادرين نعرض بيانات الطلب دلوقتي. اقفل النافذة وجرّب تاني.
      </p>
    );
  }

  // لو الـ HR ماختارش ولا حقل، بنفتح الحقول القابلة للتعديل كلها
  // (حالة احتياطية منطقية — بدل ما الفورم يبقى مقفول بالكامل ومش نافع)
  const fallbackAll = requested.length === 0;
  const editableKeys = fallbackAll
    ? FORM_FIELDS.filter((f) => !READONLY_KEYS.has(f.key)).map((f) => f.key)
    : requested;

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (isPending) return;
    setError("");

    // بنبعت الحقول المطلوبة بس، ومعاها قيمها الجديدة
    const details = {};
    for (const key of editableKeys) {
      details[key] = form[key];
    }

    startTransition(async () => {
      const result = await completeApplicationDetails({
        id: application.id,
        phoneNumber: credentials.phoneNumber,
        nationalId: credentials.nationalId,
        details,
      });

      if (!result?.ok) {
        setError(result?.error || "تعذّر إرسال التعديلات، جرّب تاني.");
        return;
      }
      // بنمرّر الطلب المحدّث (لو رجع) عشان شاشة السجل تحدّث الكارت بالقيم الحقيقية
      onComplete?.(result.application);
    });
  }

  const missing = editableKeys.filter((key) => !String(form[key] || "").trim());

  return (
    <div className="mt-4">
      {/* ===== ملاحظات الـ HR — أهم حاجة يشوفها المتقدم ===== */}
      {application.hr_notes && (
        <div className="rounded-2xl border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-extrabold text-amber-900">ملاحظات فريق الموارد البشرية</p>
          <p className="mt-1.5 whitespace-pre-wrap text-sm font-semibold leading-7 text-amber-900">
            {application.hr_notes}
          </p>
        </div>
      )}

      {/* ===== توضيح القفل ===== */}
      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border-brand-200 bg-brand-50 p-3.5">
        <span aria-hidden="true" className="mt-0.5 text-base">🔒</span>
        <p className="text-[13px] font-semibold leading-6 text-brand-900">
          البيانات اللي تحت مقفولة. الحقول المُعلَّمة بـ{" "}
          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800">
            مطلوب تعديله
          </span>{" "}
          بس هي اللي تقدر تعدّلها — عدّلها وبعدين اضغط «إعادة إرسال».
        </p>
      </div>

      {/* ===== الفورم ===== */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {FORM_FIELDS.map((field) => (
          <div key={field.key} className={field.key === "selected_job" ? "sm:col-span-2" : ""}>
            <CompletionField
              field={{ ...field, label: LABELS[field.key] || field.label }}
              value={form[field.key]}
              editable={editableKeys.includes(field.key)}
              onChange={setField}
            />
          </div>
        ))}
      </div>

      {/* ===== خطأ ===== */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="alert"
          className="mt-4 rounded-xl border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-800"
        >
          {error}
        </motion.p>
      )}

      {/* ===== تنبيه حقول ناقصة ===== */}
      {missing.length > 0 && !error && (
        <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600">
          لسه فيه {missing.length} حقل مطلوب فاضي:{" "}
          {missing.map((key) => LABELS[key] || key).join("، ")}
        </p>
      )}

      {/* ===== إعادة الإرسال ===== */}
      <button
        type="button"
        onClick={submit}
        disabled={isPending || missing.length > 0}
        className="mt-5 w-full rounded-xl bg-gradient-to-l from-brand-700 via-brand-600 to-brand-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-950/20 ring-1 ring-inset ring-white/20 transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "جارٍ الإرسال..." : "إعادة إرسال البيانات"}
      </button>

      <p className="mt-2 text-center text-[11px] font-semibold text-slate-500">
        بعد الإرسال هيرجع طلبك لحالة «قيد المراجعة» تلقائياً.
      </p>
    </div>
  );
}
