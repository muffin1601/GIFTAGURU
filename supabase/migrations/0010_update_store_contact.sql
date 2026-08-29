-- The support email seeded in 0003 was a placeholder. Point it at the real
-- Gifta Guru inbox.

update public.store_settings
set value = '"giftaguru27@gmail.com"'::jsonb
where key = 'support_email';
