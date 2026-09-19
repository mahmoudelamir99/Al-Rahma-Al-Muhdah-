import SectionPlaceholder from "@/components/SectionPlaceholder";
import { IconLayout } from "@/components/icons";

export const metadata = { title: "إدارة محتوى الموقع | لوحة التحكم" };

export default function CmsPage() {
  return (
    <SectionPlaceholder
      Icon={IconLayout}
      title="إدارة محتوى الموقع"
      description="القسم ده هيتحكم في كل المحتوى الظاهر على الموقع الأساسي من غير أي تعديل في الكود."
      points={[
        "النصوص والعناوين الأساسية",
        "فيديو الهيرو وصورة الغلاف",
        "رقم زرار الواتساب ورسالة التواصل",
        "موقع الخريطة وبيانات التواصل",
      ]}
    />
  );
}
