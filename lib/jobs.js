import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * مصدر بيانات الوظائف للموقع الأساسي.
 * ---------------------------------------------------------------------------
 * قبل كده كانت الوظائف مكتوبة Hardcoded في data/jobs.js. دلوقتي بقت
 * بتتقرأ من جدول `jobs` في Supabase — نفس الجدول اللي لوحة التحكم بتكتب فيه،
 * فأي إضافة أو تعديل أو حذف من اللوحة بيظهر هنا فورًا.
 *
 * ملاحظات تصميم:
 *  - القراءة بتحصل على السيرفر بمفتاح الخدمة (مفيش وصول مباشر من المتصفح).
 *  - بنجيب الوظائف المتاحة بس (status = available) — المغلقة ما تظهرش للزوار.
 *  - عدد المتقدمين الحقي: بنطلبه من جدول الطلبات كـ count لكل وظيفة
 *    (مش نقل صفوف) — نفس أسلوب لوحة التحكم بالظبط.
 *  - الصفحة بتُعاد بناؤها كل 30 ثانية، فأي تعديل يظهر فورًا تقريبًا
 *    من غير أي تحميل إضافي على قاعدة البيانات.
 */

export const JOBS_TABLE = "jobs";

/** شكل الصف القادم من Supabase بعد التحويل لشكل الكروت في الموقع */
function toCard(job, applicants) {
  return {
    id: job.id,
    title: job.title || "",
    company: job.company || "",
    companyLogo: job.company_logo || (job.company || "").slice(0, 3).toUpperCase(),
    companyTone: job.company_tone || "bg-brand-600",
    salary: formatSalary(job.salary_from, job.salary_to),
    location: job.location || "—",
    schedule: job.schedule || "—",
    type: job.employment_type || "دوام كامل",
    required: Number(job.required_count) || 0,
    applicants: Number(applicants) || 0,
    description: job.description || "",
    experience: job.experience || "",
    qualification: job.qualification || "",
  };
}

/** "8,000 - 10,000 ج.م" — نفس الشكل القديم بالظبط */
function formatSalary(from, to) {
  const n = (v) => Number(v).toLocaleString("en-US");
  const hasFrom = from !== null && from !== undefined && from !== "";
  const hasTo = to !== null && to !== undefined && to !== "";
  if (!hasFrom && !hasTo) return "يُحدد لاحقاً";
  if (hasFrom && hasTo) return `${n(from)} - ${n(to)} ج.م`;
  return `${n(hasFrom ? from : to)} ج.م`;
}

/**
 * كل الوظائف المتاحة على الموقع.
 * لو الجدول لسه مش متاح (مثلاً قبل تشغيل supabase/jobs.sql) بترجّع قائمة
 * فاضية بدل ما تكسر الصفحة — والموقع بيعرض رسالة \"مفيش وظائف\" بشكل طبيعي.
 */
export async function getPublicJobs() {
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return [];
  }

  const { data: jobs, error } = await supabase
    .from(JOBS_TABLE)
    .select(
      "id, title, company, company_logo, company_tone, description, experience, qualification, salary_from, salary_to, required_count, location, schedule, employment_type, status, created_at"
    )
    .eq("status", "available")
    .order("created_at", { ascending: false });

  // الجدول لسه مش موجود → الموقع يفضل شغال بقائمة فاضية
  if (error) {
    if (error.code !== "PGRST205" && error.code !== "42P01") {
      console.error("[getPublicJobs]", error.message);
    }
    return [];
  }

  const rows = jobs || [];
  if (rows.length === 0) return [];

  /*
   * عدد المتقدمين الحقي.
   * كنا بنعمل استعلام واحد لكل وظيفة (5 وظائف = 5 رحلات شبكة متوازية)،
   * وده كان بيخلي أول تحميل للصفحة بطيء (6.6 ثانية في القياس الفعلي).
   * الأسرع والأبسط إننا نجيب عمود `selected_job` مرة واحدة ونعدّ في الذاكرة:
   * بارامتر واحح بدل 5، وأسرع من ناحية الشبكة. العمود ده بيحمل اسم الوظيفة
   * فقط (نص صغير)، فحجم النقل مشكلة زي ما كان في جدول الطلبات الكامل
   * في لوحة التحكم (اللي بيجرّب كل الأعمدة).
   */
  const counts = new Map();
  try {
    const { data: apps, error: appsError } = await supabase
      .from("job_applications")
      .select("selected_job");

    if (!appsError) {
      for (const row of apps || []) {
        const key = (row.selected_job || "").trim();
        if (key) counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
  } catch {
    // جدول الطلبات مش متاح → الأعداد تفضل صفر من غير ما نكسر الصفحة
  }

  return rows.map((job) => toCard(job, counts.get((job.title || "").trim()) || 0));
}
