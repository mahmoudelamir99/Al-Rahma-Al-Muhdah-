import { createClient } from "@supabase/supabase-js";

/**
 * عميل Supabase للسيرفر فقط.
 * - بيستخدم Service Role Key (سرّي) — ممنوع يتستورد في أي ملف "use client".
 * - auth: persistSession false لأن مفيش جلسة مستخدم هنا.
 */
/**
 * ينضّف رابط Supabase من أي سلاش في الآخر ومسافات.
 * الرابط اللي بيتكتب في Vercel بتبقى آخره "/" كتير، وده بيعمل مسار بسلاشين
 * (malformed) ويرجع Invalid API key مع إن المفتاح سليم.
 */
function normalizeSupabaseUrl(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\/+$/, "");
}

let cached = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  // القراءة المباشرة بالحرف ضرورية: Next.js بيستبدل process.env.X نصيًا
  // أثناء الـ Build. لو مرّرنا الكائن لملف تاني بتوصل undefined في الإنتاج.
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "إعدادات Supabase ناقصة في بيئة الإنتاج: تأكد من وجود NEXT_PUBLIC_SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في إعدادات Vercel ثم اعمل Redeploy."
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

export const APPLICATIONS_TABLE = "job_applications";
export const CONTACT_MESSAGES_TABLE = "contact_messages";
