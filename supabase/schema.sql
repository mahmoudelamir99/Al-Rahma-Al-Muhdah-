-- ============================================================
--  الرحمة المهداة للتوظيف — Schema جدول طلبات التقديم
--  شغّل السكربت ده في Supabase → SQL Editor (Run)
-- ============================================================

create table if not exists public.job_applications (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),

  -- البيانات الأساسية
  full_name          text not null,
  phone_number       text not null,
  national_id        text not null,
  age                integer not null,
  gender             text not null,
  marital_status     text not null,

  -- السكن والمؤهل
  governorate        text not null,
  city               text not null,
  education_level    text not null,
  specialization     text,
  military_status    text not null,

  -- الخبرة
  experience_years   text not null,
  previous_companies text,
  expected_salary    text not null,

  -- الوظيفة والحالة
  selected_job       text not null,
  status             text not null default 'pending',
  rejection_reason   text,
  completion_fields  text[] not null default '{}',
  address            text,
  cancellation_reason text
);

-- قيود منطقية على القيم (تطابق الـ select في الفورم)
alter table public.job_applications
  drop constraint if exists job_applications_age_check;
alter table public.job_applications
  add constraint job_applications_age_check check (age between 18 and 70);

alter table public.job_applications
  drop constraint if exists job_applications_status_check;
alter table public.job_applications
  add constraint job_applications_status_check
  check (status in ('pending', 'reviewed', 'needs_info', 'accepted', 'rejected', 'cancelled'));

alter table public.job_applications
  drop constraint if exists job_applications_phone_check;
alter table public.job_applications
  add constraint job_applications_phone_check check (phone_number ~ '^[0-9+\-\s]{8,20}$');

-- للقاعدة الموجودة بالفعل: يضيف العمود قبل تفعيل النموذج الجديد.
alter table public.job_applications
  add column if not exists national_id text;
alter table public.job_applications
  add column if not exists rejection_reason text;
alter table public.job_applications
  add column if not exists completion_fields text[] not null default '{}';
alter table public.job_applications
  add column if not exists address text;
alter table public.job_applications
  add column if not exists cancellation_reason text;
-- الأرشيف (Soft Delete): الطلب المحذوف ناعماً يفضل في الجدول بـ deleted_at
-- مش null (يظهر في الأرشيف)، والقائمة الرئيسية بتفلتر deleted_at is null.
alter table public.job_applications
  add column if not exists deleted_at timestamptz;
alter table public.job_applications
  add column if not exists deleted_by text;

alter table public.job_applications
  drop constraint if exists job_applications_national_id_check;
alter table public.job_applications
  add constraint job_applications_national_id_check check (national_id ~ '^[0-9]{14}$');

-- فهارس للوحة التحكم بعدين
create index if not exists job_applications_created_at_idx on public.job_applications (created_at desc);
create index if not exists job_applications_status_idx     on public.job_applications (status);
create index if not exists job_applications_job_idx        on public.job_applications (selected_job);

-- ============================================================
--  RLS: مفيش أي وصول مباشر من المتصفح
--  كل الكتابة بتحصل من السيرفر بـ Service Role Key،
--  فمفيش policy للـ anon — ولا حتى قراءة.
-- ============================================================
alter table public.job_applications enable row level security;

-- (اختياري) لو هتستخدم لوحة تحكم بـ anon key لاحقاً، فعّل الـ policies دي:
-- create policy "admins can read applications"
--   on public.job_applications for select
--   to authenticated using (true);
-- ============================================================
--  جدول رسائل "تواصل معنا" (Contact Us)
--  رسائل الزوار من فورم الاتصال بتتسجل هنا من السيرفر
--  (Server Action) بمفتاح الخدمة، فمفيش وصول مباشر من المتصفح.
-- ============================================================

create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  full_name    text not null,
  phone_number text not null,
  reason       text not null,
  message      text not null,

  -- حالة الرسالة للوحة التحكم بعدين (جديدة / مقروءة / تم الرد)
  status       text not null default 'new'
);

-- قيد على الحالة (يقابل قيم select في الفورم)
alter table public.contact_messages
  drop constraint if exists contact_messages_status_check;
alter table public.contact_messages
  add constraint contact_messages_status_check
  check (status in ('new', 'read', 'replied'));

-- رقم تليفون مصري بسيط (نفس منطق جدول الطلبات)
alter table public.contact_messages
  drop constraint if exists contact_messages_phone_check;
alter table public.contact_messages
  add constraint contact_messages_phone_check
  check (phone_number ~ '^[0-9+\-\s]{8,20}$');

-- فهارس للوحة التحكم
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx
  on public.contact_messages (status);

-- RLS: مفيش وصول مباشر من المتصفح (كل الكتابة من السيرفر بمفتاح الخدمة)
alter table public.contact_messages enable row level security;
