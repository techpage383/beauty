-- ============================================================
-- Be Voice — Replace all treatments with 3 category treatments
-- Run this in Supabase SQL Editor
-- ============================================================

-- Clear existing treatments (nullifies treatment_id on reviews via FK)
TRUNCATE TABLE public.treatments RESTART IDENTITY CASCADE;

-- Insert exactly 3 treatments, one per category
INSERT INTO public.treatments (slug, name, description, category, is_published) VALUES
  ('biyo-iryo',       '美容医療',     '二重整形・脂肪吸引・ヒアルロン酸注入・レーザー治療など、美容目的の医療施術全般。', '美容医療',     true),
  ('funin-chiryo',    '不妊治療',     '体外受精・顕微授精・人工授精など、妊娠を目的とした生殖補助医療全般。',             '不妊治療',     true),
  ('seibetsu-tekigo', '性別適合手術', '性別適合手術・ホルモン療法など、性別移行に関わる医療処置全般。',                   '性別適合手術', true);
