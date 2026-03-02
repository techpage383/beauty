import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { ReviewCard } from '@/components/review/ReviewCard'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { localBusinessSchema } from '@/lib/seo/schemas'
import type { Review } from '@/lib/supabase/types'

export const revalidate = 3600

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createStaticClient()
  const { data } = await supabase.from('clinics').select('slug').eq('is_published', true)
  return (data ?? []).map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params
}: {
  params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('clinics').select('name, description').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: `${data.name} 口コミ・評価`,
    description: data.description ?? `${data.name}の口コミ・評価・施術情報をチェック。`,
  }
}

export default async function ClinicDetailPage({ params
}: {
  params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!clinic) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(display_name), clinics(name, slug), treatments(name), review_images(*)')
    .eq('clinic_id', clinic.id)
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const avgRating = reviews?.length
    ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
    : 0

  return (
    <>
      <JsonLd data={localBusinessSchema(clinic, reviews?.length ?? 0, avgRating)} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb crumbs={[
          { name: 'TOP', href: '/' },
          { name: 'クリニック一覧', href: '/clinics' },
          { name: clinic.name, href: `/clinics/${clinic.slug}` },
        ]} />

        {/* Clinic card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-7 mb-10 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              🏥
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{clinic.name}</h1>
              {clinic.address && (
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                  <span>📍</span>{clinic.address}
                </p>
              )}
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400 font-bold text-lg">★ {avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">（{reviews.length}件の口コミ）</span>
                </div>
              )}
              {clinic.description && (
                <p className="text-gray-600 leading-relaxed text-sm">{clinic.description}</p>
              )}
              {clinic.website_url && (
                <a
                  href={clinic.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-sm text-brand-600 hover:text-brand-700 font-semibold hover:underline"
                >
                  公式サイト →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            口コミ <span className="text-gray-400 font-normal text-base">（{reviews?.length ?? 0}件）</span>
          </h2>
        </div>

        {reviews?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(reviews as Review[]).map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-16 text-center text-gray-400">
            <p className="text-3xl mb-2">✍️</p>
            <p className="text-sm">まだ口コミがありません</p>
          </div>
        )}
      </div>
    </>
  )
}
