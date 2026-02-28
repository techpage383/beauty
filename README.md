# True Log — 美容医療口コミプラットフォーム

> 美容医療分野に特化した「信頼できる体験口コミ」を蓄積・活用するプラットフォーム。
> **Next.js + Supabase** による "作り直さないMVP" 設計。

---

## Table of Contents

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [アーキテクチャ設計](#3-アーキテクチャ設計)
4. [ディレクトリ構成](#4-ディレクトリ構成)
5. [データベース設計 (ER図)](#5-データベース設計-er図)
6. [環境構築 (ローカル開発)](#6-環境構築-ローカル開発)
7. [環境変数一覧](#7-環境変数一覧)
8. [画面一覧 & ルーティング設計](#8-画面一覧--ルーティング設計)
9. [機能仕様](#9-機能仕様)
10. [承認フロー (ワークフロー)](#10-承認フロー-ワークフロー)
11. [SEO設計](#11-seo設計)
12. [Supabase 設定](#12-supabase-設定)
13. [画像アップロード仕様](#13-画像アップロード仕様)
14. [管理者画面](#14-管理者画面)
15. [デプロイ戦略](#15-デプロイ戦略)
16. [MVP範囲外 (将来拡張)](#16-mvp範囲外-将来拡張)
17. [開発スケジュール](#17-開発スケジュール)
18. [費用・支払いスケジュール](#18-費用支払いスケジュール)

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| **サービス名** | True Log |
| **目的** | 美容医療の「信頼できる体験口コミ」を資産として蓄積・活用する |
| **ターゲット（メイン）** | 美容医療を真剣に検討している女性ユーザー |
| **ターゲット（サブ）** | 信頼性を重視する優良クリニック（将来参画想定） |
| **ブランドトーン** | 黒系・重厚・シック・高級感。視認性と可読性を確保した洗練された世界観 |
| **設計思想** | "作り直さないMVP" — 将来拡張を見越した資産として積み上がるプラットフォーム |

### Core Values

- **完全承認制** — 全投稿を目視審査し、情報の真実性・健全性を担保
- **SEO資産化** — 広告依存ではなく、積み上がるコンテンツ資産として集客基盤を構築
- **拡張可能DB設計** — OCR連携・モバイルアプリ化・API公開を見越した正規化設計
- **透明性** — Staging環境を常時共有し、クライアントが「動くもの」を常に確認できる体制

---

## 2. 技術スタック

### Frontend & Infrastructure

| 技術 | 用途 |
|---|---|
| **Next.js 14+** (App Router) | SSR / SSG 対応。動的ルーティングによるSEO最適化 |
| **TypeScript** | 型安全な開発。バグ低減と保守性向上 |
| **Tailwind CSS** | 一貫したデザインシステム。高速UI構築 |
| **Vercel** | 本番ホスティング。CDNによる高速配信 |

### Backend (Supabase)

| 技術 | 用途 |
|---|---|
| **Supabase (PostgreSQL)** | メインデータベース。正規化設計・大量データ対応 |
| **Supabase Auth** | メール認証。将来的なSNSログイン（Google/LINE）拡張対応 |
| **Supabase Storage** | 画像管理。公開領域（口コミ写真）・非公開領域（証拠画像）分離 |
| **Row Level Security (RLS)** | 行レベルでの厳密なアクセス制御 |
| **Edge Functions** | 将来のOCR連携・外部API統合のためのサーバーレス実行環境 |

### SEO

| 技術 | 用途 |
|---|---|
| **JSON-LD 構造化データ** | Review / FAQPage / BreadcrumbList スキーマ |
| **動的 Sitemap** | 新規投稿時に自動更新・Google通知 |
| **動的 metaタグ** | ページごとの title / description 最適化 |
| **動的ルーティング** | `/treatments/[slug]` / `/clinics/[slug]` / `/reviews/[slug]` |

---

## 3. アーキテクチャ設計

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (CDN)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Next.js App Router                 │   │
│  │                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │   │
│  │  │  Public    │  │   User     │  │    Admin       │ │   │
│  │  │  Pages     │  │   Pages    │  │    Pages       │ │   │
│  │  │  (SSG/SSR) │  │  (CSR+RLS) │  │  (Server-Side) │ │   │
│  │  └─────┬──────┘  └─────┬──────┘  └───────┬────────┘ │   │
│  └────────┼───────────────┼─────────────────┼──────────┘   │
└───────────┼───────────────┼─────────────────┼──────────────┘
            │               │                 │
            ▼               ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                             │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │PostgreSQL│  │   Auth   │  │ Storage  │  │  Edge Fn  │  │
│  │  + RLS   │  │  (JWT)   │  │(pub/priv)│  │(OCR Ready)│  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Storage 設計（公開 / 非公開分離）

```
supabase/storage/
├── review-images/        # 公開バケット (口コミ写真・ビフォーアフター)
│   └── {user_id}/{review_id}/{filename}
└── evidence-images/      # 非公開バケット (領収書・証拠画像)
    └── {user_id}/{review_id}/{filename}
```

---

## 4. ディレクトリ構成

```
truelog/
├── app/                          # Next.js App Router
│   ├── (public)/                 # 公開ページグループ
│   │   ├── page.tsx              # / トップページ
│   │   ├── treatments/
│   │   │   ├── page.tsx          # /treatments 施術一覧
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # /treatments/[slug] 施術詳細
│   │   ├── clinics/
│   │   │   ├── page.tsx          # /clinics クリニック一覧
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # /clinics/[slug] クリニック詳細
│   │   └── reviews/
│   │       └── [slug]/
│   │           └── page.tsx      # /reviews/[slug] 口コミ詳細
│   ├── (auth)/                   # 認証ページグループ
│   │   ├── login/
│   │   │   └── page.tsx          # /login ログイン
│   │   └── register/
│   │       └── page.tsx          # /register 新規登録
│   ├── (user)/                   # ログインユーザー専用グループ
│   │   ├── mypage/
│   │   │   └── page.tsx          # /mypage マイページ
│   │   ├── reviews/
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # /reviews/new 口コミ投稿
│   │   │   └── complete/
│   │   │       └── page.tsx      # /reviews/complete 投稿完了
│   ├── admin/                    # 管理者専用グループ
│   │   ├── layout.tsx            # 管理者レイアウト (認証ガード)
│   │   ├── login/
│   │   │   └── page.tsx          # /admin/login 管理者ログイン
│   │   ├── page.tsx              # /admin ダッシュボード
│   │   ├── reviews/
│   │   │   ├── page.tsx          # /admin/reviews 口コミ一覧管理
│   │   │   └── [id]/
│   │   │       └── page.tsx      # /admin/reviews/[id] 審査画面
│   │   ├── users/
│   │   │   └── page.tsx          # /admin/users ユーザー管理
│   │   └── logs/
│   │       └── page.tsx          # /admin/logs 操作ログ
│   ├── api/                      # API Routes
│   │   ├── reviews/
│   │   │   └── route.ts
│   │   ├── clinics/
│   │   │   └── route.ts
│   │   └── sitemap/
│   │       └── route.ts
│   ├── sitemap.ts                # 動的 Sitemap 生成
│   ├── robots.ts                 # robots.txt
│   └── layout.tsx                # ルートレイアウト
├── components/
│   ├── ui/                       # 汎用UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── StarRating.tsx
│   ├── review/                   # 口コミ関連
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewForm.tsx
│   │   └── ReviewImageUpload.tsx
│   ├── admin/                    # 管理画面関連
│   │   ├── ReviewSplitView.tsx
│   │   └── ApprovalActions.tsx
│   └── seo/                      # SEO関連
│       ├── JsonLd.tsx
│       └── BreadcrumbList.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # ブラウザ用クライアント
│   │   ├── server.ts             # サーバー用クライアント
│   │   └── middleware.ts         # 認証ミドルウェア
│   ├── utils/
│   │   ├── image.ts              # 画像圧縮・リサイズ・EXIF削除
│   │   ├── slug.ts               # スラッグ生成ユーティリティ
│   │   └── seo.ts                # メタデータ生成ヘルパー
│   └── validations/
│       └── review.ts             # Zod スキーマ定義
├── types/
│   ├── database.ts               # Supabase 自動生成型
│   └── index.ts                  # アプリ共通型定義
├── supabase/
│   ├── migrations/               # DB マイグレーションファイル
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_seed_data.sql
│   └── functions/                # Edge Functions
│       └── ocr-extract/          # 将来OCR連携用 (stub)
├── public/
│   └── images/
├── middleware.ts                  # Next.js ルート保護
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. データベース設計 (ER図)

### テーブル一覧

```
users              ← Supabase Auth と連携
profiles           ← ユーザープロフィール拡張
clinics            ← クリニックマスター
treatments         ← 施術マスター
reviews            ← 口コミ投稿 (メインテーブル)
review_images      ← 口コミ添付画像
evidence_images    ← 証拠画像 (非公開)
admin_actions      ← 審査操作ログ
user_agreements    ← 規約同意履歴
pending_clinics    ← 未登録クリニック申請
pending_treatments ← 未登録施術申請
```

### DDL (SQL)

```sql
-- ==========================================
-- profiles (ユーザープロフィール)
-- ==========================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,   -- BANフラグ
  role          TEXT NOT NULL DEFAULT 'user',    -- 'user' | 'admin'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- clinics (クリニックマスター)
-- ==========================================
CREATE TABLE clinics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,              -- /clinics/[slug]
  prefecture  TEXT,                             -- 都道府県
  area        TEXT,                             -- エリア (新宿, 渋谷, etc.)
  address     TEXT,
  website_url TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinics_slug ON clinics(slug);
CREATE INDEX idx_clinics_prefecture ON clinics(prefecture);

-- ==========================================
-- treatments (施術マスター)
-- ==========================================
CREATE TABLE treatments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,              -- /treatments/[slug]
  category    TEXT NOT NULL,                    -- 'eye' | 'nose' | 'skin' | etc.
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treatments_slug ON treatments(slug);
CREATE INDEX idx_treatments_category ON treatments(category);

-- ==========================================
-- reviews (口コミ投稿)
-- ==========================================
CREATE TABLE reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT NOT NULL UNIQUE,     -- /reviews/[slug]
  user_id               UUID NOT NULL REFERENCES profiles(id),
  clinic_id             UUID NOT NULL REFERENCES clinics(id),
  treatment_id          UUID NOT NULL REFERENCES treatments(id),

  -- 基本情報
  visited_at            DATE,                     -- 来院時期 (YYYY-MM)
  price                 INTEGER,                  -- 支払金額 (円)

  -- 評価情報
  rating_overall        SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_satisfaction   TEXT,                     -- 満足度コメント

  -- 体験詳細
  reason_for_choice     TEXT,                     -- 施術を選んだ理由
  counseling_impression TEXT,                     -- カウンセリングの印象
  during_treatment      TEXT,                     -- 施術中の感想
  downtime_detail       TEXT,                     -- ダウンタイムの様子
  result_satisfaction   TEXT,                     -- 結果の満足度

  -- ステータス管理
  status                TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  rejection_reason      TEXT,                     -- 差し戻し理由

  -- 同意確認
  agreed_to_terms       BOOLEAN NOT NULL DEFAULT FALSE,
  agreed_no_slander     BOOLEAN NOT NULL DEFAULT FALSE,

  -- タイムスタンプ
  submitted_at          TIMESTAMPTZ,              -- 審査申請日時
  approved_at           TIMESTAMPTZ,              -- 承認日時
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_user_id      ON reviews(user_id);
CREATE INDEX idx_reviews_clinic_id    ON reviews(clinic_id);
CREATE INDEX idx_reviews_treatment_id ON reviews(treatment_id);
CREATE INDEX idx_reviews_status       ON reviews(status);
CREATE INDEX idx_reviews_slug         ON reviews(slug);

-- ==========================================
-- review_images (口コミ写真 - 公開)
-- ==========================================
CREATE TABLE review_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,                    -- Supabase Storage パス
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- evidence_images (証拠画像 - 非公開)
-- ==========================================
CREATE TABLE evidence_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id    UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,                    -- 非公開バケットパス
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- admin_actions (審査操作ログ)
-- ==========================================
CREATE TABLE admin_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES profiles(id),
  review_id   UUID NOT NULL REFERENCES reviews(id),
  action      TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  reason      TEXT,                             -- 差し戻し理由
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_review_id ON admin_actions(review_id);
CREATE INDEX idx_admin_actions_admin_id  ON admin_actions(admin_id);

-- ==========================================
-- user_agreements (規約同意ログ)
-- ==========================================
CREATE TABLE user_agreements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id),
  version    TEXT NOT NULL,                     -- 'v1.0', 'v2.0', etc.
  agreed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_agreements_user_id ON user_agreements(user_id);

-- ==========================================
-- pending_clinics (未登録クリニック申請)
-- ==========================================
CREATE TABLE pending_clinics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES profiles(id),
  name        TEXT NOT NULL,
  prefecture  TEXT,
  area        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- pending_treatments (未登録施術申請)
-- ==========================================
CREATE TABLE pending_treatments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES profiles(id),
  name         TEXT NOT NULL,
  category     TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 6. 環境構築 (ローカル開発)

### 前提条件

- Node.js 20+
- pnpm (推奨) または npm
- Supabase CLI
- Git

### セットアップ手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/your-org/truelog.git
cd truelog

# 2. 依存パッケージをインストール
pnpm install

# 3. 環境変数を設定
cp .env.example .env.local
# .env.local を編集 (後述の環境変数一覧を参照)

# 4. Supabase をローカル起動
supabase start

# 5. マイグレーションを実行
supabase db push

# 6. シードデータを投入 (クリニック・施術マスター)
supabase db seed

# 7. 開発サーバーを起動
pnpm dev
```

ブラウザで `http://localhost:3000` を開く。

### Supabase ローカル確認

```bash
# Supabase Studio (DB管理UI)
open http://localhost:54323

# API URL
http://localhost:54321
```

---

## 7. 環境変数一覧

`.env.local` に以下を設定する。

```env
# ── Supabase ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # サーバーサイドのみ使用

# ── アプリケーション ───────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000          # 本番: https://truelog.jp
NEXT_PUBLIC_APP_NAME=True Log

# ── ストレージバケット名 ──────────────────────────
NEXT_PUBLIC_STORAGE_BUCKET_REVIEWS=review-images
SUPABASE_STORAGE_BUCKET_EVIDENCE=evidence-images  # 非公開

# ── 規約バージョン ────────────────────────────────
NEXT_PUBLIC_TERMS_VERSION=v1.0

# ── (将来) OCR連携 ────────────────────────────────
# GOOGLE_VISION_API_KEY=your-key
```

---

## 8. 画面一覧 & ルーティング設計

### 公開側 (全11画面)

| # | ページ名 | URL | レンダリング | 説明 |
|---|---|---|---|---|
| 1 | トップページ | `/` | SSR | サービス説明・新着口コミ・施術検索導線 |
| 2 | ログイン | `/login` | CSR | メール認証対応 |
| 3 | 新規登録 | `/register` | CSR | 利用規約同意必須 |
| 4 | マイページ | `/mypage` | SSR (認証) | 投稿一覧・ステータス表示 |
| 5 | 口コミ投稿 | `/reviews/new` | CSR (認証) | 入力フォーム＋画像アップロード |
| 6 | 投稿完了 | `/reviews/complete` | CSR | 承認待ち説明表示 |
| 7 | 施術一覧 | `/treatments` | SSG | カテゴリ別表示 |
| 8 | 施術詳細 | `/treatments/[slug]` | SSR | 施術別口コミ一覧 + JSON-LD |
| 9 | クリニック一覧 | `/clinics` | SSG | 地域別整理 |
| 10 | クリニック詳細 | `/clinics/[slug]` | SSR | 口コミ一覧＋構造化データ出力 |
| 11 | 口コミ詳細 | `/reviews/[slug]` | SSR | 個別URL・SEO対象 + JSON-LD |

### 管理者側 (全6画面)

| # | ページ名 | URL | 説明 |
|---|---|---|---|
| 1 | 管理者ログイン | `/admin/login` | 管理者専用認証 (Role制御) |
| 2 | ダッシュボード | `/admin` | 未承認件数・直近投稿状況 |
| 3 | 口コミ一覧管理 | `/admin/reviews` | ステータス別フィルタリング |
| 4 | 口コミ詳細審査 | `/admin/reviews/[id]` | スプリットビュー・承認/差し戻し |
| 5 | ユーザー管理 | `/admin/users` | ユーザー情報閲覧・BAN操作 |
| 6 | 操作ログ | `/admin/logs` | 審査履歴の確認 |

### URL スラッグ生成ルール

```
形式    : 英数字 + ハイフン (例: double-eyelid-surgery)
日本語  : ローマ字変換 または 内部ID併用
重複防止: 末尾にID付与 (例: shonan-beauty-shinjuku-a1b2)

例:
  /treatments/double-eyelid-surgery
  /clinics/shonan-beauty-shinjuku
  /reviews/review-abc123def456
```

---

## 9. 機能仕様

### 9.1 ユーザー認証

```
認証方式  : Supabase Auth (メールアドレス + パスワード)
メール確認: 必須 (なりすまし防止・投稿品質担保)
パスワード再発行: 対応
SNSログイン: MVP範囲外 (Phase 2で追加)
```

**認証フロー**

```
1. /register でメールアドレス・パスワードを入力
2. 確認メールが届く (Supabase Auth が自動送信)
3. メール内リンクをクリックして認証完了
4. profiles テーブルにレコードが自動作成される (Trigger)
5. user_agreements に規約同意ログを記録
```

### 9.2 口コミ投稿フォーム

**入力項目**

| フィールド | 必須 | 型 | 備考 |
|---|---|---|---|
| 施術名 | 必須 | select + autocomplete | `treatments` マスターから選択 |
| クリニック名 | 必須 | select + autocomplete | `clinics` マスターから選択 |
| 来院時期 | 任意 | YYYY-MM | 月単位で選択 |
| 支払金額 | 任意 | number | 円単位 |
| 総合評価 | 必須 | ★1〜5 | 数値型で保存 |
| 満足度コメント | 必須 | textarea | |
| 施術を選んだ理由 | 任意 | textarea | SEOキーワード含みやすい自由記述 |
| カウンセリングの印象 | 任意 | textarea | |
| 施術中の感想 | 任意 | textarea | |
| ダウンタイムの様子 | 任意 | textarea | |
| 結果の満足度 | 任意 | textarea | |
| 施術写真 | 任意(複数可) | image upload | 最大5枚 / 5MB / 公開領域 |
| 証拠画像 | 任意 | image upload | 1枚 / 5MB / 非公開領域 |
| 利用規約同意 | 必須 | checkbox | |
| 誹謗中傷禁止確認 | 必須 | checkbox | |

**施術名・クリニック名 入力方式**

```
1. オートコンプリート入力 → 既存マスターから選択
2. 「見つからない場合」ボタン → pending_clinics / pending_treatments に仮登録
3. 管理者が管理画面から正式マスターへ承認・追加
```

**投稿ステータス遷移**

```
draft (下書き) → pending (審査待ち) → approved (公開中)
                                    → rejected  (要修正)
```

### 9.3 規約同意ログ

```sql
-- 登録・投稿時に自動記録
INSERT INTO user_agreements (user_id, version, agreed_at)
VALUES (auth.uid(), 'v1.0', NOW());
```

規約改定時は新バージョンに未同意のユーザーへログイン時に再同意画面を表示する。

### 9.4 ユーザー管理・退会処理

| 操作 | 実装方法 |
|---|---|
| BAN (利用停止) | `profiles.is_active = false` に更新 → ログイン・投稿不可 |
| 退会 | 論理削除。口コミデータは保持し投稿者名を「退会済みユーザー」に変更 |
| 物理削除 | 行わない (法的リスク回避) |

---

## 10. 承認フロー (ワークフロー)

```
ユーザー投稿
    │  status: 'pending'
    ▼
事務局審査 (管理画面 /admin/reviews/[id])
    │
    ├─ 承認 ──→ status: 'approved' → Webサイトへ反映
    │           approved_at = NOW()
    │           admin_actions にログ記録
    │
    └─ 差し戻し → status: 'rejected' → ユーザーへメール通知
                 rejection_reason を記録
                 admin_actions にログ記録
                 ユーザーは修正後に再申請可能
```

### 審査基準 (5項目)

| # | チェック項目 | 内容 |
|---|---|---|
| 1 | **真実性確認** | 証拠画像の有無・明らかな虚偽記載の有無 |
| 2 | **表現チェック** | 誹謗中傷・断定的医療表現・個人情報の有無 |
| 3 | **品質チェック** | 300文字以上・内容の具体性・体験談として成立しているか |
| 4 | **画像確認** | 過度な露出・無断転載の疑いがないか |
| 5 | **総合判断** | 掲載可 / 修正依頼 / 非掲載 |

### 運用効率化

- 差し戻し理由テンプレート (ワンクリック適用)
- NGワードフィルター (一次自動検知)
- 重複投稿ブロック (システム制限)
- 審査履歴ログ (誰がいつ承認/却下したか記録)

### 管理画面 審査UI (スプリットビュー)

```
┌─────────────────────────┬──────────────────────────┐
│   証拠画像 (非公開)       │   投稿内容               │
│                          │                          │
│   [Image Preview]        │   施術名: 二重整形        │
│   [拡大 / 回転 操作]     │   クリニック: 湘南美容    │
│                          │   評価: ★★★★☆           │
│                          │   ...体験詳細テキスト...  │
│                          │                          │
│                          │  ┌──────┐  ┌─────────┐ │
│                          │  │ 承認 │  │ 差し戻し│ │
│                          │  └──────┘  └─────────┘ │
└─────────────────────────┴──────────────────────────┘
```

---

## 11. SEO設計

### ターゲット指標

| 指標 | 目標値 |
|---|---|
| Lighthouse SEO スコア | 90+ |
| PageSpeed | Good (Core Web Vitals: LCP / CLS) |
| 構造化データ種類 | 3種以上 |

### 構造化データ (JSON-LD)

**口コミ詳細ページ — Review Schema**

```typescript
// components/seo/JsonLd.tsx
export function ReviewJsonLd({ review }: { review: Review }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "MedicalClinic",
      "name": review.clinic.name,
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating_overall,
      "bestRating": "5",
    },
    "datePublished": review.approved_at,
    "reviewBody": review.rating_satisfaction,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**クリニック詳細ページ — BreadcrumbList**

```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "TOP", "item": "https://truelog.jp" },
    { "@type": "ListItem", "position": 2, "name": "クリニック一覧", "item": "https://truelog.jp/clinics" },
    { "@type": "ListItem", "position": 3, "name": clinic.name, "item": `https://truelog.jp/clinics/${clinic.slug}` },
  ]
};
```

### 動的 Sitemap

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const { data: reviews } = await supabase
    .from('reviews')
    .select('slug, updated_at')
    .eq('status', 'approved');

  return [
    { url: 'https://truelog.jp', lastModified: new Date() },
    ...(reviews?.map(r => ({
      url: `https://truelog.jp/reviews/${r.slug}`,
      lastModified: new Date(r.updated_at),
    })) ?? []),
  ];
}
```

### 動的メタタグ生成

```typescript
// app/(public)/clinics/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const clinic = await getClinic(params.slug);
  return {
    title: `${clinic.name}の口コミ・評判 | True Log`,
    description: `${clinic.name}の美容医療体験口コミ一覧。証拠画像付きの信頼できるレビュー。`,
    openGraph: {
      title: `${clinic.name}の口コミ | True Log`,
      images: [{ url: clinic.ogp_image_url ?? '/og-default.jpg' }],
    },
  };
}
```

---

## 12. Supabase 設定

### Row Level Security (RLS) ポリシー

```sql
-- ==========================================
-- reviews テーブル
-- ==========================================

-- 公開済み口コミは全員閲覧可
CREATE POLICY "approved reviews are public"
ON reviews FOR SELECT
USING (status = 'approved');

-- 自分の口コミは本人のみ閲覧可 (下書き・審査中含む)
CREATE POLICY "users can view own reviews"
ON reviews FOR SELECT
USING (auth.uid() = user_id);

-- 認証済みユーザーのみ投稿可
CREATE POLICY "authenticated users can insert reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_active_user());

-- 自分の口コミのみ更新可 (承認済みは除く)
CREATE POLICY "users can update own draft/rejected reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id AND status IN ('draft', 'rejected'));

-- ==========================================
-- evidence_images テーブル (管理者のみ閲覧可)
-- ==========================================
CREATE POLICY "only admins can view evidence"
ON evidence_images FOR SELECT
USING (is_admin());

-- ==========================================
-- admin_actions テーブル (管理者のみ操作可)
-- ==========================================
CREATE POLICY "only admins can manage admin_actions"
ON admin_actions FOR ALL
USING (is_admin());

-- ==========================================
-- ヘルパー関数
-- ==========================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### Storage バケット設定

```sql
-- 公開バケット (口コミ写真)
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', TRUE);

-- 非公開バケット (証拠画像)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-images', 'evidence-images', FALSE);

-- 証拠画像は管理者のみアクセス可
CREATE POLICY "only admins can access evidence"
ON storage.objects FOR ALL
USING (bucket_id = 'evidence-images' AND is_admin());
```

### Supabase Auth 設定

```
メール確認: 有効 (confirm_email_change = true)
パスワード最低文字数: 8文字以上
JWT有効期限: 3600秒 (1時間)
リフレッシュトークン: 有効
```

---

## 13. 画像アップロード仕様

### 制限値

| 項目 | 仕様 |
|---|---|
| 最大枚数 | 5枚 (口コミ写真) + 1枚 (証拠画像) |
| 1枚あたりの容量上限 | 5MB |
| 自動リサイズ | 長辺 1600px に縮小 |
| 自動圧縮 | WebP 変換・品質劣化最小化 |
| EXIF削除 | 位置情報等のメタデータを自動除去 |
| 対応形式 | .jpg / .png / .heic |

### 実装 (フロントエンド処理)

```typescript
// lib/utils/image.ts
import imageCompression from 'browser-image-compression';

export async function processImage(file: File): Promise<File> {
  // 1. フロントで圧縮・リサイズ
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/webp',
  });

  // 2. EXIF メタデータ削除
  const cleaned = await stripExif(compressed);

  return cleaned;
}

async function stripExif(file: File): Promise<File> {
  // Canvas に描画し直すことでEXIFを除去
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
  return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
}
```

### Supabase Storage へのアップロード

```typescript
// lib/supabase/storage.ts
export async function uploadReviewImage(
  userId: string,
  reviewId: string,
  file: File
): Promise<string> {
  const supabase = createClient();
  const path = `${userId}/${reviewId}/${Date.now()}.webp`;

  const { error } = await supabase.storage
    .from('review-images')
    .upload(path, file, { upsert: false });

  if (error) throw error;
  return path;
}
```

---

## 14. 管理者画面

### ダッシュボード表示情報

- 審査待ち口コミ件数
- 直近7日間の投稿数
- 直近の承認・差し戻しアクション

### 口コミ審査フィルター

```
ステータス別: 審査待ち / 承認済み / 差し戻し
施術別フィルター
クリニック別フィルター
日付範囲フィルター
```

### 差し戻し理由テンプレート

```typescript
export const REJECTION_REASONS = [
  { id: 'no_evidence',    label: '証拠画像が添付されていない' },
  { id: 'too_short',      label: '文字数が基準（300文字）未満' },
  { id: 'slander',        label: '誹謗中傷・不適切な表現が含まれている' },
  { id: 'medical_claim',  label: '断定的な医療効果の記載がある' },
  { id: 'personal_info',  label: '個人情報が含まれている' },
  { id: 'duplicate',      label: '同一内容の重複投稿と判断' },
  { id: 'fake',           label: '虚偽記載が疑われる' },
  { id: 'image_issue',    label: '画像に問題がある（露出・転載等）' },
] as const;
```

### 操作ログ記録

```typescript
// 承認・差し戻し時に自動記録
await supabase.from('admin_actions').insert({
  admin_id: adminId,
  review_id: reviewId,
  action: 'approved', // or 'rejected'
  reason: rejectionReason ?? null,
});
```

---

## 15. デプロイ戦略

### 環境分離

| 環境 | 用途 | ブランチ | URL |
|---|---|---|---|
| **Dev** | 開発者ローカル | `feature/*` | localhost:3000 |
| **Staging** | クライアント確認用 | `develop` | staging.truelog.jp |
| **Production** | 一般ユーザー公開 | `main` | truelog.jp |

### デプロイフロー

```
feature/* → develop (Staging自動デプロイ)
              ↓
         クライアント確認・承認
              ↓
           main (Production デプロイ)
```

> Staging環境のURLを初期段階から共有。「動くもの」を常に確認できる体制で開発を進めます。

### Vercel 設定

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### 本番公開前チェックリスト

- [ ] Lighthouse SEO スコア 90+ 確認
- [ ] Core Web Vitals (LCP / CLS) 確認
- [ ] RLS ポリシー全テスト
- [ ] 管理者アカウント作成・動作確認
- [ ] ドメイン設定・SSL確認
- [ ] Sitemap が正常に生成されること確認
- [ ] 構造化データ (JSON-LD) が Google リッチリザルトテストに通ること
- [ ] メール送信 (認証・通知) 動作確認
- [ ] 画像アップロード・圧縮・EXIF削除 動作確認
- [ ] 証拠画像が非公開バケットに保存されること確認

---

## 16. MVP範囲外 (将来拡張)

| 機能 | Phase | 概要 |
|---|---|---|
| SNSログイン | Phase 2 | Google / LINE / X (Twitter) でのワンクリックログイン |
| 高度な検索 | Phase 2 | ダウンタイム・コスパ・年代等の複合条件フィルター |
| レコメンドエンジン | Phase 2+ | 閲覧履歴・属性に基づくAIレコメンド |
| OCR自動入力 | Phase 3 | Google Vision API で領収書・診療明細を自動解析 |
| 高度なランキング | Phase 3 | 満足度順・コスパ順などの動的ランキング |
| SEO LP自動生成 | Phase 3 | 施術別・地域別のSEO特化ランディングページ |
| 広告出稿機能 | Phase 4 | クリニック向け有料広告枠・収益化機能 |
| ポイント制度 | Phase 4 | 口コミ投稿へのインセンティブ (Amazon ギフト等) |
| ネイティブアプリ | Phase 4 | React Native または PWA によるモバイルアプリ化 |
| 外部API公開 | Phase 4 | クリニック管理画面・外部パートナー向けAPI |

### OCR連携 準備設計 (MVP時点)

```typescript
// supabase/functions/ocr-extract/index.ts (stub)
// Edge Function として実装予定。現時点では画像と抽出テキストを
// 紐付け可能な DB 設計のみ実施済み。

Deno.serve(async (req) => {
  // TODO Phase 3: Google Vision API 連携
  // const { imageUrl } = await req.json();
  // const result = await callGoogleVisionApi(imageUrl);
  // return { clinicName, date, cost } = extractFields(result);
  return new Response(JSON.stringify({ message: 'OCR not yet implemented' }));
});
```

---

## 17. 開発スケジュール

| Phase | 期間 | 内容 | 成果物 |
|---|---|---|---|
| **1. 要件確定** | 2/17 - 2/24 (約1週間) | MVP機能最終確定・画面一覧整理・DB構造定義・URL/SEO設計方針確定 | 機能定義書・画面一覧・ER図 |
| **2. 設計** | 2/25 - 3/3 (約1週間) | UIワイヤー整理・管理画面フロー設計・投稿ステータス設計・審査フロー設計 | UI設計資料・管理画面構成図 |
| **3. 開発** | 3/4 - 3/24 (約3週間) | LP実装・認証・口コミ投稿・承認制ワークフロー・管理画面・検索・SEO実装 | Staging環境 (常時共有) |
| **4. テスト** | 3/25 - 3/31 (約1週間) | バグ修正・パフォーマンス最適化・SEO構造確認・最終動作確認 | — |
| **5. 納品** | 4/1 | 本番環境公開 | 本番URL・GitHubリポジトリ・環境構成ドキュメント |

---

## 18. 費用・支払いスケジュール

| Step | 内容 | 金額 (税別) | ステータス |
|---|---|---|---|
| **Step 1** | 要件定義 + 着手金 | ¥270,000 | 支払い済み (2/17) |
| **Step 2** | 開発フェーズ① 基盤構築 (Next.js/Supabase環境・Auth・DB・管理画面基盤・投稿機能) | ¥180,000 | — |
| **Step 3** | 開発フェーズ② SEO・最適化・最終調整 (SEO実装・構造化データ・検索機能・パフォーマンス・本番公開) | ¥200,000 | — |
| **合計** | | **¥650,000** | |

### MVP開発範囲に含まれるもの (追加費用なし)

- 要件整理・アーキテクチャ設計
- DB設計 (正規化・インデックス設計)
- 管理画面UI設計
- SEO基盤構築
- Dev / Staging / Production 環境構築
- 初期パフォーマンス最適化
- 施術名・クリニック名入力方式 (マスター選択 + autocomplete)
- SEO観点でのURL設計
- 画像アップロード仕様 (圧縮・リサイズ・EXIF削除)
- 規約同意ログ保存 (バージョン管理)
- ユーザー管理機能 (BAN・論理削除・単一管理者ロール)

### 納品物

- 本番環境公開 URL
- GitHub リポジトリ (ソースコード一式)
- Supabase プロジェクト引き渡し
- 環境構成ドキュメント (環境変数・デプロイ手順)
- API仕様書

### アフターフォロー

- 納品後 **1ヶ月間** の無償リビジョン対応 (仕様範囲内の不具合・微修正)
- 長期的な伴走型開発・SEO成長戦略支援も対応可能

---

## Contact & Support

| 項目 | 内容 |
|---|---|
| 稼働時間 | 8:30 - 22:30 (平日・休日問わず) |
| 返信速度 | 原則 24時間以内 (緊急時は即時対応) |
| 使用ツール | Slack / Chatwork / Zoom |
| 定例報告 | 週次進捗レポート |

---

*CONFIDENTIAL // INTERNAL USE ONLY — True Log Project Requirements v1.0 (2026.02.17)*
