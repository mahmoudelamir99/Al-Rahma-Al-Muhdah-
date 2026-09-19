import Link from "next/link";
import { NAV_ITEMS, SUPER_ADMIN_EMAIL } from "@/lib/adminConfig";
import { NavIcon, IconGrid } from "@/components/icons";
import { getJobsStats } from "@/lib/jobs";

export const dynamic = "force-dynamic";

// كل الأقسام ما عدا الرئيسية نفسها (دي الصفحة اللي إحنا فيها)
const CARDS = NAV_ITEMS.filter((item) => item.href !== "/dashboard");

export default async function DashboardPage() {
  // إحصائيات الوظائف — لو الجدول لسه مش موجود بترجّع أصفار بدون كسر الصفحة
  let stats = { total: 0, available: 0, closed: 0, requiredTotal: 0, applicantsTotal: 0 };
  try {
    stats = await getJobsStats();
  } catch {
    // نتجاهل — الصفحة تفضل شغالة
  }

  const STAT_CARDS = [
    { label: "إجمالي الوظائف", value: stats.total },
    { label: "وظائف متاحة", value: stats.available },
    { label: "وظائف مغلقة", value: stats.closed },
    { label: "إجمالي المطلوب", value: stats.requiredTotal },
    { label: "إجمالي المتقدمين", value: stats.applicantsTotal },
  ];

  return (
    <div className="space-y-6">
      {/* ترحيب */}
      <section className="glass-light rounded-3xl p-6 sm:p-7">
        <p className="flex items-center gap-2 text-[12px] font-bold text-gold-600">
          <IconGrid className="h-4 w-4" />
          نظرة عامة
        </p>
        <h1 className="mt-3 text-xl font-extrabold leading-snug text-brand-900 sm:text-2xl">
          أهلاً بيك يا مدير <span className="text-gradient-gold">الرحمة</span>
        </h1>
        <p className="mt-2 max-w-[38rem] text-[13.5px] leading-relaxed text-brand-900/55">
          اللوحة اتأسست وبقت شغالة على السيرفر المحلي. الدخول كان بحساب المدير العام،
          والجلسة محمية من السيرفر. السبعة أقسام اتجهزت في القائمة الجانبية،
          وهنبرمجهم واحد.
        </p>

        <div className="divider-gold my-5" />

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-900/40">
              الحساب المسجّل
            </dt>
            <dd className="mt-1 text-[13.5px] font-bold text-brand-900/75" dir="ltr">
              {SUPER_ADMIN_EMAIL}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-brand-900/40">
              الصلاحية
            </dt>
            <dd className="mt-1 text-[13.5px] font-bold text-gold-600">مدير عام (Super Admin)</dd>
          </div>
        </dl>
      </section>

      {/* إحصائيات سريعة */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {STAT_CARDS.map(({ label, value }) => (
          <div key={label} className="glass-light rounded-3xl p-5">
            <p className="text-[11.5px] font-bold uppercase tracking-wider text-brand-900/45">
              {label}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-brand-900">{value}</p>
          </div>
        ))}
      </section>

      {/* أقسام اللوحة */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map(({ href, label, hint, icon }) => (
          <Link
            key={href}
            href={href}
            className="group glass-light flex items-start gap-4 rounded-3xl p-5 transition-shadow duration-150 ease-out hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-colors duration-150 group-hover:bg-brand-600 group-hover:text-white">
              <NavIcon name={icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14.5px] font-extrabold text-brand-900">{label}</span>
              <span className="mt-1 block text-[12.5px] leading-relaxed text-brand-900/50">
                {hint}
              </span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
