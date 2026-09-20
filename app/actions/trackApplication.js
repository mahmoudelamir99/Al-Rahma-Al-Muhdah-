"use server";

import { getSupabaseAdmin, APPLICATIONS_TABLE } from "@/lib/supabaseAdmin";
import { ALLOWED_COMPLETION_KEYS } from "@/lib/formFields";

const normalize = (value) => String(value ?? "").trim();

/*
 * الحقول المسموح للعامل يحدّثها عبر "إعادة الإرسال".
 * ---------------------------------------------------------------------------
 * بقى مسموح كل حقول الفورم بما فيها "الرقم القومي" و"الاسم" — لأن الـ HR
 * لما يطلب استكمال الرقم القومي (حالة الطلب القديم الناقص)، لازم العامل
 * يقدر يكتبه فعلاً ويرسله. "رقم التليفون" الوحيد المستبعد لأنه مفتاح
 * التحقق الأساسي وممنوع على العامل يغيّره (الـ HR يعدّله يدوياً لو محتاج).
 */
const allowedCompletionFields = new Set(
  [...ALLOWED_COMPLETION_KEYS].filter((k) => k !== "phone_number")
);

/** رقم موبايل مصري */
const PHONE_REGEX = /^01[0125][0-9]{8}$/;
/** رقم قومي مصري = 14 رقم بالظبط */
const NATIONAL_ID_REGEX = /^\d{14}$/;

/**
 * الموبايل هو مفتاح التحقق الأساسي ودايماً مطلوب وصحيح.
 * ---------------------------------------------------------------------------
 * الرقم القومي بقى **اختياري** في البحث والتحقق: لأن في طلبات قديمة اتسجلت
 * بدون رقم قومي، وصاحبها كان مستحيل يتتبع طلبه (كان محتاج 14 رقم يسجل بيهم
 * دخول!). لو العامل كتب الرقم القومي، بنستخدمه لتضييق البحث؛ لو سابه فاضي
 * أو مش 14 رقم، بنتجاهله وندور بالموبايل بس.
 */
function normalizeNationalId(value) {
  const nationalId = normalize(value);
  return NATIONAL_ID_REGEX.test(nationalId) ? nationalId : "";
}

/**
 * بناء استعلام يطابق الطلب بالمفاتيح المتاحة — الموبايل دايمًا،
 * والرقم القومي لو موجود وصحيح بس.
 */
function matchApplication(query, phone, nationalId) {
  const scoped = query.eq("phone_number", phone);
  return nationalId ? scoped.eq("national_id", nationalId) : scoped;
}

/**
 * تتبع الطلبات — بيرجّع **كل** طلبات العامل مش طلب واحد.
 * ---------------------------------------------------------------------------
 * بقى بيرجّع مصفوفة `applications` مرتبة تنازلياً (الأحدث فوق)،
 * عشان شاشة "سجل الطلبات" تعرض كل طلب في كارت لوحده. ده بيمنع اللخبطة
 * لما العامل يقدم على أكتر من وظيفة بنفس رقم الموبايل.
 */
export async function trackApplication({ phoneNumber, nationalId: nationalIdInput } = {}) {
  const phone = normalize(phoneNumber);
  const nationalId = normalizeNationalId(nationalIdInput);
  if (!PHONE_REGEX.test(phone)) {
    return { ok: false, error: "اكتب رقم موبايل مصري صحيح (مثال: 01012345678)." };
  }

  try {
    const { data, error } = await matchApplication(
      getSupabaseAdmin()
      .from(APPLICATIONS_TABLE)
      /*
       * hr_notes مضافة هنا عشان ملاحظات فريق الموارد البشرية توصل للمتقدم
       * في صفحة "تتبع الطلب" على الموقع، حسب بند التزامن في Sprint 3.
       */
      /*
       * لازم نرجّع **كل** حقول الفورم، مش الهوية بس — لأن فورم استكمال
       * البيانات بيعرض للمتقدم بياناته القديمة كاملة (متجمّدة)، ويفتح
       * الحقول اللي الـ HR علّم عليها بس. ناقص أي حقل = خانة فاضية
 * في الفورم، واللي بيدّي المتقدم انطباع غلط إن بياناته ضاعت.
       */
      .select(
        [
          "id", "created_at", "selected_job", "status",
          "rejection_reason", "hr_notes", "completion_fields",
          "full_name", "phone_number", "national_id", "age",
          "gender", "marital_status", "governorate", "city", "address",
          "education_level", "specialization", "military_status",
          "experience_years", "previous_companies", "expected_salary",
        ].join(", ")
      ),
      phone,
      nationalId
    )
      /*
       * ترتيب تنازلي: أحدث طلب يظهر أول كارت في السجل.
       * بنستخدم created_at كمعيار، وبنضيف id كفاصل ثابت عشان الترتيب
       * يبقى حتمي (Deterministic) لو قدّم أكتر من طلب في نفس الثانية.
       */
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
    if (error) throw error;

    const applications = data ?? [];
    if (applications.length === 0) {
      return {
        ok: false,
        error: nationalId
          ? "ملقيناش أي طلب بالبيانات دي. راجع الأرقام وحاول تاني."
          : "ملقيناش أي طلب برقم الموبايل ده. راجع الرقم أو ضيف الرقم القومي لو تعرفه.",
      };
    }
    return { ok: true, applications };
  } catch (error) {
    console.error("[trackApplication]", error?.message || error);
    return { ok: false, error: "تعذّر الوصول لطلبك دلوقتي، جرّب تاني بعد شوية." };
  }
}

