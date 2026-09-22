import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * إعدادات الموقع القادمة من لوحة التحكم (CMS).
 * ---------------------------------------------------------------------------
 * بترجّع: تشغيل/إيقاف أيقونة الواتساب، تشغيل/إيقاف خريطة جوجل،
 * ونص الشروط والأحكام. لو الجدول لسه مش متشغّل بترجّع القيم الافتراضية
 * (كل حاجة مفعّلة) بدل ما تكسر الصفحة.
 */

const SETTINGS_TABLE = "site_settings";

/** القيم الافتراضية — آمنة لو الجدول مش موجود */
export const DEFAULT_SITE_SETTINGS = {
  whatsapp_enabled: true,
  map_enabled: true,
  terms_text: "",
  // قسم المميزات: مفعّل افتراضيًا، والعناوين والنصوص بتقع على الافتراضي في About.jsx
  features_enabled: true,
};

/*
 * 🐛 الإصلاح: قبل كده كنا بنعمل استعلام واحد على **كل** أعمدة الـ CMS
 * (hero_* / about_text / contact_* / social_links). لو أي عمود واحد منها
 * لسه مش موجود في قاعدة البيانات (مثلاً سكربت site-settings.sql ما اتشغّلش
 * بالكامل، أو عمود جديد)، الاستعلام كله بيفشل وSupabase بترجّع خطأ —
 * فكنا بنقع على القيم الافتراضية الفاضية، والنتيجة إن رقم التليفون ووصف
 * "من نحن" وبيانات التواصل اللي الأدمن حفظها **مش بتظهر خالص** في الموقع
 * (لا في الفوتر ولا في قسم التواصل) رغم إنها محفوظة فعلاً.
 *
 * دلوقتي بنحاول بالترتيب: الكامل الأول، ولو فشل بنرجع للأعمدة الأساسية،
 * ولو دي كمان فشلت بنرجع الافتراضي — فالبيانات بتظهر بأي حال.
 */
export async function getSiteSettings() {
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }

  // 1) المحاولة الكاملة (كل أعمدة الـ CMS)
  try {
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select("whatsapp_enabled, map_enabled, terms_text, hero_title, hero_subtitle, hero_video_url, about_text, contact_phones, contact_email, contact_address, social_links, features_enabled, feature_1_title, feature_1_text, feature_2_title, feature_2_text, feature_3_title, feature_3_text")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    return { ...DEFAULT_SITE_SETTINGS, ...(data || {}) };
  } catch {
    // عمود ناقص أو مشكلة مؤقتة → بنكمل للمحاولة الأساسية تحت
  }

  /*
   * 2) الأعمدة الأساسية بس — دي دايمًا موجودة (بيتأسسها سكربت site-settings.sql).
   * البيانات دي هي اللي بتشغّل الواتساب والخريطة والشروط، والباقي (لو ناقص)
   * الموقع بيتعامل معاه كقيمة فاضية وبيقع على الافتراضي في الكومبوننت نفسه.
   */
  try {
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select("whatsapp_enabled, map_enabled, terms_text, about_text, contact_phones, contact_email, contact_address")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    return { ...DEFAULT_SITE_SETTINGS, ...(data || {}) };
  } catch {
    // الجدول نفسه مش موجود أو مشكلة شبكة → الافتراضي (كل حاجة مفعّلة)
    return { ...DEFAULT_SITE_SETTINGS };
  }
}
