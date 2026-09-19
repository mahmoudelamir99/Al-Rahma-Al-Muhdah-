import SectionPlaceholder from "@/components/SectionPlaceholder";
import { IconHeadset } from "@/components/icons";

export const metadata = { title: "طلبات الدعم الفني | لوحة التحكم" };

export default function SupportPage() {
  return (
    <SectionPlaceholder
      Icon={IconHeadset}
      title="طلبات الدعم الفني"
      description="القسم ده مخصص لطلبات الموظفين على النظام (مش طلبات التوظيف)."
      points={[
        "طلب تغيير كلمة المرور",
        "طلب تغيير البريد الإلكتروني",
        "متابعة حالة كل طلب (جديد / قيد التنفيذ / تم)",
        "أرشفة الطلبات المنتهية",
      ]}
    />
  );
}
