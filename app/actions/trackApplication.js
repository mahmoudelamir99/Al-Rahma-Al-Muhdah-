"use server";

import { getSupabaseAdmin, APPLICATIONS_TABLE } from "@/lib/supabaseAdmin";

const normalize = (value) => String(value ?? "").trim();
const allowedCompletionFields = new Set(["address", "city", "specialization", "previous_companies", "expected_salary"]);

export async function trackApplication({ phoneNumber, nationalId: nationalIdInput } = {}) {
  const phone = normalize(phoneNumber);
  const nationalId = normalize(nationalIdInput);
  if (!/^01[0125][0-9]{8}$/.test(phone) || !/^\d{14}$/.test(nationalId)) {
    return { ok: false, error: "اكتب رقم موبايل مصري ورقم قومي صحيح من 14 رقم." };
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from(APPLICATIONS_TABLE)
      .select("id, created_at, selected_job, status, rejection_reason, completion_fields, expected_salary, city, specialization, previous_companies, address")
      .eq("phone_number", phone)
      .eq("national_id", nationalId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { ok: false, error: "ملقيناش طلب بالبيانات دي. راجع الأرقام وحاول تاني." };
    return { ok: true, application: data };
  } catch (error) {
    console.error("[trackApplication]", error?.message || error);
    return { ok: false, error: "تعذّر الوصول لطلبك دلوقتي، جرّب تاني بعد شوية." };
  }
}

export async function completeApplicationDetails({ id, phoneNumber, nationalId: nationalIdInput, details } = {}) {
  const phone = normalize(phoneNumber);
  const nationalId = normalize(nationalIdInput);
  if (!id || !/^01[0125][0-9]{8}$/.test(phone) || !/^\d{14}$/.test(nationalId)) return { ok: false, error: "بيانات التحقق غير صحيحة." };
  const updates = Object.fromEntries(Object.entries(details || {}).filter(([key, value]) => allowedCompletionFields.has(key) && normalize(value)));
  if (!Object.keys(updates).length) return { ok: false, error: "اكتب البيانات المطلوبة الأول." };
  try {
    const { error } = await getSupabaseAdmin().from(APPLICATIONS_TABLE).update({ ...updates, status: "pending", completion_fields: [] }).eq("id", id).eq("phone_number", phone).eq("national_id", nationalId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    console.error("[completeApplicationDetails]", error?.message || error);
    return { ok: false, error: "تعذّر تحديث البيانات، جرّب تاني." };
  }
}

export async function cancelApplication({ id, phoneNumber, nationalId: nationalIdInput, reason = "" } = {}) {
  const phone = normalize(phoneNumber);
  const nationalId = normalize(nationalIdInput);
  if (!id || !/^01[0125][0-9]{8}$/.test(phone) || !/^\d{14}$/.test(nationalId)) return { ok: false, error: "بيانات التحقق غير صحيحة." };
  try {
    const { error } = await getSupabaseAdmin().from(APPLICATIONS_TABLE).update({ status: "cancelled", cancellation_reason: normalize(reason) || null }).eq("id", id).eq("phone_number", phone).eq("national_id", nationalId);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    console.error("[cancelApplication]", error?.message || error);
    return { ok: false, error: "تعذّر إلغاء الطلب، جرّب تاني." };
  }
}
