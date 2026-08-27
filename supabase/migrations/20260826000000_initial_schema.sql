create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username is null or btrim(username) <> ''),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  brand text,
  category text,
  description text,
  image_url text,
  price numeric(12, 2) check (price is null or price >= 0),
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text not null check (btrim(title) <> ''),
  content text not null check (btrim(content) <> ''),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.review_analysis (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  summary text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  themes text[] not null default '{}',
  sentiment text,
  generated_at timestamptz not null default now()
);

create index products_name_search_idx on public.products using gin (name gin_trgm_ops);
create index products_brand_search_idx on public.products using gin (brand gin_trgm_ops);
create index products_category_idx on public.products (category);
create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_user_id_idx on public.reviews (user_id);
create index reviews_created_at_idx on public.reviews (created_at desc);
create index favorites_product_id_idx on public.favorites (product_id);
create index favorites_user_id_idx on public.favorites (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.review_analysis enable row level security;

create policy "Products are publicly readable"
on public.products for select
using (true);

create policy "Reviews are publicly readable"
on public.reviews for select
using (true);

create policy "Authenticated users can create their own reviews"
on public.reviews for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own reviews"
on public.reviews for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own reviews"
on public.reviews for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own favorites"
on public.favorites for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own favorites"
on public.favorites for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own favorites"
on public.favorites for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Review analysis is publicly readable"
on public.review_analysis for select
using (true);