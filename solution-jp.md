# True Log — フルソリューション設計書

> 原典：`TrueLog要件定義.pdf`（2026.02.17）
> 作成日：2026-03-01
> CONFIDENTIAL // INTERNAL USE ONLY

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [システムアーキテクチャ](#3-システムアーキテクチャ)
4. [データベーススキーマ（ER設計）](#4-データベーススキーマer設計)
5. [ディレクトリ構成](#5-ディレクトリ構成)
6. [画面・ルート定義](#6-画面ルート定義)
7. [認証フロー](#7-認証フロー)
8. [投稿・口コミ投稿フロー](#8-投稿口コミ投稿フロー)
9. [承認ワークフロー](#9-承認ワークフロー)
10. [管理者UI仕様](#10-管理者ui仕様)
11. [SEO戦略・実装](#11-seo戦略実装)
12. [画像アップロード仕様](#12-画像アップロード仕様)
13. [ユーザー管理・アクセス制御](#13-ユーザー管理アクセス制御)
14. [利用規約同意ログ](#14-利用規約同意ログ)
15. [URLスラッグ構造（SEO最適化）](#15-urlスラッグ構造seo最適化)
16. [MVPスコープ・今後のフェーズ](#16-mvpスコープ今後のフェーズ)
17. [開発スケジュール](#17-開発スケジュール)
18. [デプロイ戦略](#18-デプロイ戦略)
19. [支払いマイルストーン](#19-支払いマイルストーン)
20. [実装チェックリスト](#20-実装チェックリスト)

---

## 1. プロジェクト概要

**サービス名：** True Log
**コンセプト：** 美容クリニックの施術口コミ・ログサービス
**コア目的：** ユーザーが実際に受けた美容医療の施術体験を投稿・共有するプラットフォーム。口コミコンテンツをSEO資産として蓄積し、オーガニック流入を最大化する。

| 項目 | 内容 |
|---|---|
| MVP開発期間 | 6〜8週間（2026/02/17 〜 2026/04/01） |
| リリース目標 | 2026/04/01 |
| 予算総額 | 650,000円 |
| Lighthouse SEO目標 | 90点以上 |
| PageSpeed目標 | Good |

---

## 2. 技術スタック

### フロントエンド・インフラ

| レイヤー | 技術 | 目的 |
|---|---|---|
| フレームワーク | Next.js 14（App Router） | SSR/SSG・SEO・ReactベースUI |
| 言語 | TypeScript | 型安全性の確保 |
| スタイリング | Tailwind CSS | ユーティリティファーストのレスポンシブUI |
| ホスティング | Vercel | Next.jsネイティブデプロイ |

### バックエンド（Supabase）

| レイヤー | 技術 | 目的 |
|---|---|---|
| データベース | Supabase（PostgreSQL） | リレーショナルデータ管理 |
| 認証 | Supabase Auth | Google / LINE OAuthログイン |
| ストレージ | Supabase Storage | 画像アップロード・CDN配信 |
| エッジ関数 | Supabase Edge Functions | OCR・API連携（Phase 3以降） |
| 行レベルセキュリティ | RLS（Row Level Security） | ユーザーごとのデータ分離 |

### SEO

| 機能 | 実装方法 |
|---|---|
| 構造化データ | JSON-LD（Review・FAQPage・BreadcrumbList） |
| サイトマップ | 動的XMLサイトマップ自動生成 |
| OGP | ページごとにog:image・og:title・og:description設定 |
| メタタグ | ルートごとに動的title・meta description |

---

## 3. システムアーキテクチャ

```
┌─────────────────────────────────────────────┐
│             ユーザー / クライアント            │
└────────────────┬────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────┐
│           Vercel（CDN + Edge）               │
│   ┌─────────────────────────────────────┐   │
│   │   Next.js App Router（SSR / SSG）   │   │
│   │   - 公開ページ（SSG・キャッシュ）    │   │
│   │   - 認証ページ（SSR・プライベート）  │   │
│   │   - 管理画面（SSR・ロール制限）      │   │
│   └──────────────┬──────────────────────┘   │
└──────────────────┼──────────────────────────┘
                   │ API / SDK呼び出し
┌──────────────────▼──────────────────────────┐
│                Supabase                      │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐  │
│  │ PostgreSQL│ │   Auth   │ │  Storage   │  │
│  │  （+ RLS）│ │Google/LINE│ │（WebP CDN）│  │
│  └───────────┘ └──────────┘ └────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │   Edge Functions（Phase 3以降）        │  │
│  │   Google Vision API / OpenAI OCR      │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### デプロイ環境

| 環境 | 用途 | 備考 |
|---|---|---|
| **Dev** | ローカル開発 | `.env.local` |
| **Staging** | QA・クライアント確認 | StagingURL（PC確認用） |
| **Production** | 本番公開 | Stagingから手動プロモート |

---

## 4. データベーススキーマ（ER設計）

### `profiles`（Supabase Auth連携）

```sql
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  is_active    BOOLEAN NOT NULL DEFAULT TRUE, -- FALSE = BAN済み
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `user_agreements`（利用規約同意ログ）

```sql
CREATE TABLE public.user_agreements (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version   TEXT NOT NULL,       -- 例: 'v1.0', 'v2.0'
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `clinics`（クリニック）

```sql
CREATE TABLE public.clinics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,    -- 例: 'shonan-beauty-shinjuku'
  name         TEXT NOT NULL,
  description  TEXT,
  address      TEXT,
  website_url  TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `treatments`（施術）

```sql
CREATE TABLE public.treatments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,  -- 例: 'double-eyelid-surgery'
  name         TEXT NOT NULL,
  description  TEXT,
  category     TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `reviews`（口コミ投稿・コアエンティティ）

```sql
CREATE TYPE review_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

CREATE TABLE public.reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,  -- 例: 'review-a1b2c3'
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id       UUID REFERENCES public.clinics(id),
  treatment_id    UUID REFERENCES public.treatments(id),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL CHECK (char_length(body) <= 300),
  treatment_date  TEXT,                  -- YYYY-MM形式
  cost            INTEGER,               -- 費用（円）
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  status          review_status NOT NULL DEFAULT 'pending',
  rejected_reason TEXT,                  -- 却下理由
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `review_images`（口コミ添付画像）

```sql
CREATE TABLE public.review_images (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id    UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,   -- Supabase Storageのパス
  order_index  SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### RLSポリシー設定例

```sql
-- reviews テーブルのRLS有効化
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 承認済み口コミは全員が閲覧可能
CREATE POLICY "承認済み口コミは全員閲覧可"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

-- ユーザーは自分の口コミのみ投稿可能
CREATE POLICY "自分の口コミのみ投稿可"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のdraft・pendingのみ編集可能
CREATE POLICY "自分のpending/draftのみ編集可"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'pending'));

-- 管理者は全操作可能
CREATE POLICY "管理者は全操作可"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 5. ディレクトリ構成

```
truelog/
├── app/                              # Next.js App Router
│   ├── (public)/                     # 公開ルート（SSG）
│   │   ├── page.tsx                  # ホーム / LP
│   │   ├── clinics/
│   │   │   ├── page.tsx              # クリニック一覧
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # クリニック詳細
│   │   ├── treatments/
│   │   │   ├── page.tsx              # 施術一覧
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # 施術詳細
│   │   └── reviews/
│   │       ├── page.tsx              # 口コミ一覧
│   │       └── [slug]/
│   │           └── page.tsx          # 口コミ詳細
│   ├── (auth)/                       # 認証ルート
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts         # OAuthコールバック
│   ├── (user)/                       # 認証済みユーザールート
│   │   ├── mypage/page.tsx           # マイページ
│   │   └── post/
│   │       ├── new/page.tsx          # 口コミ投稿フォーム
│   │       └── [id]/edit/page.tsx    # 口コミ編集
│   ├── admin/                        # 管理者ルート（ロール制限）
│   │   ├── layout.tsx                # 管理レイアウト + 認証ガード
│   │   ├── page.tsx                  # ダッシュボード
│   │   ├── users/page.tsx            # ユーザー管理
│   │   ├── clinics/page.tsx          # クリニック管理
│   │   ├── treatments/page.tsx       # 施術管理
│   │   ├── reviews/page.tsx          # 承認キュー
│   │   └── reviews/[id]/page.tsx     # 口コミ詳細（承認・却下）
│   ├── api/
│   │   └── revalidate/route.ts       # ISR再生成トリガー
│   ├── layout.tsx                    # ルートレイアウト
│   ├── sitemap.ts                    # 動的サイトマップ
│   └── robots.ts
├── components/
│   ├── ui/                           # 基本UIコンポーネント
│   ├── review/                       # 口コミカード・フォームなど
│   ├── clinic/                       # クリニック関連
│   ├── admin/                        # 管理画面コンポーネント
│   └── seo/                          # JsonLd・MetaTagsなど
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # ブラウザクライアント
│   │   ├── server.ts                 # サーバークライアント（RSC用）
│   │   └── middleware.ts
│   ├── image/
│   │   └── upload.ts                 # WebP変換・EXIF削除処理
│   └── seo/
│       └── schemas.ts                # JSON-LDスキーマ生成
├── middleware.ts                     # ルート保護ミドルウェア
├── .env.local
├── tailwind.config.ts
└── next.config.ts
```

---

## 6. 画面・ルート定義

### 公開画面（11画面）

| # | 画面名 | ルート | レンダリング方式 |
|---|---|---|---|
| 1 | ホーム / LP | `/` | SSG |
| 2 | クリニック一覧 | `/clinics` | SSG + ISR |
| 3 | クリニック詳細 | `/clinics/[slug]` | SSG + ISR |
| 4 | 施術一覧 | `/treatments` | SSG + ISR |
| 5 | 施術詳細 | `/treatments/[slug]` | SSG + ISR |
| 6 | 口コミ一覧 | `/reviews` | SSG + ISR |
| 7 | 口コミ詳細 | `/reviews/[slug]` | SSG + ISR |
| 8 | 会員登録 | `/register` | SSR |
| 9 | マイページ | `/mypage` | SSR（要認証） |
| 10 | 口コミ投稿 | `/post/new` | SSR（要認証） |
| 11 | ログイン | `/login` | SSR |

### 管理画面（6画面）

| # | 画面名 | ルート | 備考 |
|---|---|---|---|
| 1 | ユーザー管理 | `/admin/users` | ロール設定・BAN |
| 2 | クリニック管理 | `/admin/clinics` | CRUD |
| 3 | 施術管理 | `/admin/treatments` | CRUD |
| 4 | 口コミ管理 | `/admin/reviews` | 承認キュー |
| 5 | 口コミ詳細 | `/admin/reviews/[id]` | 分割ビュー・承認/却下 |
| 6 | 承認ログ | `/admin/reviews/log` | 操作履歴 |

---

## 7. 認証フロー

### OAuth認証（Google / LINE）via Supabase Auth

```
ユーザーが「Googleでログイン」をクリック
        │
        ▼
Supabase Auth → OAuthプロバイダーへリダイレクト
        │
        ▼
OAuthコールバック → /auth/callback
        │
        ▼
public.profilesにユーザーを作成 / upsert
        │
        ▼
利用規約同意チェック（user_agreements）
        │
   未同意の場合─────────────────────────────► 規約同意ページ → 同意 → DBに記録
        │
        ▼
/mypage（または遷移元ページ）へリダイレクト
```

### ミドルウェアによるルート保護

```typescript
// middleware.ts
export const config = {
  matcher: ['/mypage/:path*', '/post/:path*', '/admin/:path*'],
}

// ロジック：
// - /admin/* → role = 'admin' が必要
// - /mypage/*, /post/* → 認証済みであること
// - is_active = false → /banned へリダイレクト
```

---

## 8. 投稿・口コミ投稿フロー

```
ユーザーが口コミ投稿フォームを入力（/post/new）
  - クリニック選択（検索・ドロップダウン）
  - 施術選択（treatmentsテーブルに紐づく）
  - タイトル・本文入力（300文字以内）
  - 施術日入力（YYYY-MM形式のピッカー）
  - 費用入力（円）
  - 画像アップロード（最大5枚・各5MB以内）
  - 評価入力（星1〜5）
        │
        ▼
クライアントサイドバリデーション（TypeScript + Zod）
        │
        ▼
画像処理（アップロード前に実施）：
  - 最大1600pxにリサイズ
  - WebP形式に変換
  - EXIFメタデータを削除
        │
        ▼
Supabase Storageへ画像アップロード
（パス: reviews/{user_id}/{uuid}.webp）
        │
        ▼
reviewsテーブルに挿入（status = 'pending'）
review_imagesテーブルに挿入
        │
        ▼
/mypageへリダイレクト（「審査中」バナーを表示）
```

---

## 9. 承認ワークフロー

### ステータス遷移

```
draft（下書き）
  │
  │（ユーザーが送信）
  ▼
pending（審査中）
  │
  ├── 管理者が承認 ──► approved（公開済み）
  │                    └─► published_at設定・ISR再生成
  │
  └── 管理者が却下 ──► rejected（却下）
                        └─► 却下理由を保存
                            └─► ユーザーが修正・再投稿 → pending
```

### 管理者 口コミ詳細画面（分割ビュー）

```
┌────────────────────────┬────────────────────────┐
│     投稿内容           │     プレビュー（Web表示）  │
│                        │                         │
│  ID: #12345            │  [画像1] [画像2]         │
│  ユーザー: @username   │                         │
│  クリニック: ○○クリニック│  タイトル: ...          │
│  施術: 二重整形         │  本文: ...              │
│  施術日: 2026-01        │  評価: ★★★★☆            │
│  費用: ¥30,000          │  費用: ¥30,000           │
│                        │                         │
│  ステータス: pending   │                         │
│                        │                         │
│  [承認する] [却下する]  │                         │
│  却下理由: ___________  │                         │
└────────────────────────┴────────────────────────┘
```

---

## 10. 管理者UI仕様

### 口コミ管理一覧（`/admin/reviews`）

- ページネーション：15件／ページ
- ステータスフィルター：`pending` / `approved` / `rejected`
- デフォルトソート：`created_at` 降順
- 表示カラム：ID・ユーザー・クリニック・施術・投稿日・ステータス・操作

### 承認処理

```typescript
async function approveReview(id: string, slug: string) {
  await supabase
    .from('reviews')
    .update({ status: 'approved', published_at: new Date().toISOString() })
    .eq('id', id)
  // ISR再生成トリガー
  await fetch('/api/revalidate?path=/reviews/' + slug)
}
```

### 却下処理

```typescript
async function rejectReview(id: string, reason: string) {
  await supabase
    .from('reviews')
    .update({ status: 'rejected', rejected_reason: reason })
    .eq('id', id)
}
```

### OCR機能（将来対応 — Phase 3）

- 管理画面に「OCR抽出」ボタンを追加
- Supabase Edge Function → Google Vision API / OpenAI を呼び出し
- 領収書・明細書の画像から以下を抽出：クリニック名・施術日・費用
- 抽出結果を口コミフォームの各フィールドに自動入力

---

## 11. SEO戦略・実装

### 戦略目標

「口コミ」コンテンツを永続的なSEO資産として構築。施術名・クリニック名のロングテールキーワードで検索上位を狙いオーガニック流入を最大化する。

### URLベースのSEO

- 人間が読めるスラッグ：`/clinics/shonan-beauty-shinjuku`
- 公開URLにIDを含めない
- パンくずリスト対応の階層：`TOP ＞ クリニック ＞ 湘南美容 新宿院`

### JSON-LDスキーマ

**口コミ詳細ページ（`/reviews/[slug]`）**
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "LocalBusiness",
    "name": "クリニック名"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 4,
    "bestRating": 5
  },
  "author": { "@type": "Person", "name": "表示名" },
  "reviewBody": "口コミ本文..."
}
```

**クリニック詳細ページ（`/clinics/[slug]`）**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "クリニック名",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.2,
    "reviewCount": 38
  }
}
```

**パンくずリスト（全ページ共通）**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "TOP", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "クリニック", "item": "https://example.com/clinics" },
    { "@type": "ListItem", "position": 3, "name": "湘南美容", "item": "https://example.com/clinics/shonan-beauty" }
  ]
}
```

**FAQ（施術ページ）**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "二重整形とは？",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    }
  ]
}
```

### 動的メタデータ（Next.js）

```typescript
// app/reviews/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const review = await getReview(params.slug)
  return {
    title: `${review.title} | True Log`,
    description: review.body.slice(0, 120),
    openGraph: {
      images: [review.images[0]?.url],
    },
  }
}
```

### サイトマップ自動生成

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reviews    = await getApprovedReviews()
  const clinics    = await getPublishedClinics()
  const treatments = await getPublishedTreatments()
  return [
    { url: 'https://example.com', changeFrequency: 'daily', priority: 1 },
    ...clinics.map(c    => ({ url: `https://example.com/clinics/${c.slug}`,    changeFrequency: 'weekly',  priority: 0.8 })),
    ...treatments.map(t => ({ url: `https://example.com/treatments/${t.slug}`, changeFrequency: 'weekly',  priority: 0.8 })),
    ...reviews.map(r    => ({ url: `https://example.com/reviews/${r.slug}`,    changeFrequency: 'monthly', priority: 0.6 })),
  ]
}
```

### Core Web Vitals・パフォーマンス目標

| 指標 | 目標値 |
|---|---|
| Lighthouse SEO | 90点以上 |
| PageSpeed | Good |
| LCP（最大コンテンツ描画） | 2.5秒以内 |
| CLS（累積レイアウトシフト） | 0.1未満 |
| 画像 | WebP・遅延読み込み・サイズ指定 |
| フォント | プリロード・`font-display: swap` |

### E-E-A-T（信頼性）強化施策

- 口コミにユーザーの表示名を表示
- 施術日・費用を透明性をもって掲載
- クリニックの公式サイトへのリンク
- 管理者が承認済みの口コミに認証バッジを表示

---

## 12. 画像アップロード仕様

| 項目 | 仕様 |
|---|---|
| 口コミあたりの最大枚数 | 5枚 |
| 1枚あたりの最大サイズ | 5MB |
| 対応ファイル形式 | .jpg / .png / .heic |
| 最大解像度 | 長辺1600px以内 |
| 出力形式 | WebP（自動変換） |
| EXIFメタデータ | アップロード前に削除 |
| 保存先 | Supabase Storage（CDN配信） |

### クライアントサイド画像処理

```typescript
async function processImage(file: File): Promise<Blob> {
  // 1. canvas に画像を読み込む
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const scale  = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  canvas.width  = bitmap.width  * scale
  canvas.height = bitmap.height * scale
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  // 2. WebPでエクスポート（canvas APIによりEXIFは自動削除）
  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/webp', 0.85))
}
```

### Storageパス規則

```
reviews/{user_id}/{review_id}/{order_index}.webp
```

---

## 13. ユーザー管理・アクセス制御

### ロール定義

| ロール | 権限 |
|---|---|
| `user` | 口コミ投稿・自分の投稿閲覧・draft/pending編集 |
| `admin` | 全CRUD・口コミ承認/却下・ユーザー/クリニック/施術管理 |

### BANシステム

- `is_active = false` → ユーザーBAN状態
- BAN済みユーザー：認証ルートアクセス時に `/banned` へリダイレクト
- ミドルウェアで毎リクエスト `is_active` を確認
- BAN後も承認済み口コミはデータ保持（削除しない）

### MVPアクセス権限マトリクス

| 操作 | 未認証 | ユーザー | 管理者 |
|---|---|---|---|
| 承認済み口コミ閲覧 | ✅ | ✅ | ✅ |
| 口コミ投稿 | ❌ | ✅ | ✅ |
| 自分のpending口コミ編集 | ❌ | ✅ | ✅ |
| 自分の口コミ削除 | ❌ | ✅ | ✅ |
| 口コミ承認/却下 | ❌ | ❌ | ✅ |
| クリニック・施術管理 | ❌ | ❌ | ✅ |
| ユーザー管理 | ❌ | ❌ | ✅ |

---

## 14. 利用規約同意ログ

### テーブル：`user_agreements`

```sql
CREATE TABLE public.user_agreements (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version   TEXT NOT NULL,       -- 'v1.0', 'v2.0' ...
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 同意チェックロジック

```typescript
async function checkAndRecordAgreement(userId: string, currentVersion: string) {
  const { data } = await supabase
    .from('user_agreements')
    .select('version')
    .eq('user_id', userId)
    .eq('version', currentVersion)
    .single()

  if (!data) {
    // 規約モーダルを表示 → 同意時:
    await supabase
      .from('user_agreements')
      .insert({ user_id: userId, version: currentVersion })
  }
}
```

### バージョンアップ時の挙動

| シナリオ | 結果 |
|---|---|
| 新規ユーザー（v1.0が最新） | v1.0同意プロンプト → 同意でDB記録 |
| 既存ユーザー（v1.0同意済み）にv2.0が適用 | v2.0同意プロンプト → 同意でDB記録 |
| 最新バージョンに既に同意済み | プロンプト表示なし |

---

## 15. URLスラッグ構造（SEO最適化）

### スラッグ生成ルール

- 小文字・ハイフン区切りの英語（日本語はローマ字化）
- 公開URLにIDを含めない
- DB側で `UNIQUE` 制約により一意性を担保
- スラッグ例：

| コンテンツ | スラッグ | フルURL |
|---|---|---|
| 湘南美容クリニック 新宿院 | `shonan-beauty-shinjuku` | `/clinics/shonan-beauty-shinjuku` |
| 二重整形（埋没法） | `double-eyelid-埋没法` → `double-eyelid-maibotsuho` | `/treatments/double-eyelid-maibotsuho` |
| 口コミ #a1b2c3 | `review-a1b2c3` | `/reviews/review-a1b2c3` |

### Next.js 静的生成設定

```typescript
// app/clinics/[slug]/page.tsx
export async function generateStaticParams() {
  const clinics = await getPublishedClinics()
  return clinics.map(c => ({ slug: c.slug }))
}

export const revalidate = 3600 // ISR: 1時間ごとに再生成
```

---

## 16. MVPスコープ・今後のフェーズ

### Phase 1 — MVP（2026/04/01リリース）

- [x] LP / トップページ
- [x] クリニック一覧・詳細
- [x] 施術一覧・詳細
- [x] 口コミ一覧・詳細
- [x] 会員登録・ログイン（メール + Google OAuth）
- [x] 口コミ投稿フォーム（画像アップロード含む）
- [x] 管理者承認ワークフロー
- [x] クリニック・施術のCRUD管理
- [x] SEO：JSON-LD・meta・sitemap・OGP
- [x] RLSセキュリティポリシー
- [x] 利用規約同意ログ
- [x] Dev / Staging / Production環境構築

### Phase 2 — SNS認証・共有

- [ ] LINE OAuthログイン
- [ ] Twitter / X OAuthログイン
- [ ] SNS共有機能

### Phase 3 — SEO強化・LP最適化・OCR

- [ ] 施術カテゴリ別SEO LPページ
- [ ] FAQ拡充
- [ ] OCR：Google Vision API / OpenAI による領収書解析
- [ ] OCRによる口コミフィールド自動入力（クリニック名・日付・費用）

### Phase 4 — 収益化

- [ ] Amazonアフィリエイト連携
- [ ] クリニックプレミアム掲載（有料）

### MVPスコープ外（対象外）

| 機能 | フェーズ |
|---|---|
| AIレコメンド機能 | Phase 2以降 |
| LINE / Twitterログイン | Phase 2以降 |
| OCRレシートスキャン | Phase 3 |
| 決済・アフィリエイト | Phase 4 |
| ネイティブモバイルアプリ | Phase 5以降 |

---

## 17. 開発スケジュール

| スプリント | 期間 | タスク | 成果物 |
|---|---|---|---|
| **Sprint 1** | 2/17 〜 2/24 | MVP設計・DB設計・URL設計・SEO基盤 | DBスキーマ・ER図・URLマップ |
| **Sprint 2** | 2/25 〜 3/3 | UIコンポーネント・認証・口コミフォーム | 認証フロー・投稿フォームUI |
| **Sprint 3** | 3/4 〜 3/24 | LP・クリニック/施術ページ・口コミページ・管理UI・SEO | 公開サイト全画面・管理パネル |
| **Sprint 4** | 3/25 〜 3/31 | Stagingデプロイ・QA・SEO監査・バグ修正 | StagingURL・QAレポート |
| **リリース** | 4/1 | 本番デプロイ | GitHub・Supabase・本番URL |

### コミュニケーションポリシー

- **対応時間：** 8:30 〜 22:30
- **連絡手段：** Slack / Chatwork / Zoom
- **返信目安：** 24時間以内
- **Staging確認：** スプリントごとに1回のレビューサイクル

---

## 18. デプロイ戦略

### 環境変数設定

```bash
# .env.local（Dev）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Staging（Vercel環境変数）
NEXT_PUBLIC_SITE_URL=https://truelog-staging.vercel.app

# Production（Vercel環境変数）
NEXT_PUBLIC_SITE_URL=https://truelog.example.com
```

### Vercelプロジェクト設定

```
developブランチ  → 自動プレビューデプロイ
mainブランチ     → Staging環境
releaseタグ      → Production環境（手動プロモート）
```

### Supabaseマイグレーション

```bash
supabase db diff --schema public | supabase db push
```

---

## 19. 支払いマイルストーン

| ステップ | 金額 | タイミング |
|---|---|---|
| **Step 1** 着手金 | 270,000円 | 契約締結（2/17） |
| **Step 2** 中間払い | 180,000円 | Staging納品（StagingURL確認後） |
| **Step 3** 最終払い | 200,000円 | SEO納品（JSON-LD・sitemap・Lighthouse 90+達成後） |
| **合計** | **650,000円** | — |

---

## 20. 実装チェックリスト

### 基盤構築
- [ ] Next.js 14プロジェクト初期化（App Router + TypeScript + Tailwind）
- [ ] Supabaseプロジェクト作成（Dev / Staging / Prod）
- [ ] Vercelプロジェクト設定（ブランチ環境分割）
- [ ] 全DBテーブルのマイグレーション作成
- [ ] 全テーブルのRLSポリシー設定
- [ ] Supabase Auth（Google OAuth）設定

### 認証
- [ ] ログインページ（Google OAuthボタン）
- [ ] OAuthコールバックハンドラー（`/auth/callback`）
- [ ] 初回ログイン時のprofile自動作成
- [ ] 初回ログイン時の利用規約同意チェック
- [ ] ミドルウェアによるルート保護
- [ ] ミドルウェアでのBAN判定

### 公開ページ
- [ ] ホーム / LPページ（SSG）
- [ ] クリニック一覧（15件／ページネーション）
- [ ] クリニック詳細（集計評価表示）
- [ ] 施術一覧（ページネーション）
- [ ] 施術詳細（FAQ セクション）
- [ ] 口コミ一覧（フィルター機能）
- [ ] 口コミ詳細（全文表示）

### SEO
- [ ] 全ルートに動的 `generateMetadata` 実装
- [ ] 口コミページにJSON-LD Reviewスキーマ
- [ ] クリニックページにJSON-LD LocalBusinessスキーマ
- [ ] 全ページにJSON-LD BreadcrumbListスキーマ
- [ ] 施術ページにJSON-LD FAQPageスキーマ
- [ ] 動的 sitemap.ts 実装
- [ ] ページごとのOGP画像設定
- [ ] robots.ts 設定
- [ ] Lighthouseスコア 90点以上を確認

### ユーザー機能
- [ ] マイページ（自分の口コミ一覧）
- [ ] 口コミ投稿フォーム
- [ ] 画像アップロード（WebP変換クライアント処理）
- [ ] EXIF削除処理
- [ ] 星評価入力UI
- [ ] クリニック・施術の検索セレクト
- [ ] YYYY-MM形式の日付ピッカー
- [ ] 費用入力（円）
- [ ] 本文文字数カウンター（300文字以内）

### 管理パネル
- [ ] 管理レイアウト（ロールガード）
- [ ] ユーザー一覧（ロール変更・BAN切り替え）
- [ ] クリニックCRUD
- [ ] 施術CRUD
- [ ] 口コミ承認キュー（pendingフィルター）
- [ ] 口コミ詳細 分割ビュー
- [ ] 承認アクション（published_at設定・ISR再生成）
- [ ] 却下アクション（却下理由入力）
- [ ] ISR再生成APIルート

### QA（Stagingにて実施）
- [ ] クロスブラウザテスト（Chrome・Safari・Firefox）
- [ ] モバイルレスポンシブ確認
- [ ] SEO監査（Lighthouse・Search Console）
- [ ] 認証フローのE2Eテスト
- [ ] 画像アップロードのE2Eテスト
- [ ] 管理者承認ワークフローのテスト
- [ ] RLSセキュリティテスト（他ユーザーのdraftが見えないこと確認）

---

*True Log — フルソリューション設計書 | CONFIDENTIAL // INTERNAL USE ONLY*
