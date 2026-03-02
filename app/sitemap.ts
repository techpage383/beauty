import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://truelog.example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const [{ data: reviews }, { data: clinics }, { data: treatments }] = await Promise.all([
    supabase.from('reviews').select('slug, updated_at').eq('status', 'approved'),
    supabase.from('clinics').select('slug, updated_at').eq('is_published', true),
    supabase.from('treatments').select('slug, updated_at').eq('is_published', true),
  ])

  return [
    { url: BASE,                  changeFrequency: 'daily',   priority: 1 },
    { url: `${BASE}/clinics`,     changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/treatments`,  changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/reviews`,     changeFrequency: 'daily',   priority: 0.9 },
    ...(clinics ?? []).map(c => ({
      url: `${BASE}/clinics/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...(treatments ?? []).map(t => ({
      url: `${BASE}/treatments/${t.slug}`,
      lastModified: new Date(t.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...(reviews ?? []).map(r => ({
      url: `${BASE}/reviews/${r.slug}`,
      lastModified: new Date(r.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
