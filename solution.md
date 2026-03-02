# True Log — Full Solution Document

> Based on: `TrueLog要件定義.pdf` (2026.02.17)
> Generated: 2026-03-01
> Confidential // Internal Use Only

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema (ER Design)](#4-database-schema-er-design)
5. [Directory Structure](#5-directory-structure)
6. [Screen & Route Definitions](#6-screen--route-definitions)
7. [Authentication Flow](#7-authentication-flow)
8. [Post / Review Submission Flow](#8-post--review-submission-flow)
9. [Approval Workflow](#9-approval-workflow)
10. [Admin UI Specifications](#10-admin-ui-specifications)
11. [SEO Strategy & Implementation](#11-seo-strategy--implementation)
12. [Image Upload Specifications](#12-image-upload-specifications)
13. [User Management & Access Control](#13-user-management--access-control)
14. [Terms Agreement Logging](#14-terms-agreement-logging)
15. [URL Structure (SEO-Optimized)](#15-url-structure-seo-optimized)
16. [MVP Scope vs. Future Phases](#16-mvp-scope-vs-future-phases)
17. [Development Schedule](#17-development-schedule)
18. [Deployment Strategy](#18-deployment-strategy)
19. [Payment Milestones](#19-payment-milestones)
20. [Implementation Checklist](#20-implementation-checklist)

---

## 1. Project Overview

**Product Name:** True Log
**Concept:** A cosmetic clinic treatment review & log platform (美容クリニックの施術口コミ・ログサービス)
**Core Purpose:** Users post authentic reviews of cosmetic procedures. Content accumulates as an SEO asset to drive organic traffic and build trust.

| Attribute | Value |
|---|---|
| MVP Period | 6–8 weeks (2026/02/17 – 2026/04/01) |
| Launch Target | 2026/04/01 |
| Budget | ¥650,000 |
| Target Lighthouse SEO | 90+ |
| Target PageSpeed | Good |

---

## 2. Tech Stack

### Frontend & Infrastructure

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/SSG, SEO, React-based UI |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first responsive UI |
| Hosting | Vercel | Next.js-native deployment |

### Backend (Supabase)

| Layer | Technology | Purpose |
|---|---|---|
| Database | Supabase PostgreSQL | Relational data store |
| Auth | Supabase Auth | Google / LINE OAuth |
| Storage | Supabase Storage | Image upload & CDN delivery |
| Edge Functions | Supabase Edge Functions | OCR/API calls (Phase 3+) |
| Row-Level Security | RLS Policies | Per-user data isolation |

### SEO

| Feature | Implementation |
|---|---|
| Structured Data | JSON-LD (Review, FAQPage, BreadcrumbList) |
| Sitemap | Auto-generated XML sitemap |
| OGP | og:image, og:title, og:description per page |
| Meta | Dynamic title / meta description per route |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────┐
│                  Users / Clients             │
└────────────────┬────────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────────┐
│             Vercel (CDN + Edge)              │
│   ┌─────────────────────────────────────┐   │
│   │   Next.js App Router (SSR / SSG)    │   │
│   │   - Public Pages (SSG, cached)      │   │
│   │   - Auth Pages (SSR, private)       │   │
│   │   - Admin Pages (SSR, role-gated)   │   │
│   └──────────────┬──────────────────────┘   │
└──────────────────┼──────────────────────────┘
                   │ API / SDK calls
┌──────────────────▼──────────────────────────┐
│                Supabase                      │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐  │
│  │ PostgreSQL│ │   Auth   │ │  Storage   │  │
│  │  (+ RLS)  │ │Google/LINE│ │ (WebP CDN) │  │
│  └───────────┘ └──────────┘ └────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │        Edge Functions (Phase 3+)      │  │
│  │  Google Vision API / OpenAI OCR       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Deployment Environments

| Environment | Purpose | Notes |
|---|---|---|
| **Dev** | Local development | `.env.local` |
| **Staging** | QA / client preview | Staging URL for PC check |
| **Production** | Live | Requires manual promotion from Staging |

---

## 4. Database Schema (ER Design)

### `users` (managed by Supabase Auth + extension)

```sql
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  is_active   BOOLEAN NOT NULL DEFAULT TRUE, -- FALSE = banned
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `user_agreements`

```sql
CREATE TABLE public.user_agreements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version    TEXT NOT NULL,  -- e.g. 'v1.0', 'v2.0'
  agreed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `clinics`

```sql
CREATE TABLE public.clinics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,    -- e.g. 'shonan-beauty-shinjuku'
  name        TEXT NOT NULL,
  description TEXT,
  address     TEXT,
  website_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `treatments`

```sql
CREATE TABLE public.treatments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,  -- e.g. 'double-eyelid-surgery'
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `reviews` (core post entity)

```sql
CREATE TYPE review_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

CREATE TABLE public.reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,  -- e.g. 'review-123456'
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id       UUID REFERENCES public.clinics(id),
  treatment_id    UUID REFERENCES public.treatments(id),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL CHECK (char_length(body) <= 300),
  treatment_date  TEXT,                  -- YYYY-MM format
  cost            INTEGER,               -- yen
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  status          review_status NOT NULL DEFAULT 'pending',
  rejected_reason TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `review_images`

```sql
CREATE TABLE public.review_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,  -- Supabase Storage path
  order_index SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### RLS Policies (examples)

```sql
-- reviews: users can only read their own drafts; approved are public
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public approved reviews are visible to all"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending/draft reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'pending'));

CREATE POLICY "Admins can do anything"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 5. Directory Structure

```
truelog/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (SSG)
│   │   ├── page.tsx              # Home / LP
│   │   ├── clinics/
│   │   │   ├── page.tsx          # Clinic listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Clinic detail
│   │   ├── treatments/
│   │   │   ├── page.tsx          # Treatment listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Treatment detail
│   │   └── reviews/
│   │       ├── page.tsx          # Review listing
│   │       └── [slug]/
│   │           └── page.tsx      # Review detail
│   ├── (auth)/                   # Auth routes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/route.ts     # OAuth callback
│   ├── (user)/                   # Authenticated user routes
│   │   ├── mypage/page.tsx
│   │   └── post/
│   │       ├── new/page.tsx      # New review form
│   │       └── [id]/edit/page.tsx
│   ├── admin/                    # Admin routes (role-gated)
│   │   ├── layout.tsx            # Admin layout + auth guard
│   │   ├── page.tsx              # Dashboard
│   │   ├── users/page.tsx
│   │   ├── clinics/page.tsx
│   │   ├── treatments/page.tsx
│   │   ├── reviews/page.tsx      # Approval queue
│   │   └── reviews/[id]/page.tsx # Review detail + approve/reject
│   ├── api/
│   │   └── revalidate/route.ts   # ISR revalidation
│   ├── layout.tsx                # Root layout
│   ├── sitemap.ts                # Dynamic sitemap
│   └── robots.ts
├── components/
│   ├── ui/                       # Base UI primitives
│   ├── review/                   # Review card, form, etc.
│   ├── clinic/
│   ├── admin/
│   └── seo/                      # JsonLd, MetaTags
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (RSC)
│   │   └── middleware.ts
│   ├── image/
│   │   └── upload.ts             # WebP conversion, EXIF strip
│   └── seo/
│       └── schemas.ts            # JSON-LD generators
├── middleware.ts                 # Route protection
├── .env.local
├── tailwind.config.ts
└── next.config.ts
```

---

## 6. Screen & Route Definitions

### Public Screens (11 screens)

| # | Screen | Route | Render |
|---|---|---|---|
| 1 | Home / LP | `/` | SSG |
| 2 | Clinic Listing | `/clinics` | SSG + ISR |
| 3 | Clinic Detail | `/clinics/[slug]` | SSG + ISR |
| 4 | Treatment Listing | `/treatments` | SSG + ISR |
| 5 | Treatment Detail | `/treatments/[slug]` | SSG + ISR |
| 6 | Review Listing | `/reviews` | SSG + ISR |
| 7 | Review Detail | `/reviews/[slug]` | SSG + ISR |
| 8 | User Registration | `/register` | SSR |
| 9 | My Page | `/mypage` | SSR (auth) |
| 10 | Post Review | `/post/new` | SSR (auth) |
| 11 | Login | `/login` | SSR |

### Admin Screens (6 screens)

| # | Screen | Route | Notes |
|---|---|---|---|
| 1 | User Management | `/admin/users` | Role assignment, BAN |
| 2 | Clinic Management | `/admin/clinics` | CRUD |
| 3 | Treatment Management | `/admin/treatments` | CRUD |
| 4 | Review Management | `/admin/reviews` | Approval queue |
| 5 | Review Detail | `/admin/reviews/[id]` | Split view, approve/reject |
| 6 | Approval Log | `/admin/reviews/log` | Audit trail |

---

## 7. Authentication Flow

### OAuth (Google / LINE) via Supabase Auth

```
User clicks "Login with Google/LINE"
        │
        ▼
Supabase Auth → OAuth provider redirect
        │
        ▼
OAuth callback → /auth/callback
        │
        ▼
Create / upsert profile in public.profiles
        │
        ▼
Check terms agreement (user_agreements)
        │
   Not agreed?──────────────────────────────► Terms page → agree → log to DB
        │
        ▼
Redirect to /mypage (or intended destination)
```

### Middleware Route Protection

```typescript
// middleware.ts
export const config = {
  matcher: ['/mypage/:path*', '/post/:path*', '/admin/:path*'],
}

// Logic:
// - /admin/* → must have role = 'admin'
// - /mypage/*, /post/* → must be authenticated
// - is_active = false → redirect to /banned
```

---

## 8. Post / Review Submission Flow

```
User fills out review form (/post/new)
  - Select clinic (search/dropdown, linked to clinics table)
  - Select treatment (linked to treatments table)
  - Enter title, body (≤300 chars)
  - Enter treatment_date (YYYY-MM picker)
  - Enter cost (¥)
  - Upload images (max 5, max 5MB each)
  - Rating (1–5 stars)
        │
        ▼
Client-side validation (TypeScript + Zod)
        │
        ▼
Image processing (before upload):
  - Resize to ≤ 1600px
  - Convert to WebP
  - Strip EXIF metadata
        │
        ▼
Upload images → Supabase Storage (path: reviews/{user_id}/{uuid}.webp)
        │
        ▼
Insert into reviews table (status = 'pending')
Insert into review_images table
        │
        ▼
Redirect to /mypage (show "Under review" banner)
```

---

## 9. Approval Workflow

### Status State Machine

```
draft ──────────────────────────────────────┐
  │                                         │
  ▼  (user submits)                         │
pending                                     │
  │                                         │
  ├── Admin approves ──────► approved ──────► (published_at set, ISR revalidated)
  │
  └── Admin rejects ──────► rejected (rejected_reason stored)
                                │
                                └──► User can edit & re-submit → pending
```

### Admin Review Detail Screen (Split View)

```
┌──────────────────────┬────────────────────────┐
│   Review Content     │   User Post Preview     │
│                      │                         │
│  ID: #12345          │  [Image 1] [Image 2]    │
│  User: @username     │                         │
│  Clinic: XXX clinic  │  Title: ...             │
│  Treatment: XXX      │  Body: ...              │
│  Date: 2026-01       │  Rating: ★★★★☆          │
│  Cost: ¥30,000       │  Cost: ¥30,000           │
│                      │                         │
│  Status: pending     │                         │
│                      │                         │
│  [Approve] [Reject]  │                         │
│  Reject reason: ___  │                         │
└──────────────────────┴────────────────────────┘
```

---

## 10. Admin UI Specifications

### Review Queue (`/admin/reviews`)

- Paginated list (15 per page)
- Filter by status: `pending` | `approved` | `rejected`
- Sort by: `created_at` DESC (default)
- Columns: ID, User, Clinic, Treatment, Date Submitted, Status, Action

### Approve Action

```typescript
async function approveReview(id: string) {
  await supabase
    .from('reviews')
    .update({ status: 'approved', published_at: new Date().toISOString() })
    .eq('id', id)
  // Trigger ISR revalidation
  await fetch('/api/revalidate?path=/reviews/' + slug)
}
```

### Reject Action

```typescript
async function rejectReview(id: string, reason: string) {
  await supabase
    .from('reviews')
    .update({ status: 'rejected', rejected_reason: reason })
    .eq('id', id)
}
```

### OCR (Future — Phase 3)

- Admin screen will have "OCR Extract" button
- Calls Supabase Edge Function → Google Vision API / OpenAI
- Extracts: Clinic Name, Date, Cost from uploaded receipt/document images
- Pre-fills review fields

---

## 11. SEO Strategy & Implementation

### Strategic Goal

Build "口コミ" (user review) content as a durable organic SEO asset. Rank for long-tail treatment + clinic queries.

### URL-Based SEO

- Human-readable slugs: `/clinics/shonan-beauty-shinjuku`
- No IDs in public URLs
- Breadcrumb-compatible hierarchy: `TOP > Clinics > Shonan Beauty Shinjuku`

### JSON-LD Schemas

**Review Page (`/reviews/[slug]`)**
```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "LocalBusiness",
    "name": "Clinic Name"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 4,
    "bestRating": 5
  },
  "author": { "@type": "Person", "name": "Display Name" },
  "reviewBody": "Review body text..."
}
```

**Clinic Page (`/clinics/[slug]`)**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Clinic Name",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.2,
    "reviewCount": 38
  }
}
```

**Breadcrumb**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "TOP", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "Clinics", "item": "https://example.com/clinics" },
    { "@type": "ListItem", "position": 3, "name": "Shonan Beauty", "item": "https://example.com/clinics/shonan-beauty" }
  ]
}
```

**FAQ (Treatment pages)**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is double eyelid surgery?",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    }
  ]
}
```

### Dynamic Metadata (Next.js)

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

### Sitemap

```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reviews = await getApprovedReviews()
  const clinics = await getPublishedClinics()
  const treatments = await getPublishedTreatments()
  return [
    { url: 'https://example.com', changeFrequency: 'daily', priority: 1 },
    ...clinics.map(c => ({ url: `https://example.com/clinics/${c.slug}`, changeFrequency: 'weekly', priority: 0.8 })),
    ...treatments.map(t => ({ url: `https://example.com/treatments/${t.slug}`, changeFrequency: 'weekly', priority: 0.8 })),
    ...reviews.map(r => ({ url: `https://example.com/reviews/${r.slug}`, changeFrequency: 'monthly', priority: 0.6 })),
  ]
}
```

### Core Web Vitals & Performance Targets

| Metric | Target |
|---|---|
| Lighthouse SEO | 90+ |
| PageSpeed | Good |
| LCP | < 2.5s |
| CLS | < 0.1 |
| Images | WebP, lazy-loaded, sized |
| Fonts | Preloaded, `font-display: swap` |

### E-E-A-T Signals

- User display name on reviews
- Treatment date, cost transparency
- Clinic links to official website
- Admin-verified badge on approved reviews

---

## 12. Image Upload Specifications

| Attribute | Specification |
|---|---|
| Max images per review | 5 |
| Max file size | 5MB per image |
| Accepted formats | .jpg / .png / .heic |
| Max resolution | 1600px (longest edge) |
| Output format | WebP (auto-converted) |
| EXIF metadata | Stripped before upload |
| Storage | Supabase Storage (CDN-backed) |

### Client-side Processing Flow

```typescript
async function processImage(file: File): Promise<Blob> {
  // 1. Load image into canvas
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  canvas.width = bitmap.width * scale
  canvas.height = bitmap.height * scale
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  // 2. Export as WebP (EXIF is stripped by canvas API)
  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/webp', 0.85))
}
```

### Storage Path Convention

```
reviews/{user_id}/{review_id}/{order_index}.webp
```

---

## 13. User Management & Access Control

### Roles

| Role | Permissions |
|---|---|
| `user` | Post reviews, view own posts, edit own pending/draft |
| `admin` | All CRUD, approve/reject reviews, manage users/clinics/treatments |

### Ban System

- `is_active = false` → user is banned
- Banned users: redirected to `/banned` page on any authenticated route
- Middleware checks `is_active` on each protected request
- Ban does not delete historical approved reviews (data preserved)

### MVP Access Control Matrix

| Action | Unauthenticated | User | Admin |
|---|---|---|---|
| View approved reviews | ✅ | ✅ | ✅ |
| Post review | ❌ | ✅ | ✅ |
| Edit own review (pending) | ❌ | ✅ | ✅ |
| Delete own review | ❌ | ✅ | ✅ |
| Approve/reject reviews | ❌ | ❌ | ✅ |
| Manage clinics/treatments | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## 14. Terms Agreement Logging

### Table: `user_agreements`

```sql
CREATE TABLE public.user_agreements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version    TEXT NOT NULL,       -- 'v1.0', 'v2.0', ...
  agreed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Logic

```typescript
async function checkAndRecordAgreement(userId: string, currentVersion: string) {
  const { data } = await supabase
    .from('user_agreements')
    .select('version')
    .eq('user_id', userId)
    .eq('version', currentVersion)
    .single()

  if (!data) {
    // Show terms modal → on agree:
    await supabase
      .from('user_agreements')
      .insert({ user_id: userId, version: currentVersion })
  }
}
```

### Version Scenarios

| Scenario | Result |
|---|---|
| New user, v1.0 current | Prompt v1.0, log on agree |
| Existing user (v1.0 agreed), v2.0 released | Prompt v2.0, log on agree |
| Existing user already agreed to current version | No prompt |

---

## 15. URL Structure (SEO-Optimized)

### Slug Generation Rules

- Lowercase, hyphen-separated English (romanized if Japanese)
- No ID numbers in public URLs
- Unique enforced at DB level (`UNIQUE` constraint on `slug`)
- Example mappings:

| Content | Slug | Full URL |
|---|---|---|
| Shonan Beauty Shinjuku | `shonan-beauty-shinjuku` | `/clinics/shonan-beauty-shinjuku` |
| Double Eyelid Surgery | `double-eyelid-surgery` | `/treatments/double-eyelid-surgery` |
| Review #123456 | `review-a1b2c3` | `/reviews/review-a1b2c3` |

### Next.js Static Generation

```typescript
// app/clinics/[slug]/page.tsx
export async function generateStaticParams() {
  const clinics = await getPublishedClinics()
  return clinics.map(c => ({ slug: c.slug }))
}

export const revalidate = 3600 // ISR: re-generate every 1 hour
```

---

## 16. MVP Scope vs. Future Phases

### MVP (Phase 1) — Launch by 2026/04/01

- [x] LP / Top page
- [x] Clinic listing & detail
- [x] Treatment listing & detail
- [x] Review listing & detail
- [x] User registration & login (Email + Google)
- [x] Review submission form (with image upload)
- [x] Admin approval workflow
- [x] Admin CRUD for clinics & treatments
- [x] SEO: JSON-LD, meta, sitemap, OGP
- [x] RLS security policies
- [x] Terms agreement logging
- [x] Dev / Staging / Prod environments

### Phase 2 — Auth & Social

- [ ] LINE OAuth login
- [ ] Twitter / X OAuth login
- [ ] Social sharing features

### Phase 3 — SEO & LP Enhancement

- [ ] SEO LP pages per treatment category
- [ ] FAQ page expansion
- [ ] OCR: Google Vision API / OpenAI for receipt parsing
- [ ] OCR pre-fills review fields (Clinic Name, Date, Cost)

### Phase 4 — Monetization

- [ ] Amazon affiliate integration
- [ ] Clinic premium listing (paid)

### Out of Scope for MVP

| Feature | Phase |
|---|---|
| AI-powered recommendations | Phase 2+ |
| Google/LINE SNS login beyond Google | Phase 2+ |
| OCR receipt scanning | Phase 3 |
| Payment / affiliate | Phase 4 |
| Native mobile app | Phase 5+ |

---

## 17. Development Schedule

| Sprint | Dates | Tasks | Deliverables |
|---|---|---|---|
| **Sprint 1** | 2/17 – 2/24 | MVP setup, DB schema, URL design, SEO foundations | DB schema, ER diagram, URL map |
| **Sprint 2** | 2/25 – 3/3 | UI components, Auth, Review form | Auth flow, Post form UI |
| **Sprint 3** | 3/4 – 3/24 | LP, clinic/treatment pages, review pages, admin UI, SEO | Full public site, Admin panel |
| **Sprint 4** | 3/25 – 3/31 | Staging deploy, QA, SEO audit, bug fixes | Staging URL, QA report |
| **Launch** | 4/1 | Production deploy | GitHub, Supabase, Live URL |

### Communication Policy

- **Hours:** 8:30 – 22:30
- **Channels:** Slack / Chatwork / Zoom
- **Response SLA:** Within 24 hours
- **Staging reviews:** 1 review cycle per sprint

---

## 18. Deployment Strategy

### Environment Config

```
# .env.local (Dev)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Staging (Vercel env vars)
NEXT_PUBLIC_SITE_URL=https://truelog-staging.vercel.app

# Production (Vercel env vars)
NEXT_PUBLIC_SITE_URL=https://truelog.example.com
```

### Vercel Project Setup

```
Dev branch   → auto-preview deployments
main branch  → Staging environment
release tag  → Production environment (manual promote)
```

### Supabase Migrations

```bash
supabase db diff --schema public | supabase db push
```

---

## 19. Payment Milestones

| Step | Amount | Trigger |
|---|---|---|
| **Step 1** | ¥270,000 | Contract signing (2/17) |
| **Step 2** | ¥180,000 | Mid-development delivery (Staging URL live) |
| **Step 3** | ¥200,000 | SEO deliverable (JSON-LD, sitemap, Lighthouse 90+) |
| **Total** | **¥650,000** | — |

---

## 20. Implementation Checklist

### Foundation
- [ ] Initialize Next.js 14 project with App Router + TypeScript + Tailwind
- [ ] Configure Supabase project (Dev + Staging + Prod)
- [ ] Set up Vercel project with environment branches
- [ ] Create all DB tables with migrations
- [ ] Configure RLS policies for all tables
- [ ] Set up Supabase Auth with Google OAuth

### Authentication
- [ ] Login page with Google OAuth button
- [ ] OAuth callback handler (`/auth/callback`)
- [ ] Profile auto-creation on first login
- [ ] Terms agreement check on first login
- [ ] Middleware route protection
- [ ] Ban check in middleware

### Public Pages
- [ ] Home / LP page (SSG)
- [ ] Clinic listing with pagination (15/page)
- [ ] Clinic detail with aggregate rating
- [ ] Treatment listing with pagination
- [ ] Treatment detail with FAQ section
- [ ] Review listing with filters
- [ ] Review detail with full content

### SEO
- [ ] Dynamic `generateMetadata` for all routes
- [ ] JSON-LD Review schema on review pages
- [ ] JSON-LD LocalBusiness schema on clinic pages
- [ ] JSON-LD BreadcrumbList on all pages
- [ ] JSON-LD FAQPage on treatment pages
- [ ] Dynamic sitemap.ts
- [ ] OGP images per page
- [ ] robots.ts
- [ ] Lighthouse audit ≥ 90

### User Features
- [ ] My page (own review history)
- [ ] Review submission form
- [ ] Image upload (client-side WebP conversion)
- [ ] Image EXIF stripping
- [ ] Star rating input
- [ ] Clinic/treatment search-select
- [ ] YYYY-MM date picker
- [ ] Cost input (¥)
- [ ] Body text counter (≤ 300 chars)

### Admin Panel
- [ ] Admin layout with role guard
- [ ] User list + role assignment + ban toggle
- [ ] Clinic CRUD
- [ ] Treatment CRUD
- [ ] Review approval queue (pending filter)
- [ ] Review detail split view
- [ ] Approve action (sets published_at, triggers ISR)
- [ ] Reject action with reason field
- [ ] ISR revalidation API route

### Quality Assurance (Staging)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsive check
- [ ] SEO audit (Lighthouse, Search Console)
- [ ] Auth flow end-to-end test
- [ ] Image upload end-to-end test
- [ ] Admin approval workflow test
- [ ] RLS security test (user cannot see another user's drafts)

---

*True Log — Full Solution Document | Confidential // Internal Use Only*
