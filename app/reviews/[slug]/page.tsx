import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { StarRating } from '@/components/ui/StarRating'
import { JsonLd } from '@/components/seo/JsonLd'
import { reviewSchema } from '@/lib/seo/schemas'
import { getPublicUrl } from '@/lib/image/upload'
import type { Review } from '@/lib/supabase/types'

export const revalidate = 3600

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createStaticClient()
  const { data } = await supabase.from('reviews').select('slug').eq('status', 'approved')
  return (data ?? []).map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params
}: {
  params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('title, body, review_images(*)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()
  if (!data) return {}
  const firstImage = (data.review_images as { storage_path: string }[])?.[0]
  return {
    title: data.title,
    description: data.body.slice(0, 120),
    openGraph: firstImage
      ? { images: [getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, firstImage.storage_path)] }
      : undefined,
  }
}

export default async function ReviewDetailPage({ params
}: {
  params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: review } = await supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url), clinics(name, slug), treatments(name, slug), review_images(*)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (!review) notFound()
  const r = review as Review

  return (
    <>
      <JsonLd data={reviewSchema(r)} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumb crumbs={[
          { name: 'TOP', href: '/' },
          { name: '口コミ一覧', href: '/reviews' },
          { name: r.title, href: `/reviews/${r.slug}` },
        ]} />

        <article className="bg-white rounded-2xl border border-gray-100 p-6">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
            {r.clinics && (
              <a href={`/clinics/${r.clinics.slug}`} className="text-brand-600 hover:underline font-medium">
                {r.clinics.name}
              </a>
            )}
            {r.treatments && (
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">{r.treatments.name}</span>
            )}
            {r.treatment_date && <span>{r.treatment_date}</span>}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-3">{r.title}</h1>

          {r.rating && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={r.rating} />
              <span className="text-sm text-gray-500">{r.rating}.0 / 5</span>
            </div>
          )}

          {/* Images */}
          {r.review_images && r.review_images.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {r.review_images.map(img => (
                <div key={img.id} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-100">
                  <Image
                    src={getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, img.storage_path)}
                    alt="口コミ画像"
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              ))}
            </div>
          )}

          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{r.body}</p>

          {/* Cost */}
          {r.cost && (
            <div className="border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-500">費用：</span>
              <span className="font-medium text-gray-800 ml-1">¥{r.cost.toLocaleString()}</span>
            </div>
          )}

          {/* Author */}
          <div className="border-t border-gray-100 pt-4 mt-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-sm">
              {(r.profiles?.display_name ?? '?')[0]}
            </div>
            <span className="text-sm text-gray-500">{r.profiles?.display_name ?? '匿名'}</span>
          </div>
        </article>
      </div>
    </>
  )
}
