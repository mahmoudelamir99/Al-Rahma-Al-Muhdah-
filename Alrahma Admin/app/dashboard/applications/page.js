import { IconInbox } from "@/components/icons";

/**
 * عنصر نائب — قسم طلبات التوظيف (هيتفتح في السبرنت الجاي).
 */
export const metadata = { title: "طلبات التوظيف | لوحة التحكم" };

export default function ApplicationsPage() {
  return (
    <section className="glass-light rounded-3xl p-6 sm:p-8">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <IconInbox className="h-5 w-5" />
      </span>
        <h1 className="mt-4 text-lg font-extrabold text-brand-900 sm:text-xl">طلبات التوظيف</h1>
      <p className="mt-2 max-w-[36rem] text-[13.5px] leading-relaxed text-brand-900/55">
        القسم ده تحت التنفيذ. هيتوصّل بجدول الطلبات ويسمح بالمراجعة وتغيير الحالة،
        ونفس الهيكل والتصميم اللي شايفه دلوقتي.
      </p>
    </section>
  );
}
