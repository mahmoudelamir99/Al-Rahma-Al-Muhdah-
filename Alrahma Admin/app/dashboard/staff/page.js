import SectionPlaceholder from "@/components/SectionPlaceholder";
import { IconUsers } from "@/components/icons";

export const metadata = { title: "الموظفين والصلاحيات | لوحة التحكم" };

export default function StaffPage() {
  return (
    <SectionPlaceholder
      Icon={IconUsers}
      title="الموظفين والصلاحيات"
      description="القسم ده هيتحكم في مين بيقدر يدخل اللوحة، وإيه اللي مسموح له بيه."
      points={[
        "إضافة موظف جديد بحساب وباسوورد",
        "تحديد صلاحيات كل موظف على حدة",
        "إيقاف/تنشيط حساب موظف",
        "تسجيل مين عمل إيه وامتى",
      ]}
    />
  );
}
