-- ============================================================
-- True Log — Initial Database Migration
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM TYPES ─────────────────────────────────────────────
CREATE TYPE public.review_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE public.user_role     AS ENUM ('user', 'admin');

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  display_name TEXT,
  avatar_url   TEXT,
  role         user_role   NOT NULL DEFAULT 'user',
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── USER AGREEMENTS ────────────────────────────────────────
CREATE TABLE public.user_agreements (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version   TEXT        NOT NULL,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CLINICS ────────────────────────────────────────────────
CREATE TABLE public.clinics (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        UNIQUE NOT NULL,
  name         TEXT        NOT NULL,
  description  TEXT,
  address      TEXT,
  website_url  TEXT,
  is_published BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TREATMENTS ─────────────────────────────────────────────
CREATE TABLE public.treatments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        UNIQUE NOT NULL,
  name         TEXT        NOT NULL,
  description  TEXT,
  category     TEXT,
  faq          JSONB,
  is_published BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REVIEWS ────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT          UNIQUE NOT NULL,
  user_id         UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id       UUID          REFERENCES public.clinics(id),
  treatment_id    UUID          REFERENCES public.treatments(id),
  title           TEXT          NOT NULL,
  body            TEXT          NOT NULL CHECK (char_length(body) <= 300),
  treatment_date  TEXT,
  cost            INTEGER,
  rating          SMALLINT      CHECK (rating BETWEEN 1 AND 5),
  status          review_status NOT NULL DEFAULT 'pending',
  rejected_reason TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-generate slug for reviews
CREATE OR REPLACE FUNCTION public.generate_review_slug()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := 'review-' || substring(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_review_slug
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.generate_review_slug();

-- ─── REVIEW IMAGES ──────────────────────────────────────────
CREATE TABLE public.review_images (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id    UUID        NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL,
  order_index  SMALLINT    NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX idx_reviews_status      ON public.reviews(status);
CREATE INDEX idx_reviews_user_id     ON public.reviews(user_id);
CREATE INDEX idx_reviews_clinic_id   ON public.reviews(clinic_id);
CREATE INDEX idx_reviews_treatment_id ON public.reviews(treatment_id);
CREATE INDEX idx_reviews_published_at ON public.reviews(published_at DESC);
CREATE INDEX idx_clinics_slug        ON public.clinics(slug);
CREATE INDEX idx_treatments_slug     ON public.treatments(slug);
CREATE INDEX idx_review_images_review ON public.review_images(review_id);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile"     ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_agreements
ALTER TABLE public.user_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own agreements"   ON public.user_agreements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own agreements" ON public.user_agreements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published clinics are public"  ON public.clinics FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage clinics"         ON public.clinics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- treatments
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published treatments are public" ON public.treatments FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage treatments"        ON public.treatments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are public"     ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users view own reviews"          ON public.reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reviews"        ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pending reviews" ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('draft', 'pending'));
CREATE POLICY "Users delete own reviews"        ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all reviews"       ON public.reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- review_images
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Images of approved reviews are public" ON public.review_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_id AND r.status = 'approved')
);
CREATE POLICY "Users manage own review images" ON public.review_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_id AND r.user_id = auth.uid())
);
CREATE POLICY "Admins manage all review images" ON public.review_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ─── STORAGE BUCKET ─────────────────────────────────────────
-- Run this in Supabase dashboard > Storage, or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reviews', 'reviews', true);
