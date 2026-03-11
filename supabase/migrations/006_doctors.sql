-- doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  kana          TEXT,
  specialties   TEXT[]  NOT NULL DEFAULT '{}',
  clinic        TEXT,
  location      TEXT,
  review_count  INT     NOT NULL DEFAULT 0,
  photo_url     TEXT,
  career        TEXT[]  NOT NULL DEFAULT '{}',
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  societies     TEXT[]  NOT NULL DEFAULT '{}',
  treatments    TEXT[]  NOT NULL DEFAULT '{}',
  stats         JSONB,
  recent_reviews JSONB,
  is_published  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doctors_public_read"   ON public.doctors FOR SELECT USING (is_published = true);
CREATE POLICY "doctors_admin_select"  ON public.doctors FOR SELECT TO authenticated USING (true);
CREATE POLICY "doctors_admin_insert"  ON public.doctors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "doctors_admin_update"  ON public.doctors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "doctors_admin_delete"  ON public.doctors FOR DELETE TO authenticated USING (true);

-- Seed data
INSERT INTO public.doctors (name, kana, specialties, clinic, location, review_count, photo_url, career, qualifications, societies, treatments, stats, recent_reviews) VALUES
(
  '田中 美咲', 'たなか みさき',
  ARRAY['形成外科', '美容外科'],
  '銀座アルテ美容外科クリニック', '東京都（銀座・都心エリア）', 38,
  'https://cdn.wegic.ai/assets/onepage/agent/images/1772435860720.jpg?imageMogr2/format/webp',
  ARRAY['2003年 東京大学医学部卒業','2003〜2009年 東京大学附属病院 形成外科','2009〜2015年 都内複数クリニック 美容外科','2015年〜 銀座アルテ美容外科クリニック 院長'],
  ARRAY['日本形成外科学会専門医','日本美容外科学会（JSAPS）専門医','医学博士'],
  ARRAY['日本形成外科学会','日本美容外科学会（JSAPS）','日本レーザー医学会'],
  ARRAY['二重整形（埋没法・切開法）','目頭切開・目尻切開','鼻整形（隆鼻術・鼻尖形成）','フェイスリフト','脂肪吸引','ヒアルロン酸注入','ボトックス注射'],
  '{"total":38,"satisfaction":[{"label":"満足","count":19,"pct":50},{"label":"やや満足","count":11,"pct":29},{"label":"経過観察中","count":6,"pct":16},{"label":"後悔","count":2,"pct":5}],"categories":[{"label":"目元","count":18,"pct":100},{"label":"鼻","count":9,"pct":50},{"label":"輪郭・フェイスライン","count":6,"pct":33},{"label":"注入系","count":5,"pct":28}]}',
  '[{"treatment":"二重整形（切開法）","date":"2025年11月","status":"やや満足","statusColor":"bg-gray-100 text-gray-600","body":"カウンセリングでは、希望をじっくり聞いてもらえました。術後の腫れは予想より長引きましたが、担当スタッフのフォローは丁寧でした。"},{"treatment":"隆鼻術（プロテーゼ）","date":"2025年9月","status":"満足","statusColor":"bg-brand-50 text-brand-700","body":"初回カウンセリングから術後3ヶ月まで、経過の記録を細かくとっています。仕上がりは当初の説明と概ね一致していたと感じています。"},{"treatment":"ヒアルロン酸注入（鼻筋）","date":"2025年8月","status":"経過観察中","statusColor":"bg-amber-50 text-amber-700","body":"施術時間は短く、痛みの管理は丁寧でした。効果の持続期間については引き続き経過観察中です。"}]'
),
(
  '佐藤 健一', 'さとう けんいち',
  ARRAY['皮膚科', '美容皮膚科'],
  '表参道スキンクリニック', '東京都（表参道・青山エリア）', 24,
  'https://cdn.wegic.ai/assets/onepage/agent/images/1772435884138.jpg?imageMogr2/format/webp',
  ARRAY['2005年 慶應義塾大学医学部卒業','2005〜2010年 慶應義塾大学病院 皮膚科','2010〜2016年 大手美容皮膚科クリニック','2016年〜 表参道スキンクリニック 院長'],
  ARRAY['日本皮膚科学会専門医','日本美容皮膚科学会会員','日本レーザー医学会認定医'],
  ARRAY['日本皮膚科学会','日本美容皮膚科学会','日本レーザー医学会'],
  ARRAY['レーザートーニング','フォトフェイシャル','ピコレーザー','ヒアルロン酸注入','ボトックス注射','スキンブースター'],
  '{"total":24,"satisfaction":[{"label":"満足","count":14,"pct":58},{"label":"やや満足","count":7,"pct":29},{"label":"経過観察中","count":2,"pct":9},{"label":"後悔","count":1,"pct":4}],"categories":[{"label":"レーザー系","count":11,"pct":100},{"label":"注入系","count":8,"pct":73},{"label":"スキンケア系","count":5,"pct":45}]}',
  '[{"treatment":"ピコレーザー（肝斑治療）","date":"2025年10月","status":"やや満足","statusColor":"bg-gray-100 text-gray-600","body":"治療計画を丁寧に説明してもらい、複数回にわたる施術スケジュールも事前に共有されました。肌の変化は緩やかで、現在も継続中です。"},{"treatment":"ヒアルロン酸注入（ほうれい線）","date":"2025年9月","status":"満足","statusColor":"bg-brand-50 text-brand-700","body":"カウンセリングでは過剰な量を勧められることなく、控えめな量から始めることを提案されました。自然な仕上がりに満足しています。"}]'
),
(
  '山本 恵理', 'やまもと えり',
  ARRAY['形成外科', '美容外科', '美容皮膚科'],
  '梅田フォレスト美容クリニック', '大阪府（梅田・大阪市内エリア）', 17,
  'https://cdn.wegic.ai/assets/onepage/agent/images/1772435882538.jpg?imageMogr2/format/webp',
  ARRAY['2007年 大阪大学医学部卒業','2007〜2012年 大阪大学附属病院 形成外科','2012〜2018年 関西圏の美容外科クリニック','2018年〜 梅田フォレスト美容クリニック 副院長'],
  ARRAY['日本形成外科学会専門医','日本美容外科学会（JSAPS）会員','日本抗加齢医学会専門医'],
  ARRAY['日本形成外科学会','日本美容外科学会（JSAPS）','日本抗加齢医学会','日本皮膚科学会'],
  ARRAY['二重整形（埋没法・切開法）','目元リフトアップ','輪郭形成（骨切り・脂肪吸引）','豊胸術','ヒアルロン酸注入','ボトックス注射'],
  '{"total":17,"satisfaction":[{"label":"満足","count":9,"pct":53},{"label":"やや満足","count":5,"pct":29},{"label":"経過観察中","count":2,"pct":12},{"label":"後悔","count":1,"pct":6}],"categories":[{"label":"目元","count":8,"pct":100},{"label":"輪郭・フェイスライン","count":5,"pct":63},{"label":"注入系","count":4,"pct":50}]}',
  '[{"treatment":"二重整形（埋没法）","date":"2025年10月","status":"満足","statusColor":"bg-brand-50 text-brand-700","body":"丁寧なカウンセリングで、シミュレーションを何度も試させてもらいました。術後の腫れは1週間程度で引き、現在は安定しています。"}]'
);
