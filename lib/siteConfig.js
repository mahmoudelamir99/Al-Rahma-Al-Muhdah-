/**
 * بيانات الشركة الموحّدة — مصدر واحد لكل المعلومات الحقيقية
 * أي تعديل في البيانات بيحصل من هنا بس، وكل الكومبوننتات بتقرا منه.
 */

export const SITE_URL = "https://alrahma-recruitment.vercel.app";

export const COMPANY = {
  name: "الرحمة المهداة للتوظيف",
  nameEn: "Alrahma Al-Mohdah Recruitment",
  tagline: "فرص عمل بالشركات العالمية",
};

export const CONTACT = {
  // العنوان الكامل
  address: "العاشر من رمضان، الأردنية، مول الحجاز، الدور الرابع، مكتب رقم ١٠",
  addressLines: ["العاشر من رمضان، الأردنية", "مول الحجاز، الدور الرابع، مكتب رقم ١٠"],
  // رابط الخريطة اللي بيفتح في تاب جديد (للموبايل/التنقل)
  mapUrl: "https://maps.app.goo.gl/qZjFsnfB6j9qP8Eu8?g_st=ic",
  /*
   * رابط الخريطة التفاعلية (iframe Embed) — بعرض القسم بالكامل.
   * بنستخدم صيغة embed الرسمية من جوجل مع كويري العنوان عشان تطلع
   * دبوسة المكان الصح، والمستخدم يقدر يعمل زووم ويسحب الخريطة ويتفاعل معاها.
   * (صيغة ?q=...&output=embed هي الصيغة اللي بتشتغل جوه iframe من غير مفتاح API.)
   */
  mapEmbedUrl:
    "https://www.google.com/maps?q=" +
    encodeURIComponent("مول الحجاز، العاشر من رمضان، الأردنية، مصر") +
    "&z=15&output=embed",
  // رابط فتح الاتجاهات في تاب جديد (زر «الاتجاهات»)
  mapDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("مول الحجاز، العاشر من رمضان، الأردنية، مصر"),

  // مواعيد العمل
  workingHours: "من ٨ ص إلى ٥ م",
  workingDays: "من الأحد للخميس",

  // البريد
  email: "alrahma.almohdah.recruitment@gmail.com",

  // واتساب — أ. محمود
  whatsappName: "أ. محمود",
  whatsappNumber: "01066718722",
};

// رسالة الواتساب الافتراضية
const WHATSAPP_TEXT = "السلام عليكم، أرغب في الاستفسار عن الوظائف المتاحة.";

// رقم دولي بصيغة الواتساب (مصر 20 + الرقم بدون صفر البداية)
export const WHATSAPP_LINK = `https://wa.me/20${CONTACT.whatsappNumber.substring(1)}?text=${encodeURIComponent(
  WHATSAPP_TEXT
)}`;

// أقسام الصفحة — مستخدمة في الهيدر والفوتر والـ Smooth Scroll
export const NAV_LINKS = [
  { id: "top", label: "الرئيسية" },
  { id: "about", label: "من نحن" },
  { id: "jobs", label: "الوظائف المتاحة" },
  { id: "contact", label: "تواصل معنا" },
];

// نص قسم "من نحن" — بالحرف زي ما العميل طلب
export const ABOUT_TEXT =
  "شركة الرحمة المهداة للتوظيف هي حلقة الوصل الموثوقة بين الكفاءات والشركات الكبرى في مصر. نسعى جاهدين لتوفير فرص عمل حقيقية ومناسبة للشباب بشكل مجاني تماماً، مع ضمان بيئة عمل آمنة ومستقرة.";
