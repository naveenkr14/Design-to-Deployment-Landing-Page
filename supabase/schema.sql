-- Loop SaaS — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type plan_type as enum ('free', 'solo', 'studio');
create type project_status as enum ('waiting', 'ready', 'approved');

-- Users (extends Supabase auth.users)
create table public.users (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text not null,
  name               text,
  stripe_customer_id text unique,
  plan               plan_type not null default 'free',
  created_at         timestamptz not null default now()
);

-- Projects
create table public.projects (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references public.users(id) on delete cascade,
  name        text not null,
  client_name text,
  status      project_status not null default 'waiting',
  deadline    date,
  created_at  timestamptz not null default now()
);

-- Files
create table public.files (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  file_url    text not null,
  file_name   text,
  uploaded_at timestamptz not null default now()
);

-- Comments with pin coordinates (0-100 percentages)
create table public.comments (
  id          uuid primary key default uuid_generate_v4(),
  file_id     uuid not null references public.files(id) on delete cascade,
  author_id   uuid references public.users(id) on delete set null,
  author_name text,
  pin_x       float not null,
  pin_y       float not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

-- Approvals
create table public.approvals (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  approved_by_name text not null,
  approved_at      timestamptz not null default now()
);

-- Row Level Security
alter table public.users     enable row level security;
alter table public.projects  enable row level security;
alter table public.files     enable row level security;
alter table public.comments  enable row level security;
alter table public.approvals enable row level security;

-- RLS Policies
create policy "users_own" on public.users for all using (auth.uid() = id);
create policy "projects_own" on public.projects for all using (auth.uid() = owner_id);
create policy "files_via_project" on public.files for all using (
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "comments_via_file" on public.comments for all using (
  exists (
    select 1 from public.files f
    join public.projects p on p.id = f.project_id
    where f.id = file_id and p.owner_id = auth.uid()
  )
);
create policy "approvals_via_project" on public.approvals for all using (
  exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

-- Enable realtime for comments table
alter publication supabase_realtime add table public.comments;

-- Storage bucket for uploaded files
-- Run in Supabase Dashboard > Storage > Create bucket named "files", set to Public
