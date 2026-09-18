import { createClient } from "@supabase/supabase-js";

/**
 * عميل Supabase للسيرفر فقط.
 * - بيستخدم Service Role Key (سرّي) — ممنوع يتستورد في أي ملف "use client".
 * - auth: persistSession false لأن مفيش جلسة مستخدم هنا.
 */
let cached = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "إعدادات Supabase ناقصة: تأكد من وجود SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في ملف .env.local"
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

export const APPLICATIONS_TABLE = "job_applications";
