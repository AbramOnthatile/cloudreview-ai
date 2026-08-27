create unique index if not exists reviews_user_product_unique_idx
on public.reviews (user_id, product_id);