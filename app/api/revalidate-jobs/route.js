import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Webhook التزامن الفوري مع لوحة التحكم.
 * ---------------------------------------------------------------------------
 * لوحة التحكم (بورت 3001) مشروع منفصل عن الموقع (بورت 3000)، فـ
 * `revalidatePath` في اللوحة مش بتأثر على كاش الموقع. عشان كده اللوحة
 * بتنادي الـ endpoint ده بعد أي إضافة/تعديل/حذف، وهو اللي بيفضّي كاش
 * الصفحة الرئيسية عند الموقع — فالوظيفة تظهر/تختفي فورًا.
 *
 * الحماية: لو SITE_REVALIDATE_SECRET مضبوط في .env.local، لازم الهيدر
 * x-revalidate-secret يكون مطابق له. ولو مش مضبوط (تشغيل محلي)، الـ endpoint
 * بيشتغل عادي لأن اللوحة والموقع على نفس الجهاز.
 */
export async function POST(request) {
  const expected = process.env.SITE_REVALIDATE_SECRET;

  if (expected) {
    const provided = request.headers.get("x-revalidate-secret");
    if (provided !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  // نفضّي كاش الصفحة الرئيسية (الوظائف بتتعرض فيها)
  revalidatePath("/");

  return NextResponse.json({ ok: true, revalidated: "/", at: new Date().toISOString() });
}
