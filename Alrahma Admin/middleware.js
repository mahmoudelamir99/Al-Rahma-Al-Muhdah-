import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * حماية اللوحة من السيرفر:
 * - بيجدّد جلسة Supabase على كل طلب.
 * - يمنع أي دخول لـ /dashboard من غير تسجيل دخول.
 * - يمنع الزائر المسجّل من رؤية شاشة الدخول (يرجّعه للوحة).
 *
 * ملاحظة عن المفاتيح: مشروع Supabase ده لسه ما فيهوش anon key في
 * Supabase → Project Settings → API، فبنستخدم مفتاح الخدمة كاحتياط
 * عشان اللوحة تشتغل من أول لحظة. أول ما تضيف الـ anon key في
 * .env.local، الكود بيستخدمه أوتوماتيك من غير أي تعديل تاني.
 */
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return response;
  }

  // خوان كعيكيز الجلسة (بيحقق بيهم عميل Supabase)
  const cookieHeader = request.cookies.getAll();

  // كيكي فاضي على /dashboard = مفيش جلسة → نرجّع للشاشة فورًا
  // من غير أي نداء شبكة (ده اللي كان بيخلي الطلب يعلّق).
  const hasSessionCookie = cookieHeader.some(
    (c) => c.name === "sb-access-token" || c.name.startsWith("sb-") && c.name.includes("auth-token")
  );

  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard && !hasSessionCookie) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // لو مفيش كوكيز محفوظة على المسارات التانية، مش محتاجين نتكلم مع Supabase خالص
  if (!hasSessionCookie) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    user = null;
  }

  if (isDashboard && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (!isDashboard && user && pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
