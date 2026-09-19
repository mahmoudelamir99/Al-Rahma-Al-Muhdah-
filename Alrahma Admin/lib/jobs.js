import { getSupabaseAdmin, APPLICATIONS_TABLE } from "@/lib/supabase/admin";

export const JOBS_TABLE = "jobs";

/**
 * كل الوظائف مرتبة بالأحدث.
 * ملاحظة: بنجيب عدد المتقدمين الحقي من جدول الطلبات ونضمّه لكل وظيفة.
 */
export async function listJobs() {
  const supabase = getSupabaseAdmin();

  const { data: jobs, error } = await supabase
    .from(JOBS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // عدد المتقدمين الفعلي لكل وظيفة (من جدول طلبات التوظيف)
  const { data: apps, error: appsError } = await supabase
    .from(APPLICATIONS_TABLE)
    .select("selected_job");

  if (appsError) {
    // لو جدول الطلبات لسه مش متاح، منكسرش الصفحة — نرجّع صفر
    return (jobs || []).map((job) => ({ ...job, applicants: 0, hired: 0 }));
  }

  const counts = new Map();
  for (const row of apps || []) {
    const key = (row.selected_job || "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return (jobs || []).map((job) => ({
    ...job,
    applicants: counts.get((job.title || "").trim()) || 0,
  }));
}

/** إحصائيات سريعة للرئيسية */
export async function getJobsStats() {
  const jobs = await listJobs();

  return {
    total: jobs.length,
    available: jobs.filter((j) => j.status === "available").length,
    closed: jobs.filter((j) => j.status === "closed").length,
    requiredTotal: jobs.reduce((sum, j) => sum + (j.required_count || 0), 0),
    applicantsTotal: jobs.reduce((sum, j) => sum + (j.applicants || 0), 0),
  };
}
