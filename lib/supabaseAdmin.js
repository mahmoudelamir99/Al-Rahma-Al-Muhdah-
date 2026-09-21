import { createClient } from "@supabase/supabase-js";

/**
 * عميل Supabase للسيرفر فقط.
 * - بيستخدم Service Role Key (سرّي) — ممنوع يتستورد في أي ملف "use client".
 * - auth: persistSession false لأن مفيش جلسة مستخدم هنا.
 *
 * 🐛 إصلاح حرج (تتبع الطلب):
 * كان بقرأ الرابط من NEXT_PUBLIC_SUPABASE_URL بس، بينما متغيرات تشغيل
 * الموقع بتعرّف الرابط باسم SUPABASE_URL. النتيجة إن getSupabaseAdmin()
 * كانت بتشيل Exception ("إعدادات Supabase ناقصة") وده كان بيتحوّل لرسالة
 * "تعذّر الوصول لطلبك دلوقتي" لكل الناس في صفحة تتبع الطلب.
 * الحل: بنقرأ الرابط من أي من الاسمين (ونسيب الأولوية للـ NEXT_PUBLIC).
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

/**
 * رابط المشروع — بنجرّب الاسمين بالترتيب عشان نشتغل على كل البيئات:
 *   1) NEXT_PUBLIC_SUPABASE_URL (الاسم اللي بيستخدمه المتصفح واللوحة)
 *   2) SUPABASE_URL (الاسم اللي بيستخدمه الـ Server)
 * لازم نكتب process.env.X بالحرف — الـ Build بيستبدلها نصيًا.
 */
function resolveSupabaseUrl() {
  return (
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    normalizeSupabaseUrl(process.env.SUPABASE_URL)
  );
}

let cached = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  // القراءة المباشرة بالحرف ضرورية: Next.js بيستبدل process.env.X نصيًا
  // أثناء الـ Build. لو مرّرنا الكائن لملف تاني بتوصل undefined في الإنتاج.
  const url = resolveSupabaseUrl();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "إعدادات Supabase ناقصة في بيئة الإنتاج: تأكد من وجود NEXT_PUBLIC_SUPABASE_URL (أو SUPABASE_URL) و SUPABASE_SERVICE_ROLE_KEY في إعدادات Vercel ثم اعمل Redeploy."
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

export const APPLICATIONS_TABLE = "job_applications";
export const CONTACT_MESSAGES_TABLE = "contact_messages";
