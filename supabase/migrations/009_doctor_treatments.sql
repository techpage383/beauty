-- Doctor treatments master
CREATE TABLE IF NOT EXISTS public.doctor_treatment_options (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  sort_order INT  NOT NULL DEFAULT 0
);

ALTER TABLE public.doctor_treatment_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treatment_options_public_read" ON public.doctor_treatment_options FOR SELECT USING (true);
CREATE POLICY "treatment_options_admin_all"   ON public.doctor_treatment_options FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.doctor_treatment_options (name, sort_order) VALUES
  ('二重整形（埋没法）',       10),
  ('二重整形（切開法）',       20),
  ('目頭切開・目尻切開',       30),
  ('目元リフトアップ',         40),
  ('鼻整形（隆鼻術）',         50),
  ('鼻尖形成',                 60),
  ('フェイスリフト',           70),
  ('輪郭形成（骨切り）',       80),
  ('脂肪吸引',                 90),
  ('豊胸術',                  100),
  ('ヒアルロン酸注入',        110),
  ('ボトックス注射',          120),
  ('スキンブースター',        130),
  ('レーザートーニング',      140),
  ('フォトフェイシャル',      150),
  ('ピコレーザー',            160),
  ('医療脱毛',                170),
  ('ニキビ・毛穴治療',        180)
ON CONFLICT (name) DO NOTHING;
