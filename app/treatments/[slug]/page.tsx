import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { ReviewCard } from '@/components/review/ReviewCard'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema } from '@/lib/seo/schemas'
import type { Review } from '@/lib/supabase/types'

export const revalidate = 3600

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createStaticClient()
  const { data } = await supabase.from('treatments').select('slug').eq('is_published', true)
  return (data ?? []).map(t => ({ slug: t.slug }))
}

export async function generateMetadata({ params
}: {
  params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('treatments').select('name, description').eq('slug', slug).single()
  if (!data) return {}
  return {
    title: `${data.name} 口コミ・費用・効果`,
    description: data.description ?? `${data.name}の口コミ・費用・クリニック情報。`,
  }
}

export default async function TreatmentDetailPage({ params
}: {
  params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: treatment } = await supabase
    .from('treatments')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!treatment) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(display_name), clinics(name, slug), treatments(name), review_images(*)')
    .eq('treatment_id', treatment.id)
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  const faqs = Array.isArray(treatment.faq) ? treatment.faq : []

  return (
    <>
      {faqs.length > 0 && <JsonLd data={faqSchema(faqs)} />}

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Breadcrumb crumbs={[
          { name: 'TOP', href: '/' },
          { name: '施術一覧', href: '/treatments' },
          { name: treatment.name, href: `/treatments/${treatment.slug}` },
        ]} />

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          {treatment.category && (
            <span className="inline-block bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full mb-3">
              {treatment.category}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{treatment.name}</h1>
          {treatment.description && (
            <p className="text-gray-700 leading-relaxed">{treatment.description}</p>
          )}
        </div>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">よくある質問</h2>
            <div className="space-y-3">
              {faqs.map((f: { question: string; answer: string }, i: number) => (
                <details key={i} className="bg-white border border-gray-100 rounded-xl p-4 group">
                  <summary className="font-medium text-gray-900 cursor-pointer">
                    Q. {f.question}
                  </summary>
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed">A. {f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          口コミ（{reviews?.length ?? 0}件）
        </h2>
        {reviews?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(reviews as Review[]).map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">まだ口コミがありません。</p>
        )}
      </div>
    </>
  )
}