export async function completeApplicationDetails({ id, phoneNumber, nationalId: nationalIdInput, details } = {}) {
  const phone = normalize(phoneNumber);
  const nationalId = normalizeNationalId(nationalIdInput);
  if (!id || !PHONE_REGEX.test(phone)) return { ok: false, error: "بيانات التحقق غير صحيحة." };
  const updates = Object.fromEntries(
    Object.entries(details || {}).filter(([key, value]) => allowedCompletionFields.has(key) && normalize(value))
  );
  if (!Object.keys(updates).length) return { ok: false, error: "اكتب البيانات المطلوبة الأول." };

  // تحقق إضافي على القيم الحساسة (نفس قواعد فورم التقديم الأساسي)
  if (updates.national_id && !NATIONAL_ID_REGEX.test(updates.national_id)) {
    return { ok: false, error: "الرقم القومي لازم يكون 14 رقم بالظبط." };
  }
  if (updates.full_name && updates.full_name.length > 120) {
    return { ok: false, error: "الاسم أطول من المسموح." };
  }

  try {
    /*
     * بنرجّع الطلب المحدّث كامل (`select().single()`) عشان شاشة "سجل الطلبات"
     * تحدّث الكارت بالقيم الحقيقية (الحالة + البيانات الجديدة) من غير
     * ما تعمل رحلة شبكة تانية أو تعيد البحث من الأول.
     */
    const { data, error } = await matchApplication(
      getSupabaseAdmin()
        .from(APPLICATIONS_TABLE)
        .update({ ...updates, status: "pending", completion_fields: [] }),
      phone,
      nationalId
    )
      .eq("id", id)
      .select(
        [
          "id", "created_at", "selected_job", "status",
          "rejection_reason", "hr_notes", "completion_fields",
          "full_name", "phone_number", "national_id", "age",
          "gender", "marital_status", "governorate", "city", "address",
          "education_level", "specialization", "military_status",
          "experience_years", "previous_companies", "expected_salary",
        ].join(", ")
      )
      .single();
    if (error) throw error;
    return { ok: true, application: data };
  } catch (error) {
    console.error("[completeApplicationDetails]", error?.message || error);
    return { ok: false, error: "تعذّر تحديث البيانات، جرّب تاني." };
  }
}

export async function cancelApplication({ id, phoneNumber, nationalId: nationalIdInput, reason = "" } = {}) {
  const phone = normalize(phoneNumber);
  const nationalId = normalizeNationalId(nationalIdInput);
  if (!id || !PHONE_REGEX.test(phone)) return { ok: false, error: "بيانات التحقق غير صحيحة." };
  try {
    const { error } = await matchApplication(
      getSupabaseAdmin().from(APPLICATIONS_TABLE).update({ status: "cancelled", cancellation_reason: normalize(reason) || null }),
      phone,
      nationalId
    )
      .eq("id", id)
      .select("id, status, cancellation_reason")
      .single();
    if (error) throw error;
    return { ok: true, application: data };
  } catch (error) {
    console.error("[cancelApplication]", error?.message || error);
    return { ok: false, error: "تعذّر إلغاء الطلب، جرّب تاني." };
  }
}
