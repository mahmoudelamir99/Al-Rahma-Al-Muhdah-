"use server";

import { getSupabaseAdmin, APPLICATIONS_TABLE } from "@/lib/supabaseAdmin";

/* ---------- التحقق من صحة الداتا على السيرفر (مش بس في الفورم) ---------- */

const REQUIRED_TEXT = {
  full_name: "الاسم بالكامل",
  phone_number: "رقم التليفون",
  gender: "النوع",
  marital_status: "الحالة الاجتماعية",
  governorate: "المحافظة",
  city: "المدينة",
  education_level: "المؤهل",
  military_status: "الموقف من التجنيد",
  experience_years: "سنوات الخبرة",
  expected_salary: "أقل مرتب متوقع",
  selected_job: "الوظيفة المختارة",
};

// الحقول الاختيارية (nullable) — بتتحول لـ null لو فاضية
const OPTIONAL_TEXT = {
  specialization: "التخصص",
  previous_companies: "الشركات السابقة",
};

// أقصى طول لكل حقل نصي (حماية من الإدخال العشوائي)
const MAX_LENGTH = {
  full_name: 120,
  phone_number: 20,
  city: 80,
  specialization: 120,
  previous_companies: 300,
  selected_job: 150,
};

const trim = (value) => String(value ?? "").trim();
const recentApplications = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function submitApplication(rawPayload) {
  const payload = rawPayload ?? {};
  const errors = {};
  const clean = {};

  // 1) الحقول النصية الإلزامية
  Object.entries(REQUIRED_TEXT).forEach(([field, label]) => {
    const value = trim(payload[field]);
    if (!value) {
      errors[field] = `${label} مطلوب`;
      return;
    }
    const max = MAX_LENGTH[field];
    if (max && value.length > max) {
      errors[field] = `${label} أطول من المسموح (${max} حرف)`;
      return;
    }
    clean[field] = value;
  });

  // 2) الحقول الاختيارية → null لو فاضية
  Object.entries(OPTIONAL_TEXT).forEach(([field, label]) => {
    const value = trim(payload[field]);
    if (!value) {
      clean[field] = null;
      return;
    }
    const max = MAX_LENGTH[field];
    if (max && value.length > max) {
      errors[field] = `${label} أطول من المسموح (${max} حرف)`;
      return;
    }
    clean[field] = value;
  });

  // 3) السن: رقم صحيح في النطاق
  const age = Number.parseInt(payload.age, 10);
  if (!Number.isInteger(age) || Number.isNaN(age)) {
    errors.age = "السن مطلوب";
  } else if (age < 18 || age > 70) {
    errors.age = "السن لازم يكون بين 18 و 70 سنة";
  } else {
    clean.age = age;
  }

  // 4) رقم التليفون المصري
  const phone = clean.phone_number;
  if (phone && !/^01[0125][0-9]{8}$/.test(phone)) {
    errors.phone_number = "رقم التليفون غير صحيح (مثال: 01012345678)";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "في بيانات ناقصة أو غير صحيحة", fieldErrors: errors };
  }

  // حماية بسيطة إضافية على السيرفر ضد تكرار نفس الرقم خلال دقيقة.
  const rateLimitKey = clean.phone_number;
  const lastSubmission = recentApplications.get(rateLimitKey) ?? 0;
  const elapsed = Date.now() - lastSubmission;
  if (lastSubmission && elapsed < RATE_LIMIT_WINDOW_MS) {
    const remainingSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000);
    return { ok: false, error: `ممكن تقديم طلب جديد بعد ${remainingSeconds} ثانية.` };
  }
  recentApplications.set(rateLimitKey, Date.now());

  // 5) الحالة الافتراضية
  clean.status = "pending";

  // 6) الكتابة في Supabase من السيرفر (Service Role)
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(APPLICATIONS_TABLE)
      .insert(clean)
      .select("id, created_at, selected_job, status")
      .single();

    if (error) {
      console.error("[submitApplication] Supabase error:", error.message);
      return { ok: false, error: "تعذّر حفظ الطلب، جرّب تاني بعد لحظات." };
    }

    return { ok: true, application: data };
  } catch (err) {
    console.error("[submitApplication] unexpected:", err?.message || err);
    return { ok: false, error: "حصل خطأ غير متوقع في السيرفر، جرّب تاني." };
  }
}
