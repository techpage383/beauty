import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { ReviewCard } from '@/components/review/ReviewCard'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqSchema } from '@/lib/seo/schemas'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb crumbs={[
          { name: 'TOP', href: '/' },
          { name: '施術一覧', href: '/treatments' },
          { name: treatment.name, href: `/treatments/${treatment.slug}` },
        ]} />

        {/* Treatment header card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-7 mb-10 shadow-sm">
          {treatment.category && (
            <span className="inline-block bg-brand-50 text-brand-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {treatment.category}
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{treatment.name}</h1>
          {treatment.description && (
            <p className="text-gray-600 leading-relaxed">{treatment.description}</p>
          )}
        </div>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-500 rounded-full inline-block" />
              よくある質問
            </h2>
            <div className="space-y-2">
              {faqs.map((f: { question: string; answer: string }, i: number) => (
                <details
                  key={i}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-brand-100 transition-colors"
                >
                  <summary className="flex items-start gap-3 px-5 py-4 cursor-pointer font-medium text-gray-900 list-none">
                    <span className="text-brand-500 font-bold shrink-0">Q.</span>
                    {f.question}
                  </summary>
                  <div className="px-5 pb-4 border-t border-gray-50">
                    <p className="text-gray-600 text-sm leading-relaxed pt-3">
                      <span className="text-brand-400 font-bold mr-1">A.</span>
                      {f.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

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
            <FontAwesomeIcon icon={faPenToSquare} className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">まだ口コミがありません</p>
          </div>
        )}
      </div>
    </>
  )
}
