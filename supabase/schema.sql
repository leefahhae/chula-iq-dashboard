-- Chula IQ — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- IDs are plain text (generated in the app, e.g. "st_abc123") rather than uuid,
-- so they match exactly what the Next.js app already generates client-side.

create table if not exists students (
  id text primary key,
  name text not null,
  grade text not null,
  parent_name text not null,
  parent_line text not null,
  parent_facebook text not null,
  phone text,
  line_user_id text
);

-- If you already ran this file once before line_user_id existed, run this
-- separately in the SQL Editor to add the column without recreating the table:
-- alter table students add column if not exists line_user_id text;

create table if not exists courses (
  id text primary key,
  name text not null,
  subject text not null,
  type text not null check (type in ('private', 'group')),
  hourly_rate numeric,
  default_monthly_hours numeric,
  monthly_fee numeric
);

create table if not exists enrollments (
  id text primary key,
  student_id text not null references students(id) on delete cascade,
  course_id text not null references courses(id) on delete cascade,
  monthly_hours numeric,
  monthly_fee numeric,
  hours_used numeric not null default 0,
  session_hours numeric not null default 0
);
create index if not exists enrollments_student_idx on enrollments(student_id);
create index if not exists enrollments_course_idx on enrollments(course_id);

create table if not exists attendance (
  id text primary key,
  enrollment_id text not null references enrollments(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'leave')),
  hours_counted numeric not null default 0
);
create index if not exists attendance_enrollment_idx on attendance(enrollment_id);

create table if not exists transactions (
  id text primary key,
  student_id text not null references students(id) on delete cascade,
  course_id text not null references courses(id) on delete cascade,
  amount numeric not null,
  method text not null check (method in ('cash', 'transfer')),
  slip_image text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists transactions_student_idx on transactions(student_id);
create index if not exists transactions_course_idx on transactions(course_id);

create table if not exists expenses (
  id text primary key,
  title text not null,
  amount numeric not null,
  category text not null check (category in ('payroll', 'materials', 'utilities', 'marketing', 'misc')),
  method text not null check (method in ('cash', 'transfer')),
  receipt_image text,
  created_at timestamptz not null default now()
);

create table if not exists line_inbox (
  id text primary key,
  line_user_id text not null,
  message_text text not null,
  created_at timestamptz not null default now()
);
create index if not exists line_inbox_user_idx on line_inbox(line_user_id);

-- Lock every table down by default (deny-all for the public "anon"/"authenticated"
-- roles). The app never uses the anon key — every request goes through Next.js
-- API routes using the service_role key, which bypasses RLS entirely. This is
-- just a safety net in case the anon key ever leaks or gets used by mistake.
alter table students enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table attendance enable row level security;
alter table transactions enable row level security;
alter table expenses enable row level security;
alter table line_inbox enable row level security;

-- ---------------------------------------------------------------------------
-- OPTIONAL: starter demo data (same as the app's old built-in mock data).
-- Uncomment and run if you'd like to try the app with sample students/courses
-- instead of starting from a completely empty database.
-- ---------------------------------------------------------------------------

-- insert into students (id, name, grade, parent_name, parent_line, parent_facebook, phone) values
--   ('st_1', 'น้องมิ้นท์', 'ม.6', 'คุณสมศรี (แม่)', 'mint_mom_2026', 'facebook.com/somsri.k', '081-234-5678'),
--   ('st_2', 'น้องปันปัน', 'ม.4', 'คุณวิชัย (พ่อ)', 'wichai.pp', 'facebook.com/wichai.p', '089-876-5432');
--
-- insert into courses (id, name, subject, type, hourly_rate, default_monthly_hours, monthly_fee) values
--   ('co_1', 'Chemistry ตัวต่อตัว ม.6', 'เคมี', 'private', 500, 8, null),
--   ('co_3', 'Physics กลุ่มเล็ก ม.6', 'ฟิสิกส์', 'group', null, null, 1000);
--
-- insert into enrollments (id, student_id, course_id, monthly_hours, monthly_fee, hours_used, session_hours) values
--   ('en_1', 'st_1', 'co_1', 8, null, 0, 1.5),
--   ('en_2', 'st_1', 'co_3', null, 1000, 0, 0);
