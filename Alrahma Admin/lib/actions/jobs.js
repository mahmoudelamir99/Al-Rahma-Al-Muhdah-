"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { JOBS_TABLE } from "@/lib/jobs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* ==========================================================================
   كل عمليات الوظائف هنا. بتحقق من الجلسة الأول، وبعدين بتنفّذ بمفتاح الخدمة.
   ========================================================================== */

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "الجلسة انتهت. سجّل دخول تاني." };
  }

  return { ok: true, user };
}

/** تنظيف القيم الجاية من الفورم */
function normalize(input) {
  const toInt = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(String(value).replace(/[^\d-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const text = (value) => {
    const v = String(value ?? "").trim();
    return v === "" ? null : v;
  };

  return {
    title: text(input.title),
    company: text(input.company),
    company_logo: text(input.company_logo),
    company_tone: text(input.company_tone),
    description: text(input.description),
    experience: text(input.experience),
    qualification: text(input.qualification),
    salary_from: toInt(input.salary_from),
    salary_to: toInt(input.salary_to),
    required_count: toInt(input.required_count) ?? 1,
    status: input.status === "closed" ? "closed" : "available",
    location: text(input.location),
    schedule: text(input.schedule),
    employment_type: text(input.employment_type),
  };
}

function validate(data) {
  if (!data.title) return "اسم الوظيفة مطلوب.";
  if (data.title.length > 120) return "اسم الوظيفة طويل جدًا (أقصى 120 حرف).";
  if (data.required_count < 0) return "العدد المطلوب لا يقبل قيمة سالبة.";
  if (data.salary_from !== null && data.salary_to !== null && data.salary_to < data.salary_from) {
    return "الراتب (إلى) لازم يكون أكبر من أو يساوي الراتب (من).";
  }
  return null;
}

/* ---------------------------- إضافة ---------------------------- */
export async function createJob(input) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const data = normalize(input);
  const invalid = validate(data);
  if (invalid) return { ok: false, error: invalid };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(JOBS_TABLE).insert(data);

  if (error) return { ok: false, error: `تعذّرت الإضافة: ${error.message}` };

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard");
  return { ok: true, message: "تمت إضافة الوظيفة بنجاح." };
}

/* ---------------------------- تعديل ---------------------------- */
export async function updateJob(id, input) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!id) return { ok: false, error: "معرّف الوظيفة غير موجود." };

  const data = normalize(input);
  const invalid = validate(data);
  if (invalid) return { ok: false, error: invalid };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(JOBS_TABLE).update(data).eq("id", id);

  if (error) return { ok: false, error: `تعذّر التعديل: ${error.message}` };

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard");
  return { ok: true, message: "تم تعديل الوظيفة بنجاح." };
}

/* ---------------------------- حذف ---------------------------- */
export async function deleteJob(id) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!id) return { ok: false, error: "معرّف الوظيفة غير موجود." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from(JOBS_TABLE).delete().eq("id", id);

  if (error) return { ok: false, error: `تعذّر الحذف: ${error.message}` };

  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard");
  return { ok: true, message: "تم حذف الوظيفة نهائيًا." };
}
