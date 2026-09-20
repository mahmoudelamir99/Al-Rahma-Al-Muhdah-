import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Webhook تزامن إعدادات الموقع (CMS).
 * ---------------------------------------------------------------------------
 * لوحة التحكم (بورت 3001) مشروع منفصل عن الموقع (بورت 3000)، فـ revalidatePath
 * في اللوحة مش بتأثر على كاش الموقع. عشان كده اللوحة بتنادي الـ endpoint ده
 * بعد حفظ إعدادات الموقع (الواتساب/الخريطة/الشروط) عشان تتطبق فوراً.
 *
 * الحماية: نفس منطق revalidate-jobs — لو SITE_REVALIDATE_SECRET مضبوط،
 * لازم الهيدر x-revalidate-secret يكون مطابق.
 */
export async function POST(request) {
  const expected = process.env.SITE_REVALIDATE_SECRET;

  if (expected) {
    const provided = request.headers.get("x-revalidate-secret");
    if (provided !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  // الإعدادات بتأثر على الصفحة الرئيسية (الواتساب/الخريطة) وصفحة الشروط
  revalidatePath("/");
  revalidatePath("/terms");

  return NextResponse.json({ ok: true, revalidated: ["/", "/terms"], at: new Date().toISOString() });
}
