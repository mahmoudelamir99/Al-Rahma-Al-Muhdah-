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
};

export async function getSiteSettings() {
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }

  try {
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select("whatsapp_enabled, map_enabled, terms_text, hero_title, hero_subtitle, hero_video_url, about_text, contact_phones, contact_email, contact_address, social_links")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    return { ...DEFAULT_SITE_SETTINGS, ...(data || {}) };
  } catch {
    // الجدول مش متشغّل أو مشكلة شبكة → الافتراضي (كل حاجة مفعّلة)
    return { ...DEFAULT_SITE_SETTINGS };
  }
}
