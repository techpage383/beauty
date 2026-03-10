-- ============================================================
-- Be Voice — Move category from treatments to reviews
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add category column to reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Drop category from treatments (no longer needed)
ALTER TABLE public.treatments
  DROP COLUMN IF EXISTS category;
