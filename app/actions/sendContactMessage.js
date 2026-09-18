"use server";

import { getSupabaseAdmin, CONTACT_MESSAGES_TABLE } from "@/lib/supabaseAdmin";

/* ------------------------------------------------------------------
 * Server Action: استقبال رسالة من فورم "تواصل معنا" وتسجيلها في Supabase
 * ------------------------------------------------------------------
 * - التحقق كله بيحصل على السيرفر (مش بس في الفورم) زي فورم التقديم.
 * - الكتابة بمفتاح الخدمة (Service Role) → مفيش وصول من المتصفح للجدول.
 * - حماية بسيطة ضد الإرسال المتكرر السريع (rate limit في الذاكرة).
 */

const REQUIRED_TEXT = {
  full_name: "الاسم",
  phone_number: "رقم التليفون",
  reason: "سبب التواصل",
  message: "الرسالة",
};

// أقصى طول لكل حقل (حماية من الإدخال العشوائي)
const MAX_LENGTH = {
  full_name: 120,
  phone_number: 20,
  reason: 80,
  message: 1500,
};

const trim = (value) => String(value ?? "").trim();

const recentMessages = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function sendContactMessage(rawPayload) {
  const payload = rawPayload ?? {};
  const errors = {};
  const clean = {};

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

  // رقم التليفون المصري
  const phone = clean.phone_number;
  if (phone && !/^01[0125][0-9]{8}$/.test(phone)) {
    errors.phone_number = "رقم التليفون غير صحيح (مثال: 01012345678)";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "في بيانات ناقصة أو غير صحيحة", fieldErrors: errors };
  }

  // حماية بسيطة ضد الإرسال المتكرر خلال دقيقة
  const rateLimitKey = clean.phone_number;
  const lastSubmission = recentMessages.get(rateLimitKey) ?? 0;
  const elapsed = Date.now() - lastSubmission;
  if (lastSubmission && elapsed < RATE_LIMIT_WINDOW_MS) {
    const remainingSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - elapsed) / 1000);
    return { ok: false, error: `ممكن تبعت رسالة جديدة بعد ${remainingSeconds} ثانية.` };
  }
  recentMessages.set(rateLimitKey, Date.now());

  clean.status = "new";

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(CONTACT_MESSAGES_TABLE)
      .insert(clean)
      .select("id, created_at, status")
      .single();

    if (error) {
      console.error("[sendContactMessage] Supabase error:", error.message);
      return { ok: false, error: "تعذّر إرسال الرسالة، جرّب تاني بعد لحظات." };
    }

    return { ok: true, message: data };
  } catch (err) {
    console.error("[sendContactMessage] unexpected:", err?.message || err);
    return { ok: false, error: "حصل خطأ غير متوقع في السيرفر، جرّب تاني." };
  }
}
