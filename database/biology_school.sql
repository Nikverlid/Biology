create schema if not exists biology;
revoke all on schema biology from public, anon, authenticated;
create table if not exists biology.accounts (
 id uuid primary key default gen_random_uuid(),
 login text not null unique,
 name text not null,
 class text check (class in ('5А','5Б')),
 role text not null check (role in ('student','teacher','admin')),
 password_hash text not null,
 salt text not null,
 must_change_password boolean not null default false,
 created_at timestamptz not null default now()
);
alter table biology.accounts add column if not exists must_change_password boolean not null default false;
create unique index if not exists biology_student_name_class_unique on biology.accounts (lower(name), class) where role='student';
create table if not exists biology.sessions (
 token_hash text primary key,
 account_id uuid not null references biology.accounts(id) on delete cascade,
 expires_at timestamptz not null
);
create index if not exists biology_sessions_account_idx on biology.sessions(account_id);
create table if not exists biology.homework (
 id uuid primary key default gen_random_uuid(),
 class text not null check (class in ('5А','5Б')),
 topic_id integer not null check (topic_id between 1 and 27),
 game text not null check (game in ('truth','crossword','walk','quiz')),
 due_date date,
 active boolean not null default true,
 created_by uuid references biology.accounts(id),
 created_at timestamptz not null default now()
);
create index if not exists biology_homework_class_active_due_idx on biology.homework(class, active, due_date);
create table if not exists biology.results (
 id uuid primary key default gen_random_uuid(),
 homework_id uuid not null references biology.homework(id) on delete cascade,
 student_id uuid not null references biology.accounts(id) on delete cascade,
 status text not null default 'not_started' check(status in ('not_started','in_progress','completed','abandoned')),
 score numeric(5,2) check (score between 0 and 100),
 correct integer not null default 0 check(correct >= 0),
 wrong integer not null default 0 check(wrong >= 0),
 started_at timestamptz,
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 unique(homework_id, student_id)
);
create index if not exists biology_results_student_idx on biology.results(student_id, created_at desc);
create table if not exists biology.rate_limits (
 key text primary key,
 hits integer not null default 0,
 until_at timestamptz not null
);
alter table biology.accounts enable row level security;
alter table biology.sessions enable row level security;
alter table biology.homework enable row level security;
alter table biology.results enable row level security;
alter table biology.rate_limits enable row level security;
revoke all on all tables in schema biology from public, anon, authenticated;
alter default privileges in schema biology revoke all on tables from public, anon, authenticated;
-- Initial admin and teacher accounts are seeded separately; only salted password hashes are stored.
