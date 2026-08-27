alter table public.review_analysis
add column if not exists mode text not null default 'demo'
check (mode in ('demo', 'openai'));