-- ============================================================
-- Be Voice — Schema Update + Seed Data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ─── 1. CLEAR ALL CONTENT DATA ───────────────────────────────
TRUNCATE TABLE
  public.review_images,
  public.reviews,
  public.user_agreements,
  public.clinics,
  public.treatments
RESTART IDENTITY CASCADE;

-- ─── 2. ALTER REVIEWS TABLE ──────────────────────────────────
-- Remove old single-field columns
ALTER TABLE public.reviews
  DROP COLUMN IF EXISTS body,
  DROP COLUMN IF EXISTS rating;

-- Add new structured columns
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS body_part       TEXT,
  ADD COLUMN IF NOT EXISTS anesthesia      TEXT,
  ADD COLUMN IF NOT EXISTS price_type      TEXT,
  ADD COLUMN IF NOT EXISTS is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  -- 8-item score (1–5 each)
  ADD COLUMN IF NOT EXISTS score_doctor    SMALLINT CHECK (score_doctor    BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS score_counseling SMALLINT CHECK (score_counseling BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS score_anesthesia SMALLINT CHECK (score_anesthesia BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS score_aftercare SMALLINT CHECK (score_aftercare  BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS score_price     SMALLINT CHECK (score_price      BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS score_staff     SMALLINT CHECK (score_staff      BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS score_facility  SMALLINT CHECK (score_facility   BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS score_downtime  SMALLINT CHECK (score_downtime   BETWEEN 1 AND 5),
  -- 5-section free text (500+ chars recommended)
  ADD COLUMN IF NOT EXISTS body_reason      TEXT,
  ADD COLUMN IF NOT EXISTS body_counseling  TEXT,
  ADD COLUMN IF NOT EXISTS body_experience  TEXT,
  ADD COLUMN IF NOT EXISTS body_satisfaction TEXT,
  ADD COLUMN IF NOT EXISTS body_advice      TEXT;

-- ─── 3. SEED: CLINICS ────────────────────────────────────────
INSERT INTO public.clinics (slug, name, description, address, website_url, is_published) VALUES
  ('shonan-beauty-shibuya',  '湘南美容クリニック 渋谷院',    '全国展開の大手美容外科。豊富な症例数と価格の透明性で人気。', '東京都渋谷区渋谷2-22-3', 'https://www.s-b-c.net', true),
  ('tokyo-chuou-biyo',       '東京中央美容外科 新宿院',      '形成外科専門医が在籍する中堅クリニック。カウンセリング重視。', '東京都新宿区西新宿1-5-11', 'https://tcb-top.com', true),
  ('shinjuku-laclinic',      '新宿ラクリニック',             '完全予約制・少人数対応で丁寧なカウンセリングが定評。', '東京都新宿区新宿3-15-15', 'https://laclinic.jp', true);

-- ─── 4. SEED: TREATMENTS ─────────────────────────────────────
INSERT INTO public.treatments (slug, name, description, category, is_published) VALUES
  ('futae-mabuta',       '二重整形（埋没法）',     '糸で二重のラインを形成する低侵襲な手術。ダウンタイムが比較的短い。', '美容医療', true),
  ('hyaluronic-acid',    'ヒアルロン酸注入',       '鼻・唇・法令線などに注入して形を整える非手術的施術。', '美容医療', true),
  ('hifu-lift',          'HIFUリフトアップ',       '超音波で皮膚深部を刺激し、リフトアップ・小顔効果を得る施術。', '美容医療', true),
  ('fat-removal',        '脂肪吸引',               'カニューレで脂肪を吸引除去する根本的ボディメイク手術。', '美容医療', true),
  ('laser-hair-removal', '医療レーザー脱毛',       '医療用レーザーで毛根を破壊する永久脱毛施術。', '美容医療', true),
  ('botox',              'ボトックス注射',          'ボツリヌストキシンでエラ・額・眉間のシワや張りを改善する注射。', '美容医療', true),
  ('pico-laser',         'ピコレーザー',            'シミ・くすみ・毛穴などを超短パルスレーザーで改善する施術。', '美容医療', true),
  ('ganken-kashui',      '眼瞼下垂手術',           '垂れ下がったまぶたを切開・縫合でリフトし、視野と目元を改善する手術。', '美容医療', true);

-- ─── 5. SEED: REVIEWS ────────────────────────────────────────
-- Uses the first available profile in the DB as the author.
-- Make sure you are logged in to the app at least once before running this.
DO $$
DECLARE
  uid         UUID;
  clinic1_id  UUID;
  clinic2_id  UUID;
  clinic3_id  UUID;
  t_futae     UUID;
  t_hyal      UUID;
  t_hifu      UUID;
  t_fat       UUID;
  t_laser     UUID;
  t_botox     UUID;
  t_pico      UUID;
  t_ganken    UUID;
BEGIN
  -- Get first user
  SELECT id INTO uid FROM public.profiles LIMIT 1;
  IF uid IS NULL THEN
    RAISE EXCEPTION 'No user profile found. Please log in to the app first, then re-run this script.';
  END IF;

  -- Get IDs
  SELECT id INTO clinic1_id FROM public.clinics WHERE slug = 'shonan-beauty-shibuya';
  SELECT id INTO clinic2_id FROM public.clinics WHERE slug = 'tokyo-chuou-biyo';
  SELECT id INTO clinic3_id FROM public.clinics WHERE slug = 'shinjuku-laclinic';
  SELECT id INTO t_futae    FROM public.treatments WHERE slug = 'futae-mabuta';
  SELECT id INTO t_hyal     FROM public.treatments WHERE slug = 'hyaluronic-acid';
  SELECT id INTO t_hifu     FROM public.treatments WHERE slug = 'hifu-lift';
  SELECT id INTO t_fat      FROM public.treatments WHERE slug = 'fat-removal';
  SELECT id INTO t_laser    FROM public.treatments WHERE slug = 'laser-hair-removal';
  SELECT id INTO t_botox    FROM public.treatments WHERE slug = 'botox';
  SELECT id INTO t_pico     FROM public.treatments WHERE slug = 'pico-laser';
  SELECT id INTO t_ganken   FROM public.treatments WHERE slug = 'ganken-kashui';

  -- ── Review 1: 二重整形 (from Wegic /review/1) ──────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-futae-001', uid, clinic1_id, t_futae,
    '二重整形（埋没法・4点留め・〇〇式）',
    '目元', '局所麻酔', '通常価格', 180000, '2025年11月', true,
    5, 4, 4, 5, 4, 5, 4, 3,
    '友人の紹介で、カウンセリングが丁寧という評判を聞いて決めました。他院と比較して、リスクについても正直に説明してくれた点が決め手でした。価格は平均的でしたが、信頼感を優先しました。',
    '医師は丁寧でしたが、待ち時間が1時間以上ありました。カウンセリング自体は30分ほどで、希望のデザインについて細かく相談できました。ただ、スタッフの対応がやや事務的だった印象です。',
    '麻酔は効いていましたが、引っ張られる感覚がありました。術後の腫れは3日ほどで落ち着きました。痛みは想定内でしたが、内出血が予想より目立ち、メイクで隠すのが大変でした。',
    '仕上がりは80%満足です。幅は希望通りですが、左右で若干の差があります。医師からは「時間とともに馴染む」と説明を受けていますが、少し気になっています。',
    'カウンセリングで遠慮せずに質問することが大切です。特にダウンタイムの実際の期間と、取れるリスクについて具体的に聞いておくべきでした。写真を見せながら相談するのもおすすめです。',
    'approved', '2025-11-20 09:00:00+09'
  );

  -- ── Review 2: ヒアルロン酸（鼻） ──────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-hyal-nose-002', uid, clinic2_id, t_hyal,
    'ヒアルロン酸注入で鼻筋を高くした体験談',
    '鼻', 'なし', '通常価格', 55000, '2025年10月', true,
    4, 5, 5, 4, 4, 5, 4, 4,
    'SNSで見た仕上がり写真がきれいで興味を持ちました。メスを使わない点と、気に入らなければ溶かせるという安心感が決め手でした。カウンセリングは無料で気軽に行けました。',
    '担当医は希望の高さや形を写真で確認しながら丁寧に説明してくれました。押しつけがましくなく、私のペースで決められる雰囲気がよかったです。所要時間は説明込みで約45分でした。',
    '針を刺す瞬間は少しチクッとしましたが、表面麻酔を塗っていたので思ったより痛くなかったです。施術自体は10分ほどで終了。直後から少し腫れましたが、翌日にはほぼ落ち着きました。',
    '鼻筋がすっきりして、横顔がきれいになりました。自然な仕上がりで家族にも気づかれない程度。3ヶ月ほど経ちますが形が少し崩れてきた気がするので、維持のためのコストは考えておく必要があります。',
    '「なんとなくやってみたい」という気持ちだけで行くのはおすすめしません。どの部位に何cc入れるのか、溶解した場合の費用感も事前に確認しておくと安心です。カウンセリングで気兼ねなく聞いてみてください。',
    'approved', '2025-10-15 10:00:00+09'
  );

  -- ── Review 3: HIFUリフトアップ ────────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-hifu-003', uid, clinic3_id, t_hifu,
    'HIFU（ウルセラ）でフェイスリフト。効果と痛みの正直レポ',
    '顔全体', 'なし', 'モニター価格', 98000, '2025年9月', false,
    3, 4, 3, 3, 4, 4, 4, 3,
    '40代に差し掛かりフェイスラインのたるみが気になり始めました。外科手術はハードルが高く、ダウンタイムのないHIFUを選択。モニター価格で通常の半額程度だったことも大きな理由です。',
    'カウンセリングでは期待できる効果と限界について正直に説明を受けました。「すぐに劇的な変化は感じにくい」との事前説明があり、むしろ信頼感が増しました。施術前の写真を撮ってくれたのも良かったです。',
    '痛みは正直かなりありました。特に頬骨まわりと顎のラインは「ズキズキ」する感覚が続き、途中で休憩を挟んでもらいました。施術後の赤みは数時間で引きましたが、翌日まで顔がほてる感じが続きました。',
    '1ヶ月後から少しずつリフトアップを感じ始めました。写真で比べると確かにフェイスラインがすっきりした印象ですが、期待していた劇的変化ではありませんでした。個人差が大きい施術だと感じます。',
    '痛みに弱い方は鎮痛剤の服用や麻酔クリームを事前に相談することをおすすめします。効果には個人差があるため、「必ず若返る」と過度な期待を持ちすぎないことが大切。写真で記録を残しておくと変化が分かりやすいです。',
    'approved', '2025-09-28 11:00:00+09'
  );

  -- ── Review 4: 脂肪吸引 ────────────────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-fat-004', uid, clinic1_id, t_fat,
    '脂肪吸引（腹部・両脇腹）の全記録。ダウンタイム1ヶ月の変化',
    '腹部・脇腹', '全身麻酔', '通常価格', 380000, '2025年8月', true,
    5, 5, 5, 5, 3, 5, 5, 4,
    '食事制限や運動では落ちない腹部の脂肪に長年悩んでいました。40代を前に思い切って脂肪吸引を決断。複数院のカウンセリングを経て、症例写真の自然さと担当医の説明の誠実さでこちらに決めました。',
    '担当医は3D画像で術後のシミュレーションを見せてくれました。吸引量・デザイン・リスクについて2回のカウンセリングを経て手術日を決定。過度な期待を持たせない、誠実な対応が印象的でした。',
    '全身麻酔なので手術中の記憶はありません。目が覚めたときは圧迫ガードルを着用した状態で、腹部全体の重だるさがありました。術後3日間は動くのがつらく、寝たり起きたりの生活。1週間で仕事復帰しましたが、腫れと内出血は3週間ほど続きました。',
    '術後1ヶ月でウエストが8cm細くなりました。鏡を見るたびにモチベーションが上がっています。ただ皮膚のごつごつ感（拘縮）が残っており、完成形には術後3〜6ヶ月かかると説明を受けています。価格は高額でしたが後悔はありません。',
    '脂肪吸引は手術です。事前に複数院のカウンセリングを受け、担当医の実績・施術方針をよく確認してください。ダウンタイムは長いため、仕事の繁忙期を避けて余裕を持ってスケジューリングすることを強くおすすめします。',
    'approved', '2025-08-10 09:30:00+09'
  );

  -- ── Review 5: 医療レーザー脱毛 ───────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-laser-005', uid, clinic2_id, t_laser,
    '医療レーザー脱毛（全身）6回コース完走。毛量の変化を正直に記録',
    '全身', 'なし', 'コース価格', 248000, '2025年7月', false,
    4, 4, 3, 4, 5, 4, 4, 4,
    'エステ脱毛を3年続けても効果が薄く、思い切って医療脱毛に乗り換えました。全身コースの価格を複数院で比較し、最もコスパが良いと感じたこちらに決めました。',
    '初回カウンセリングでは肌の状態を確認し、照射できる部位・できない部位を説明してもらえました。スタッフの対応は丁寧でしたが、オプション勧誘がやや強く感じる場面もありました。',
    '照射の痛みはゴムでパチンとはじかれる感じ。VIOが特に痛く、毎回少し気合いが必要でした。照射後は赤みが出ますが、数時間で収まります。6回通うと毎回の照射時間も徐々に短くなっていきました。',
    '6回終了後の毛量は施術前の約2割程度。自己処理の頻度が劇的に減り、肌荒れもなくなりました。完全にゼロにはなっていませんが、日常のストレスが大幅に軽減されました。コース延長は追加費用が必要なので事前確認を。',
    '脱毛は日焼けした状態では受けられないため、夏は施術が制限されます。スケジュールは年間を見通して計画的に。また毛周期の関係で2ヶ月に1回のペースが理想です。通いやすさ（立地・予約取りやすさ）を重視してクリニック選びをするとよいです。',
    'approved', '2025-07-22 14:00:00+09'
  );

  -- ── Review 6: 目の下のクマ治療 ───────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-kuma-006', uid, clinic3_id, t_futae,
    '目の下のたるみ・クマ（経結膜脱脂法）で10歳若返った気がする話',
    '目元', '局所麻酔', '通常価格', 220000, '2025年6月', true,
    5, 4, 5, 5, 3, 4, 5, 4,
    '30代後半からクマとたるみが酷くなり、目元が疲れて見えると言われるようになりました。コンシーラーでは限界を感じ、経結膜脱脂法を選択。まぶたに傷が残らない点と、回復が比較的早い点が決め手です。',
    '担当医は目の下の構造を図解で説明してくれました。「脱脂だけで十分か、脂肪注入も必要か」を一緒に検討でき、私は脱脂のみで進めることになりました。カウンセリングは1時間かけて丁寧に行われました。',
    '局所麻酔の注射が一番の山場でした。術中は引っ張られる感覚はあるものの、痛みはほぼありませんでした。術後は目の周りが腫れ、1週間はサングラスが必要でした。内出血は10日ほどで消えました。',
    '術後3週間で劇的な変化を実感しました。クマが消え、目元がすっきりして若々しくなったと複数の知人から言われました。「手術した？」ではなく「なんか最近いい感じだね」と言われる変化が理想通りです。',
    '経結膜脱脂は技術差が出やすい施術です。担当医の症例数・専門性を必ず確認してください。術後の過ごし方（うつむき姿勢を減らす、ナトリウム制限など）が仕上がりに影響するので、アフターケアの説明をきちんと聞いておくことが重要です。',
    'approved', '2025-06-05 13:00:00+09'
  );

  -- ── Review 7: エラボトックス ──────────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-botox-007', uid, clinic1_id, t_botox,
    'エラボトックスで小顔に。4ヶ月後の変化と継続するかの判断',
    '顎・エラ', 'なし', '通常価格', 44000, '2025年5月', false,
    4, 4, 4, 3, 5, 4, 4, 4,
    '噛み合わせが強く、エラが張っているのが長年のコンプレックスでした。手術なしで試せるボトックスは初めの一歩として最適だと考え、友人の紹介でこちらのクリニックへ。',
    '担当医にエラの張りの原因（筋肉か骨格か）を確認してもらい、私の場合は筋肉が大きいタイプで効果が出やすいと説明を受けました。施術は5分ほどで完了。特別な準備は不要でした。',
    '細い針で数カ所注射するだけで、痛みはほとんどありませんでした。施術直後から変化はなく、効果が出始めたのは2週間後ほどから。少しずつエラが細くなっていくのを鏡で確認できました。',
    '1ヶ月後にはフェイスラインが明らかにスリムになり、顔が縦長に見えるようになりました。効果の持続は4〜6ヶ月とのことで、現在はメンテナンスとして半年に1回継続しています。継続費用は計算に入れておく必要があります。',
    'エラボトックスは効果が出るまで2週間ほどかかります。「すぐに変わらない」と焦らないことが大切。効果の出方には個人差があり、骨格が原因の場合は効果が薄いこともあります。事前に担当医に骨格か筋肉かを確認してもらうことをおすすめします。',
    'approved', '2025-05-18 16:00:00+09'
  );

  -- ── Review 8: 唇ヒアルロン酸 ─────────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-hyal-lip-008', uid, clinic2_id, t_hyal,
    '唇ヒアルロン酸（ボリュームアップ）のリアルな体験。失敗談も含めて',
    '唇', '表面麻酔', '通常価格', 65000, '2025年4月', false,
    3, 3, 3, 3, 3, 4, 4, 3,
    '薄い唇にずっとコンプレックスを感じており、メイクでボリューム感を出すことに限界を感じていました。ダウンタイムが短く気軽に試せると聞き予約しました。',
    'カウンセリングでは仕上がりのイメージを写真で共有しましたが、「何ccが適切か」の具体的な説明は少なく、お任せ状態になってしまいました。もっと詳しく聞けばよかったと反省しています。',
    '表面麻酔をしてもらいましたが、唇は敏感なためかなり痛みがありました。施術後は唇が3倍近く腫れて少し驚きましたが、翌日には落ち着きました。内出血が出たため、当日は外出が少し恥ずかしかったです。',
    '落ち着いた後の仕上がりは思ったより控えめで、周囲からも変化に気づかれませんでした。もう少し入れてもよかったかもしれません。溶けるスピードは個人差があるようで、私は3ヶ月ほどでほぼ元に戻ってしまいました。',
    '唇のヒアルロン酸はやり過ぎると不自然になるため、最初は控えめの量から始めることをおすすめします。カウンセリングで使用量を具体的に聞いておきましょう。また内出血に備えて、重要なイベントの直前は避けてスケジュールを組んでください。',
    'approved', '2025-04-10 11:30:00+09'
  );

  -- ── Review 9: ピコレーザー ────────────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-pico-009', uid, clinic3_id, t_pico,
    'ピコレーザーでシミ・くすみが改善。3回施術した結果を正直に報告',
    '肌全体（顔）', 'なし', '通常価格', 82000, '2025年3月', true,
    5, 5, 4, 5, 4, 5, 5, 5,
    '30代から増えてきたシミとくすみが気になり、化粧品での対策に限界を感じていました。ダウンタイムが短いピコレーザーを選択。担当医の症例写真の仕上がりが自然で好印象でした。',
    'カウンセリングでは顔全体の状態をスキャナーで分析し、シミの種類（日光性か肝斑か）を見極めてもらいました。肝斑には照射を強くしすぎると悪化することがあると丁寧に説明してくれました。',
    'フラッシュを浴びるような感覚で、痛みはほとんどありません。施術後は少し赤くなりますが、数時間で落ち着きます。大きなシミは一時的にかさぶたになりますが、1週間ほどで自然にポロっと取れました。ダウンタイムはほぼありませんでした。',
    '1回でも明るさの変化を感じ、3回終了後は肌のトーンが明らかに上がりました。シミのうち6〜7割はほぼ目立たなくなりました。くすみ改善も実感しており、メイクのノリが格段によくなった点が嬉しいです。',
    '日焼けをすると元に戻りやすいため、施術後のUVケアは必須です。徹底した日焼け対策が効果を持続させるカギです。肝斑がある場合は強い照射が逆効果になることもあるため、必ず専門医に診てもらってから施術を検討してください。',
    'approved', '2025-03-15 10:00:00+09'
  );

  -- ── Review 10: 眼瞼下垂 ──────────────────────────────────
  INSERT INTO public.reviews (
    slug, user_id, clinic_id, treatment_id, title,
    body_part, anesthesia, price_type, cost, treatment_date, is_verified,
    score_doctor, score_counseling, score_anesthesia, score_aftercare,
    score_price, score_staff, score_facility, score_downtime,
    body_reason, body_counseling, body_experience, body_satisfaction, body_advice,
    status, published_at
  ) VALUES (
    'review-ganken-010', uid, clinic1_id, t_ganken,
    '眼瞼下垂（まぶたが開きにくい）手術の記録。術後3ヶ月の変化',
    '目元', '局所麻酔', '通常価格', 275000, '2025年2月', true,
    4, 5, 4, 5, 4, 5, 4, 4,
    '以前から「目が眠そう」「疲れてる？」と言われ続けていました。まぶたを開けるために額の筋肉を使っており、夕方になると頭痛が出るほどでした。機能的な問題もあり、眼瞼下垂手術を決意しました。',
    '形成外科専門医との丁寧なカウンセリングで、私の状態が「腱膜性眼瞼下垂」と診断されました。切開ラインの設計を一緒に確認し、二重のデザインも同時に相談できました。2回のカウンセリング後に手術日を設定しました。',
    '局所麻酔の注射が緊張しましたが、術中の痛みはありませんでした。手術は約2時間。術後は眼帯をして帰宅。翌日から腫れがかなり強く出て、1週間は外出がためらわれるほどでした。抜糸は1週間後。腫れが引いてきたのは3週間ほどからでした。',
    '術後3ヶ月で仕上がりがほぼ安定しました。目が自然に大きく開くようになり、以前の「眠そう」な印象が完全に消えました。額のシワと頭痛も解消され、生活の質が劇的に向上しています。自分に自信が持てるようになりました。',
    '眼瞼下垂手術は形成外科専門医に依頼することを強くおすすめします。技術差が大きく出る手術です。術後のダウンタイムは1ヶ月程度を見込んでください。完成形は術後3〜6ヶ月後になるため、長期的な視点でスケジュールを組むことが大切です。',
    'approved', '2025-02-08 09:00:00+09'
  );

END;
$$;
