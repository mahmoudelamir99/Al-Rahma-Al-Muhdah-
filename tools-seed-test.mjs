// أداة اختبار محلية (ممنوع الرفع): تزرع طلبين لنفس العامل في قاعدة البيانات
// واحد مرفوض + واحد محتاج استكمال بيانات — لاختبار شاشة "سجل الطلبات".
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// تحميل .env.local يدوياً
const envPath = path.join(process.cwd(), ".env.local");
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const PHONE = "01099887766";
const NATIONAL_ID = "29901011234567"; // 14 رقم

const base = {
  completion_fields: [],
  phone_number: PHONE,
  national_id: NATIONAL_ID,
  full_name: "سيد إبراهيم اختبار",
  age: 30,
  gender: "ذكر",
  marital_status: "متزوج",
  governorate: "القاهرة",
  city: "مدينة نصر",
  address: "شارع عباس العقاد",
  education_level: "بكالوريوس",
  specialization: "تجارة",
  military_status: "مؤدي الخدمة",
  experience_years: "3 - 5 سنوات",
  previous_companies: "شركة سابقة",
  expected_salary: "8000",
};

// 1) تنظيف أي بيانات اختبار قديمة بنفس الرقم
await supabase.from("job_applications").delete().eq("phone_number", PHONE);

// 2) طلب مرفوض
const rejected = {
  ...base,
  selected_job: "محاسب",
  status: "rejected",
  hr_notes: "معندكش شهادة الخبرة المطلوبة.",
  rejection_reason: "معندكش شهادة الخبرة المطلوبة.",
};

// 3) طلب محتاج استكمال بيانات
const needsInfo = {
  ...base,
  selected_job: "مهندس",
  status: "needs_info",
  hr_notes: "لازم صورة البطاقة + الرقم القومي واضح.",
  completion_fields: ["national_id", "previous_companies"],
};

// 4) طلب مقبول كمان (اختياري لتغطية الأخضر)
const accepted = {
  ...base,
  selected_job: "عامل",
  status: "accepted",
  hr_notes: "تم القبول وهنتواصل معاك.",
};

/* ملاحظة: needsInfo فوق بيعمل override للـ completion_fields بحقل مش empty. */

const { data, error } = await supabase
  .from("job_applications")
  .insert([rejected, needsInfo, accepted])
  .select("id, selected_job, status, created_at");

if (error) {
  console.error("INSERT ERROR:", error.message);
  process.exit(1);
}
console.log("تم زرع الطلبات:");
for (const row of data) console.log(" -", row.selected_job, "|", row.status, "|", row.created_at);
console.log("\nرقم الاختبار:", PHONE, "| الرقم القومي:", NATIONAL_ID);
