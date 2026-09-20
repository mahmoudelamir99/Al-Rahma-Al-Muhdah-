"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, WHATSAPP_LINK, COMPANY } from "@/lib/siteConfig";
import TrackApplicationModal from "./TrackApplicationModal";
import ContactModal from "./ContactModal";

/**
 * Smooth Scroll لأي قسم في الصفحة.
 *
 * ملاحظة مهمة: كنا بنحسب موضع القسم يدوياً، وكان بيطلع غلط على الموبايل
 * لأن قائمة الموبايل بتقفل بأنيميشن بيغيّر ارتفاع الصفحة، فالنتيجة تطلع
 * من الهوا. الحلول اللي بنستخدمها هنا:
 *  1) نتأكد إن القائمة اتقفلت فعلاً (الارتفاع رجع 0) قبل الحساب.
 *  2) نعيد المحاولة لو الصفحة لسه بتتحرك.
 *  3) نسكرول لآخر الإطار من الهيدر عشان العنوان ميتغطاش.
 */
function scrollToSection(id, attempt = 0) {
  if (typeof window === "undefined") return;

  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  // لو قائمة الموبايل لسه بتقفل (ارتفاعها > 0) نستنى ولنجرب تاني
  const mobileNav = document.querySelector('nav[aria-label="التنقل على الموبايل"]');
  if (mobileNav && mobileNav.getBoundingClientRect().height > 1 && attempt < 12) {
    window.setTimeout(() => scrollToSection(id, attempt + 1), 60);
    return;
  }

  const header = document.querySelector("header");
  const offset = (header?.getBoundingClientRect().height ?? 64) + 12;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
}

/* أيقونة واتساب — معرّفة بره الكومبوننت (ثابتة) */
function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* أيقونة القائمة (هامبرغر) */
function MenuIcon({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {open ? (
        <path d="M18 6 6 18M6 6l12 12" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export default function Header({ whatsappEnabled = true }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  /*
   * لينك "تواصل معنا" في الهيدر مش بيعمل Scroll لتحت خالص — بيفتح
   * فورم التواصل (Modal) مباشرةً. ده بيوفّر على المستخدم خطوة، وبيمنع
   * أي التباس إنه لازم ينزل لقسم التواصل. باقي اللينكات بتفضل بتعمل
   * Scroll عادي زي ما هي.
   */
  const CONTACT_LINK_ID = "contact";

  const handleNav = (event, id) => {
    event.preventDefault();
    // نقفل القائمة الأول، والـ scroll بيستنى لحد ما القفل يخلص
    setMenuOpen(false);

    if (id === CONTACT_LINK_ID) {
      setContactOpen(true);
      return;
    }

    scrollToSection(id);
  };

  // اللوجو: نفس منطق التنقل عشان يطلع لأول الصفحة على الموبايل برضه
  const handleLogoClick = (event) => {
    event.preventDefault();
    setMenuOpen(false);
    scrollToSection("top");
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass sticky top-0 z-50 w-full shadow-sm shadow-brand-950/5"
    >
      {/*
        الهيدر بيتمدّد بالطول مع المحتوى: الارتفاع أدنى حد بيضمن إن اللوجو
        يبان واضح، ومفيش max-w بيقطع الصف، فاللوجو الصغير بياخد مساحته
        الطبيعية على الشاشات الواسعة برضه بدون ما يزحم باقي العناصر.
      */}
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-2 px-3 sm:h-24 sm:gap-4 sm:px-6">
        {/* اللوجو الرسمي (ملف شفاف) - على اليمين */}
        <a
          href="#top"
          onClick={handleLogoClick}
          className="flex shrink-0 items-center text-right"
          aria-label={`${COMPANY.name} - الصفحة الرئيسية`}
        >
          {/*
            بنستخدم logo-header.png لأن الفراغ الشفاف حوالين الرسمة مقصوص
            منه، فالحجم المعروض = الرسمة الفعلية (مفيش فراغ مهدور). الملف
            كمان مصغّر لنسبة 1:1 من أكبر ارتفاع بنعرضه، فالصورة تفضل حادة.
            الارتفاع بس هو اللي بنثبّته والعرض بيتحسب من نسبة الصورة (1.41).
          */}
          <Image
            src="/logo-header.png"
            alt={`${COMPANY.name} — ${COMPANY.tagline}`}
            width={114}
            height={80}
            priority
            className="block h-10 w-auto rounded-lg bg-white p-0.5 object-contain sm:h-16 sm:rounded-none sm:bg-transparent sm:p-0 lg:h-[4.5rem]"
          />
        </a>

        {/* لينكات التنقل في النص — مخفية على الموبايل */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(event) => handleNav(event, link.id)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setTrackOpen(true)}
          className="hidden shrink-0 rounded-full bg-gradient-to-l from-amber-500 to-yellow-400 px-3 py-2 text-xs font-extrabold text-slate-950 shadow-sm shadow-amber-500/30 md:block sm:px-4 sm:text-sm"
        >
          تتبع طلبك
        </button>

        {/* زرار واتساب - على الشمال (بيختفي لو الأدمن وقّفه من لوحة التحكم) */}
        {whatsappEnabled && (
          <motion.a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{
              scale: 1.05,
              transition: { type: "spring", stiffness: 320, damping: 20 },
            }}
            whileTap={{
              scale: 0.95,
              transition: { type: "spring", stiffness: 400, damping: 22 },
            }}
            className="btn-shine flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-l from-whatsapp-darker via-whatsapp-dark to-whatsapp px-3 py-2 text-xs font-bold text-white shadow-sm shadow-whatsapp/30 ring-1 ring-inset ring-white/15 transition-shadow hover:shadow-lg hover:shadow-whatsapp/35 sm:px-4 sm:text-sm"
          >
            <WhatsAppIcon className="relative z-10 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="relative z-10">تواصل معنا واتساب</span>
          </motion.a>
        )}

        {/* زرار قائمة الموبايل */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/70 text-slate-600 ring-1 ring-slate-200 transition hover:bg-white md:hidden"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {/* قائمة الموبايل المنسدلة */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="التنقل على الموبايل"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/60 bg-white/80 backdrop-blur-md md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-3 py-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(event) => handleNav(event, link.id)}
                  className="rounded-lg px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setTrackOpen(true); }}
                className="mt-1 rounded-lg bg-amber-50 px-3 py-2.5 text-right text-sm font-bold text-amber-800"
              >
                تتبع طلبك
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {trackOpen && <TrackApplicationModal onClose={() => setTrackOpen(false)} />}
      </AnimatePresence>
      {/* فورم التواصل — Bottom Sheet على الموبايل / مودال على الديسكتوب */}
      <AnimatePresence>
        {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
      </AnimatePresence>
    </motion.header>
  );
}
