import { IconUser } from "@/components/icons";
import { SUPER_ADMIN_EMAIL } from "@/lib/adminConfig";

export const metadata = { title: "حسابي | لوحة التحكم" };

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <section className="glass-light rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <IconUser className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-brand-900 sm:text-xl">حسابي</h1>
            <p className="mt-2 max-w-[42rem] text-[13.5px] leading-relaxed text-brand-900/60">
              بيانات الموظف اللي مسجل دخول دلوقتي. تعديل البيانات هيتاح في السبرنت الجاي.
            </p>
          </div>
        </div>

        <div className="divider-soft my-6" />

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-900/40">
              البريد الإلكتروني
            </dt>
            <dd className="mt-1 text-[13.5px] font-bold text-brand-900/80" dir="ltr">
              {SUPER_ADMIN_EMAIL}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-900/40">
              الدور
            </dt>
            <dd className="mt-1 text-[13.5px] font-bold text-gold-600">مدير عام (Super Admin)</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
