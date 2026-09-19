"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitApplication } from "@/app/actions/submitApplication";
import ModalPortal from "./ModalPortal";

const governorates = ["القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج"];
const options = {
  ages: Array.from({ length: 53 }, (_, i) => String(i + 18)),
  salaries: Array.from({ length: 14 }, (_, i) => String((i + 1) * 5000)),
  education: ["بدون مؤهل", "طالب", "ابتدائي", "إعدادية", "ثانوية", "دبلوم", "معهد", "ليسانس", "بكالوريوس", "ماجستير", "دكتوراه"],
  experience: ["بدون خبرة", "أقل من سنة", "1 - 3 سنوات", "3 - 5 سنوات", "أكثر من 5 سنوات"],
};
const stepLabels = ["البيانات الأساسية", "السكن والمؤهل", "الخبرة", "الوظيفة"];

/*
 * قائمة الوظائف المتاحة في خطوة (الوظيفة).
 * الخيار الأخير (غير ذلك) هو المفتاح اللي بيفتح خانة إدخال نصية إجبارية
 * المستخدم يكتب فيها وظيفته بإيده — القيمة دي ثابتة ومربوطة بالمنطق تحت.
 */
const CUSTOM_JOB_OPTION = "غير ذلك";
const jobOptions = [
  "جنايني",
  "سائق ريتش",
  "سائق كلارك",
  "سباك",
  "عامل",
  "فني بنش",
  "فني تجميع او تركيبات او ميكانيكا",
  "فني تكييف",
  "فني تنايه",
  "فني صيانه كهربائيه",
  "فني صيانه هيدروليكية",
  "فني كواليتي كونترول",
  "فني كواليتي ميكانيكا",
  "فني كهرباء سلسيون",
  "فني كهرباء كونترول",
  "فني مقص",
  "لحام ارجون",
  "لحام كهرباء",
  "محاسب",
  "مسئول سلامه وصحه مهنيه سيفتي",
  "مهندس",
  "نجار",
  "نقاش",
  CUSTOM_JOB_OPTION,
];

// نص الـ Placeholder لخانة الوظيفة الحرة (لما يختار "غير ذلك")
const CUSTOM_JOB_PLACEHOLDER = "اكتب الوظيفة التي تريدها";

const initialForm = { name: "", phone: "", nationalId: "", age: "", gender: "", maritalStatus: "", governorate: "", city: "", education: "", specialization: "", militaryStatus: "", experienceYears: "", previousCompanies: "", expectedSalary: "", selectedJob: "", customJob: "" };
const fieldClass = (invalid, disabled) => `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 ${invalid ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`;

