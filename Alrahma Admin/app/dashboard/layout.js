import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminShell from "@/components/AdminShell";

/**
 * هيكل اللوحة — محمي على مستويين:
 *  1. middleware بيمنع أي دخول من غير جلسة.
 *  2. التحقق اللي هنا بيعيد التأكيد من السيرفر (دفاع في العمق).
 */
export const metadata = {
  title: "لوحة التحكم | الرحمة المهداة للتوظيف",
};

export default async function DashboardLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <AdminShell user={{ email: user.email }}>{children}</AdminShell>;
}
