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
  status             text not null default 'pending'
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
  check (status in ('pending', 'reviewed', 'accepted', 'rejected'));

alter table public.job_applications
  drop constraint if exists job_applications_phone_check;
alter table public.job_applications
  add constraint job_applications_phone_check check (phone_number ~ '^[0-9+\-\s]{8,20}$');

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
