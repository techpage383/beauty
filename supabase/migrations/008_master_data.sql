-- Doctor specialties master
CREATE TABLE IF NOT EXISTS public.doctor_specialties (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  sort_order INT  NOT NULL DEFAULT 0
);

ALTER TABLE public.doctor_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "specialties_public_read" ON public.doctor_specialties FOR SELECT USING (true);
CREATE POLICY "specialties_admin_all"   ON public.doctor_specialties FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.doctor_specialties (name, sort_order) VALUES
  ('形成外科',     10),
  ('美容外科',     20),
  ('皮膚科',       30),
  ('美容皮膚科',   40),
  ('眼科',         50),
  ('産婦人科',     60),
  ('泌尿器科',     70),
  ('内科',         80),
  ('外科',         90),
  ('耳鼻咽喉科',  100)
ON CONFLICT (name) DO NOTHING;

-- Doctor regions master
CREATE TABLE IF NOT EXISTS public.doctor_regions (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  sort_order INT  NOT NULL DEFAULT 0
);

ALTER TABLE public.doctor_regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regions_public_read" ON public.doctor_regions FOR SELECT USING (true);
CREATE POLICY "regions_admin_all"   ON public.doctor_regions FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.doctor_regions (name, sort_order) VALUES
  ('北海道',               10),
  ('東北',                 20),
  ('東京都',               30),
  ('神奈川県',             40),
  ('埼玉・千葉・茨城',    50),
  ('愛知・名古屋',         60),
  ('大阪府',               70),
  ('京都・兵庫',           80),
  ('広島・岡山',           90),
  ('福岡県',              100),
  ('沖縄県',              110)
ON CONFLICT (name) DO NOTHING;
