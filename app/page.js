import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import JobsSection from "@/components/JobsSection";
import Footer from "@/components/Footer";
import RequestJobSection from "@/components/RequestJobSection";
import { getPublicJobs } from "@/lib/jobs";
import { getSiteSettings } from "@/lib/siteSettings";

/*
 * الوظائف بقت بتتقرأ من Supabase (جدول jobs) بدل ما تكون مكتوبة في الكود.
 *
 * فترة إعادة البناء لازم تكون قيمة ثابتة مكتوبة في الملف (شرط Next.js)،
 * فمينفعش نجيبها من متغير مستورد. 30 ثانية توازن بين إن الصفحة تفضل سريعة
 * (مفيش استعلام على قاعدة البيانات مع كل زيارة) وإن البيانات تفضل حديثة.
 * وفوق كده، لوحة التحكم بتنادي webhook بيصفّي الكاش فورًا بعد أي تعديل،
 * فالتحديث الفعلي بيحصل في نفس اللحظة تقريباً مش بعد 30 ثانية.
 */
export const revalidate = 30;

export default async function Home() {
  // بنجيب الوظائف وإعدادات الموقع (CMS) بالتوازي — أسرع من التسلسل
  const [jobs, settings] = await Promise.all([getPublicJobs(), getSiteSettings()]);

  return (
    <>
      <Header
        whatsappEnabled={settings.whatsapp_enabled}
        contactPhones={settings.contact_phones}
      />
      <main>
        <Hero settings={settings} />
        <About settings={settings} />
        <RequestJobSection />
        <JobsSection jobs={jobs} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
