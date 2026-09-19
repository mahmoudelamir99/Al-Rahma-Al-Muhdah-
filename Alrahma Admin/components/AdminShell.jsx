"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ADMIN_BRAND, NAV_ITEMS } from "@/lib/adminConfig";
import { NavIcon, IconClose, IconExternal, IconMenu, IconBell } from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";

/* زمن الحركة واحد في كل حتة عشان الإحساس يبقى متناسق */
const EASE = [0.22, 1, 0.36, 1];
const DRAWER_SPRING = { type: "spring", stiffness: 320, damping: 34, mass: 0.85 };

/** اللوجو الرسمي داخل الـ Sidebar */
function BrandMark() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-surface-400">
        <img
          src="/logo.png"
          alt={ADMIN_BRAND.name}
          width={48}
          height={48}
          className="h-10 w-10 object-contain"
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14.5px] font-extrabold leading-tight text-brand-900">
          {ADMIN_BRAND.shortName}
        </span>
        <span className="block truncate text-[11.5px] leading-tight text-brand-900/45">
          {ADMIN_BRAND.panelName}
        </span>
      </span>
    </div>
  );
}

/** محتوى القائمة — مستخدم في الديسكستوب وفي درج الموبايل */
function NavList({ pathname, onNavigate }) {
  return (
    <nav className="space-y-1.5" aria-label="القائمة الرئيسية">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[14px] font-bold transition-colors duration-200 ease-premium ${
              active
                ? "text-brand-700"
                : "text-brand-900/60 hover:bg-white/70 hover:text-brand-800"
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                transition={DRAWER_SPRING}
                className="absolute inset-0 -z-10 rounded-2xl border-surface-400 bg-brand-50"
              />
            )}
            {active && (
              <span className="absolute inset-y-2.5 right-0 w-[3px] rounded-full bg-copper-500" />
            )}
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${
                active
                  ? "bg-brand-800 text-white"
                  : "bg-brand-50 text-brand-900/50 group-hover:text-brand-700"
              }`}
            >
              <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{item.label}</span>
              <span className="block truncate text-[11px] font-normal text-brand-900/45">
                {item.hint}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-6 space-y-3 border-t border-brand-100 pt-5">
      <a
        href={ADMIN_BRAND.siteUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-2 rounded-2xl bg-white/70 px-3.5 py-3 text-[12.5px] font-semibold text-brand-900/65 transition-colors duration-200 hover:bg-white hover:text-brand-800"
      >
        <span>زيارة الموقع</span>
        <IconExternal className="h-4 w-4 shrink-0 text-brand-900/40" />
      </a>
      <LogoutButton />
    </div>
  );
}

export default function AdminShell({ user, children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // نقفل درج الموبايل أول ما العرض يكبّر
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (event) => {
      if (event.matches) closeMobile();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [closeMobile]);

  // نقفل الدرج عند تغيير الصفحة
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // منع سكرول الصفحة الخلفية وقت فتح الدرج
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // قفل بـ Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  const currentItem = NAV_ITEMS.find((item) => item.href === pathname);
  const initial = (user?.email || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-surface-200">
      {/* خلفية اللوحة — تدرجات ثابتة بدون أي أنيميشن (أداء أسرع) */}
      <div className="pointer-events-none fixed inset-0 aura-layer" aria-hidden="true" />
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-white/45 via-transparent to-surface-300/50"
        aria-hidden="true"
      />

      <div className="relative flex w-full">
        {/* ============ Sidebar — ديسكستوب ============ */}
        <aside className="sticky top-0 hidden h-[100dvh] w-[17.5rem] shrink-0 flex-col border-l border-brand-100 bg-white/95 px-4 py-5 lg:flex">
          <BrandMark />

          <div className="mt-7 flex-1 overflow-y-auto pb-2">
            <p className="mb-2.5 px-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-900/35">
              التنقل
            </p>
            <NavList pathname={pathname} />
          </div>

          <SidebarFooter />
        </aside>

        {/* ============ Sidebar — درج الموبايل ============ */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="drawer-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                onClick={closeMobile}
                className="fixed inset-0 z-40 bg-brand-950/25 lg:hidden"
                aria-hidden="true"
              />
              <motion.aside
                key="drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={DRAWER_SPRING}
                role="dialog"
                aria-modal="true"
                aria-label="قائمة التنقل"
                className="fixed inset-y-0 right-0 z-50 flex w-[17.5rem] max-w-[86vw] flex-col border-l border-brand-100 bg-white px-4 py-5 shadow-lift lg:hidden"
              >
                <div className="flex items-center justify-between gap-3">
                  <BrandMark />
                  <button
                    type="button"
                    onClick={closeMobile}
                    aria-label="إغلاق القائمة"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-900/60 transition-colors duration-200 hover:bg-brand-100 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  >
                    <IconClose className="h-[18px] w-[18px]" />
                  </button>
                </div>

                <div className="mt-7 flex-1 overflow-y-auto pb-2">
                  <p className="mb-2.5 px-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-900/35">
                    التنقل
                  </p>
                  <NavList pathname={pathname} onNavigate={closeMobile} />
                </div>

                <SidebarFooter />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ============ العمود الرئيسي ============ */}
        <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/95">
            <div className="flex h-16 w-full items-center gap-3 px-4 sm:px-6">
              {/* زرار الهامبرجر — موبايل/تابلت بس */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="فتح القائمة"
                aria-expanded={mobileOpen}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-brand-100 bg-white text-brand-900/70 shadow-soft transition-colors duration-200 hover:bg-brand-50 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 lg:hidden"
              >
                <IconMenu className="h-5 w-5" />
              </button>

              {/* عنوان الصفحة الحالية */}
              <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-extrabold leading-tight text-brand-900">
                  {currentItem?.label || "لوحة التحكم"}
                </p>
                <p className="hidden truncate text-[11.5px] leading-tight text-brand-900/50 sm:block">
                  {currentItem?.hint || "إدارة النظام"}
                </p>
              </div>

              {/* جرس (مكانه محفوظ للمرحلة الجاية) */}
              <span className="relative hidden shrink-0 sm:block">
                <button
                  type="button"
                  aria-label="التنبيهات (قريباً)"
                  title="التنبيهات — قريباً"
                  className="grid h-10 w-10 cursor-default place-items-center rounded-xl border-brand-100 bg-white text-brand-900/40 shadow-soft"
                >
                  <IconBell className="h-[18px] w-[18px]" />
                </button>
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-copper-500 px-1 text-[10px] font-bold text-white">
                  0
                </span>
              </span>

              {/* بيانات المستخدم */}
              <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border-brand-100 bg-white py-1.5 pl-1.5 pr-3 shadow-soft">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-800 text-[13px] font-bold text-white">
                  {initial}
                </span>
                <span className="hidden min-w-0 md:block">
                  <span
                    className="block max-w-[13rem] truncate text-[12px] font-bold leading-tight text-brand-900/80"
                    dir="ltr"
                  >
                    {user?.email || "—"}
                  </span>
                  <span className="block text-[10.5px] leading-tight text-copper-600">
                    مدير عام
                  </span>
                </span>
                <LogoutButton variant="icon" />
              </div>
            </div>
          </header>

          {/* المحتوى */}
          <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="mx-auto w-full max-w-[80rem]"
            >
              {children}
            </motion.div>
          </main>

          <footer className="border-t border-brand-100 px-4 py-5 sm:px-6">
            <p className="text-center text-[11.5px] text-brand-900/45">
              {ADMIN_BRAND.name} — {ADMIN_BRAND.panelName} © {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