function Field({ label, children }) { return <label className="block text-xs font-bold text-slate-700 sm:text-sm">{label}<span className="mr-1 text-red-500">*</span>{children}</label>; }
function TextInput({ name, label, form, errors, setField, type = "text", placeholder, disabled }) { return <Field label={label}><input name={name} type={type} value={form[name]} onChange={(e) => setField(name, e.target.value)} placeholder={placeholder} disabled={disabled} className={fieldClass(errors[name], disabled)} /></Field>; }
function SelectInput({ name, label, values, form, errors, setField, disabled, formatter = (value) => value }) { return <Field label={label}><select name={name} value={form[name]} onChange={(e) => setField(name, e.target.value)} disabled={disabled} className={fieldClass(errors[name], disabled)}><option value="">اختر...</option>{values.map((value) => <option key={value} value={value}>{formatter(value)}</option>)}</select></Field>; }
function Stepper({ current }) { return <div className="mt-5 grid grid-cols-4 gap-1">{stepLabels.map((label, index) => <div key={label} className="min-w-0 text-center"><div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ring-2 ${index < current ? "bg-brand-500 text-white ring-brand-200" : index === current ? "bg-brand-700 text-white ring-brand-200" : "bg-white text-slate-400 ring-slate-200"}`}>{index < current ? "✓" : index + 1}</div><p className={`mt-1 truncate text-[9px] font-bold sm:text-[10px] ${index === current ? "text-brand-700" : "text-slate-400"}`}>{label}</p></div>)}</div>; }

export default function ApplyModal({ job, requestMode = false, onClose }) {
  const isCustomRequest = requestMode || job.applicants >= job.required;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...initialForm, selectedJob: isCustomRequest ? "" : job.title });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();
  const closeTimer = useRef(null);
  const isSending = status === "sending" || isPending;
  useEffect(() => { const keydown = (event) => { if (event.key === "Escape" && !isSending) onClose(); }; document.addEventListener("keydown", keydown); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", keydown); document.body.style.overflow = ""; clearTimeout(closeTimer.current); }; }, [isSending, onClose]);
  const setField = (name, value) => { setForm((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: false })); };
  // في خطوة الوظيفة: الوظيفة إجبارية، وكمان لو "غير ذلك" فالحقل النصي إجباري.
  const step3Required = isCustomRequest
    ? (form.selectedJob === CUSTOM_JOB_OPTION ? ["selectedJob", "customJob"] : ["selectedJob"])
    : [];
  const requiredFields = [["name", "phone", "nationalId", "age", "gender", "maritalStatus"], ["governorate", "city", "education", "specialization", "militaryStatus"], ["experienceYears", "previousCompanies", "expectedSalary"], step3Required];
  const validate = () => { const next = {}; requiredFields[step].forEach((field) => { if (!String(form[field] || "").trim()) next[field] = true; }); if (step === 0 && form.nationalId && !/^\d{14}$/.test(form.nationalId)) next.nationalId = true; setErrors(next); return Object.keys(next).length === 0; };
  const next = () => { if (validate()) setStep((current) => Math.min(current + 1, 3)); };
  // لو اختار "غير ذلك" بنبعت الوظيفة اللي كتبها بإيده، وإلا القيمة المختارة من القائمة.
  const resolvedJob = form.selectedJob === CUSTOM_JOB_OPTION ? form.customJob.trim() : form.selectedJob;
  const submit = () => { if (isSending || !validate()) return; setStatus("sending"); setServerError(""); startTransition(async () => { const result = await submitApplication({ full_name: form.name, phone_number: form.phone, national_id: form.nationalId, age: form.age, gender: form.gender, marital_status: form.maritalStatus, governorate: form.governorate, city: form.city, education_level: form.education, specialization: form.specialization, military_status: form.militaryStatus, experience_years: form.experienceYears, previous_companies: form.previousCompanies, expected_salary: form.expectedSalary, selected_job: resolvedJob }); if (!result?.ok) { setStatus("error"); setServerError(result?.error || "تعذّر إرسال الطلب، جرّب تاني."); return; } setStatus("success"); closeTimer.current = window.setTimeout(onClose, 3000); }); };

  return <ModalPortal><div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose} role="dialog" aria-modal="true" aria-label="نموذج التقديم"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .22 }} onClick={(event) => event.stopPropagation()} className="fixed bottom-0 left-0 right-0 z-[9999] w-full max-h-[90vh] overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:max-w-2xl sm:rounded-2xl sm:p-8 sm:shadow-2xl">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold text-brand-600">طلب تسجيل بيانات</p><h3 className="text-lg font-extrabold text-slate-900 sm:text-2xl">{isCustomRequest ? "اطلب وظيفتك" : "التقديم على الوظيفة"}</h3></div><button type="button" onClick={onClose} aria-label="إغلاق" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">×</button></div>
    {status === "success" ? <div className="py-10 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp text-3xl font-bold text-white">✓</div><h4 className="mt-5 text-xl font-extrabold text-slate-900">تم إرسال بياناتك بنجاح</h4><p className="mt-2 text-sm text-slate-500">سنتواصل معك قريباً.</p></div> : <><Stepper current={step} /><div className="mt-5 sm:mt-6 sm:min-h-[245px]">
      {step === 0 && <div className="grid gap-3 sm:grid-cols-2 sm:gap-4"><TextInput name="name" label="الاسم بالكامل" form={form} errors={errors} setField={setField} placeholder="اكتب اسمك بالكامل" disabled={isSending} /><TextInput name="phone" label="رقم التليفون" type="tel" form={form} errors={errors} setField={setField} placeholder="01xxxxxxxxx" disabled={isSending} /><div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold leading-6 text-red-700">رقمك القومي يُستخدم فقط لتتبع طلبك ولضمان سرية وخصوصية بياناتك، ولا يتم مشاركته مع أي جهة.</div><TextInput name="nationalId" label="الرقم القومي" form={form} errors={errors} setField={setField} placeholder="14 رقم" disabled={isSending} /><SelectInput name="age" label="السن" values={options.ages} form={form} errors={errors} setField={setField} disabled={isSending} /><SelectInput name="gender" label="النوع" values={["ذكر", "أنثى"]} form={form} errors={errors} setField={setField} disabled={isSending} /><SelectInput name="maritalStatus" label="الحالة الاجتماعية" values={["أعزب", "متزوج", "أرمل"]} form={form} errors={errors} setField={setField} disabled={isSending} /></div>}
      {step === 1 && <div className="grid gap-3 sm:grid-cols-2 sm:gap-4"><SelectInput name="governorate" label="المحافظة" values={governorates} form={form} errors={errors} setField={setField} disabled={isSending} /><TextInput name="city" label="المدينة" form={form} errors={errors} setField={setField} placeholder="اكتب المدينة" disabled={isSending} /><SelectInput name="education" label="المؤهل" values={options.education} form={form} errors={errors} setField={setField} disabled={isSending} /><TextInput name="specialization" label="التخصص" form={form} errors={errors} setField={setField} placeholder="مثال: تجارة، حقوق، آداب، صنايع" disabled={isSending} /><SelectInput name="militaryStatus" label="الموقف من التجنيد" values={["مؤدي الخدمة", "إعفاء", "مؤجل", "غير مطلوب"]} form={form} errors={errors} setField={setField} disabled={isSending} /></div>}
      {step === 2 && <div className="grid gap-3 sm:grid-cols-2 sm:gap-4"><SelectInput name="experienceYears" label="سنوات الخبرة" values={options.experience} form={form} errors={errors} setField={setField} disabled={isSending} /><TextInput name="previousCompanies" label="الشركات السابقة" form={form} errors={errors} setField={setField} placeholder="اكتب أسماء الشركات" disabled={isSending} /><SelectInput name="expectedSalary" label="أقل مرتب متوقع" values={options.salaries} formatter={(value) => `${Number(value).toLocaleString("ar-EG")} ج.م`} form={form} errors={errors} setField={setField} disabled={isSending} /></div>}
      {step === 3 && <div className="space-y-4"><div className="rounded-2xl border border-brand-100 bg-brand-50 p-4"><p className="text-xs font-bold text-brand-600">الوظيفة المطلوبة</p>{isCustomRequest ? (<><SelectInput name="selectedJob" label="اختر الوظيفة" values={jobOptions} form={form} errors={errors} setField={setField} disabled={isSending} />{form.selectedJob === CUSTOM_JOB_OPTION && <TextInput name="customJob" label="اكتب الوظيفة التي تريدها" form={form} errors={errors} setField={setField} placeholder={CUSTOM_JOB_PLACEHOLDER} disabled={isSending} />}</>) : (<p className="mt-1 text-lg font-extrabold text-brand-900">{job.title}</p>)}</div><p className="text-xs leading-7 text-slate-500">راجع بياناتك قبل الإرسال. بياناتك محفوظة بسرية تامة.</p></div>}
    </div><AnimatePresence>{status === "error" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{serverError}</motion.p>}</AnimatePresence><div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4"><button type="button" onClick={step === 0 ? onClose : () => setStep((current) => current - 1)} disabled={isSending} className="w-full max-w-sm rounded-xl bg-slate-100 px-6 py-3 text-xs font-bold text-slate-600">{step === 0 ? "إلغاء" : "السابق"}</button>{step < 3 ? <button type="button" onClick={next} disabled={isSending} className="w-full max-w-sm rounded-xl bg-brand-600 px-6 py-3 text-xs font-bold text-white">التالي</button> : <button type="button" onClick={submit} disabled={isSending} className="w-full max-w-sm rounded-xl bg-whatsapp px-6 py-3 text-xs font-bold text-white">{isSending ? "جارٍ الإرسال..." : "تأكيد وإرسال"}</button>}</div></>}
  </motion.div></div></ModalPortal>;
}
