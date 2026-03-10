import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { reviewSchema } from '@/lib/seo/schemas'
import { getPublicUrl } from '@/lib/image/upload'
import { avgScore } from '@/lib/supabase/types'
import type { Review } from '@/lib/supabase/types'

export const revalidate = 3600

const SCORE_ITEMS = [
  { key: 'score_doctor',     label: '執刀医の技術力（仕上がり満足度）' },
  { key: 'score_counseling', label: 'カウンセリングの誠実度' },
  { key: 'score_anesthesia', label: '麻酔・痛みの管理' },
  { key: 'score_aftercare',  label: 'アフターケアの充実度' },
  { key: 'score_price',      label: '価格の妥当性' },
  { key: 'score_staff',      label: '看護師・スタッフの対応' },
  { key: 'score_facility',   label: '院内の清潔感・設備' },
  { key: 'score_downtime',   label: 'ダウンタイムの許容度（情報の正確性）' },
] as const

const BODY_SECTIONS = [
  { key: 'body_reason',       label: '選んだ理由と妥当性' },
  { key: 'body_counseling',   label: 'カウンセリングのリアル' },
  { key: 'body_experience',   label: '術中・術後の体感' },
  { key: 'body_satisfaction', label: '仕上がりの満足度とギャップ' },
  { key: 'body_advice',       label: '後輩患者へのアドバイス' },
] as const

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  const supabase = createStaticClient()
  const { data } = await supabase.from('reviews').select('slug').eq('status', 'approved')
  return (data ?? []).map(r => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('reviews')
    .select('title, body_reason, review_images(*)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()
  if (!data) return {}
  const firstImage = (data.review_images as { storage_path: string }[])?.[0]
  return {
    title: data.title,
    description: (data.body_reason ?? '').slice(0, 120),
    openGraph: firstImage
      ? { images: [getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, firstImage.storage_path)] }
      : undefined,
  }
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
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
  const avg = avgScore(r)

  return (
    <>
      <JsonLd data={reviewSchema(r)} />

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Breadcrumb crumbs={[
            { name: 'TOP', href: '/' },
            { name: '体験投稿アーカイブ', href: '/reviews' },
            { name: r.title, href: `/reviews/${r.slug}` },
          ]} />

          <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">

            {/* ── Header ── */}
            <div className="p-7 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  {r.body_part && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full mb-3">
                      {r.body_part}
                    </span>
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                    {r.title}
                  </h1>
                </div>
                {r.is_verified && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full whitespace-nowrap">
                    ✓ 認証済
                  </span>
                )}
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-5">
                {r.cost && (
                  <div>総額: <span className="font-bold text-gray-900">¥{r.cost.toLocaleString()}</span></div>
                )}
                {r.price_type && (
                  <div>価格: <span className="font-semibold text-gray-700">{r.price_type}</span></div>
                )}
                {r.treatment_date && (
                  <div>施術日: <span className="font-semibold text-gray-700">{r.treatment_date}</span></div>
                )}
                {r.anesthesia && (
                  <div>麻酔: <span className="font-semibold text-gray-700">{r.anesthesia}</span></div>
                )}
                {r.treatments?.name && (
                  <div>施術: <span className="font-semibold text-gray-700">{r.treatments.name}</span></div>
                )}
                {r.clinics?.name && (
                  <div>クリニック:
                    <Link href={`/clinics/${r.clinics.slug}`} className="font-semibold text-brand-600 hover:underline ml-1">
                      {r.clinics.name}
                    </Link>
                  </div>
                )}
              </div>

              {/* Average score */}
              {avg !== null && (
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">平均スコア</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {avg.toFixed(1)}<span className="text-xl text-gray-400">/5.0</span>
                  </p>
                </div>
              )}
            </div>

            {/* ── 8-item scores ── */}
            {SCORE_ITEMS.some(s => r[s.key] !== null) && (
              <div className="p-7 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-5">8項目スコア</h2>
                <div className="space-y-4">
                  {SCORE_ITEMS.map(({ key, label }) => {
                    const val = r[key]
                    if (val === null) return null
                    return (
                      <div key={key} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-gray-600 flex-1">{label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div
                                key={i}
                                className={`w-6 h-6 rounded ${i <= val ? 'bg-brand-700' : 'bg-gray-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-base font-bold text-gray-900 w-10 text-right">{val}/5</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  ※ 各項目は1〜5点で評価されています。スコアはあくまで投稿者個人の主観です。
                </p>
              </div>
            )}

            {/* ── Images ── */}
            {r.review_images && r.review_images.length > 0 && (
              <div className="p-7 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">添付画像</h2>
                <div className="flex gap-3 flex-wrap">
                  {r.review_images.map(img => (
                    <div key={img.id} className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-100">
                      <Image
                        src={getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, img.storage_path)}
                        alt="体験画像"
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 5 body sections ── */}
            <div className="p-7 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                自由記述（合計500文字以上推奨）
              </h2>
              <div className="space-y-7">
                {BODY_SECTIONS.map(({ key, label }) => {
                  const text = r[key]
                  if (!text) return null
                  return (
                    <div key={key}>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{label}</h3>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-[15px]">{text}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Verification badge ── */}
            <div className="p-7 border-b border-gray-100 bg-gray-50">
              <h3 className="text-base font-semibold text-gray-900 mb-3">証拠資料について</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                証拠資料（領収書または予約画面）の提出により「認証済」バッジが付与されます。<br />
                証拠資料は任意で非公開にすることもできます。
              </p>
              {r.is_verified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">
                  ✓ 認証済（証拠資料提出済み）
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 text-sm rounded-full">
                  未認証
                </span>
              )}
            </div>

          </article>

          {/* ── CTA ── */}
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">あなたの体験も記録しませんか?</h3>
            <p className="text-sm text-gray-400 mb-6">
              評価ではなく、事実の整理として。<br />
              あなたの言葉が、誰かの理解につながります。
            </p>
            <Link
              href="/post/new"
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              自分の体験を記録する
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
