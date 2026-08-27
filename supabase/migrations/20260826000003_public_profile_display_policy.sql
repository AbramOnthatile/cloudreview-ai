create policy "Public profile names are readable"
on public.profiles for select
using (true);