import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { StarRating } from '@/components/ui/StarRating'
import { JsonLd } from '@/components/seo/JsonLd'
import { reviewSchema } from '@/lib/seo/schemas'
import { getPublicUrl } from '@/lib/image/upload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHospital, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb crumbs={[
          { name: 'TOP', href: '/' },
          { name: '口コミ一覧', href: '/reviews' },
          { name: r.title, href: `/reviews/${r.slug}` },
        ]} />

        <article className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Hero image */}
          {r.review_images && r.review_images.length > 0 && (
            <div className="flex gap-2 p-5 pb-0 flex-wrap">
              {r.review_images.map(img => (
                <div key={img.id} className="relative w-28 h-28 rounded-2xl overflow-hidden border border-gray-100">
                  <Image
                    src={getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, img.storage_path)}
                    alt="口コミ画像"
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="p-7">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {r.clinics && (
                <Link
                  href={`/clinics/${r.clinics.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600 px-3 py-1 rounded-full font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faHospital} className="w-3 h-3" />
                  {r.clinics.name}
                </Link>
              )}
              {r.treatments && (
                <span className="inline-flex items-center gap-1.5 text-sm bg-brand-50 text-brand-600 px-3 py-1 rounded-full font-medium">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="w-3 h-3" />
                  {r.treatments.name}
                </span>
              )}
              {r.treatment_date && (
                <span className="text-sm text-gray-400">{r.treatment_date}</span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-snug">{r.title}</h1>

            {r.rating && (
              <div className="flex items-center gap-2 mb-6">
                <StarRating rating={r.rating} />
                <span className="text-base text-gray-500 font-medium">{r.rating}.0 / 5</span>
              </div>
            )}

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">{r.body}</p>

            {/* Cost */}
            {r.cost && (
              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">施術費用</span>
                <span className="font-bold text-gray-900 text-xl">¥{r.cost.toLocaleString()}</span>
              </div>
            )}

            {/* Author */}
            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-base shrink-0">
                {(r.profiles?.display_name ?? '?')[0].toUpperCase()}
              </div>
              <span className="text-base text-gray-500 font-medium">
                {r.profiles?.display_name ?? '匿名'}
              </span>
            </div>
          </div>
        </article>
      </div>
    </>
  )
}
