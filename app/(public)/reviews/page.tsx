import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReviewCard } from '@/components/review/ReviewCard'
import { ReviewsFilter } from '@/components/review/ReviewsFilter'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Pagination } from '@/components/ui/Pagination'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import type { Review } from '@/lib/supabase/types'

export const revalidate = 0

export const metadata: Metadata = {
  title: '体験投稿アーカイブ | 口コミ一覧',
  description: '美容クリニックの施術体験談アーカイブ。実際に受けた方のリアルな声を掲載。カテゴリ・施術名・クリニック名・地域で検索できます。',
}

const PER_PAGE = 12

interface SearchParams {
  page?: string
  category?: string
  surgery?: string
  clinic?: string
  region?: string
  year?: string
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const {
    page: pageStr,
    category = '',
    surgery = '',
    clinic  = '',
    region  = '',
    year    = '',
  } = await searchParams

  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const from = (page - 1) * PER_PAGE
  const supabase = await createClient()

  // ── Resolve filter IDs ─────────────────────────────────────────
  let treatmentIds: string[] | null = null
  let clinicIds: string[] | null    = null

  // Surgery name filter → find matching treatment IDs
  if (surgery) {
    const { data: tData } = await supabase.from('treatments').select('id').ilike('name', `%${surgery}%`)
    treatmentIds = tData?.map(t => t.id) ?? []
  }

  // Clinic name or region filter → find matching clinic IDs
  if (clinic || region) {
    let cq = supabase.from('clinics').select('id')
    if (clinic) cq = cq.ilike('name', `%${clinic}%`)
    if (region) cq = cq.ilike('address', `%${region}%`)
    const { data: cData } = await cq
    clinicIds = cData?.map(c => c.id) ?? []
  }

  // ── Main query ─────────────────────────────────────────────────
  let query = supabase
    .from('reviews')
    .select(
      '*, profiles(display_name), clinics(name, slug, address), treatments(name), review_images(*)',
      { count: 'exact' }
    )
    .eq('status', 'approved')
    .order('published_at', { ascending: false })

  if (category) query = query.eq('category', category)

  if (treatmentIds !== null) {
    if (treatmentIds.length === 0) {
      return renderPage({ reviews: [], count: 0, page, category, surgery, clinic, region, year })
    }
    query = query.in('treatment_id', treatmentIds)
  }

  if (clinicIds !== null) {
    if (clinicIds.length === 0) {
      return renderPage({ reviews: [], count: 0, page, category, surgery, clinic, region, year })
    }
    query = query.in('clinic_id', clinicIds)
  }

  if (year) {
    query = query
      .gte('published_at', `${year}-01-01`)
      .lte('published_at', `${year}-12-31T23:59:59`)
  }

  const { data: reviews, count } = await query.range(from, from + PER_PAGE - 1)

  return renderPage({ reviews: reviews as Review[] ?? [], count: count ?? 0, page, category, surgery, clinic, region, year })
}

function buildBasePath(filters: Record<string, string>) {
  const p = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v) })
  const qs = p.toString()
  return qs ? `/reviews?${qs}` : '/reviews'
}

function renderPage({
  reviews,
  count,
  page,
  category,
  surgery,
  clinic,
  region,
  year,
}: {
  reviews: Review[]
  count: number
  page: number
  category: string
  surgery: string
  clinic: string
  region: string
  year: string
}) {
  const isFiltered = !!(category || surgery || clinic || region || year)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-8">
          <Breadcrumb crumbs={[
            { name: 'TOP', href: '/' },
            { name: '体験投稿アーカイブ', href: '/reviews' },
          ]} />

          <div className="mt-6">
            <p className="text-brand-500 text-xs font-bold tracking-widest mb-2">EXPERIENCE ARCHIVE</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">体験投稿アーカイブ</h1>
            <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            実際に体験した方々の記録です。投稿はすべてユーザーの個人的な体験に基づきます。
            </p>
          </div>

          {/* Disclaimer banner */}
          <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 leading-relaxed">
          本ページは医療体験の共有を目的としています。医療行為の結果を保証するものではありません。 治療判断は必ず医療機関へご相談ください。
          </div>
        </div>
      </div>

      {/* Filters + list */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <ReviewsFilter
          initialCategory={category}
          initialSurgery={surgery}
          initialClinic={clinic}
          initialRegion={region}
          initialYear={year}
        />

        {/* Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {isFiltered
              ? <><span className="font-bold text-gray-800">{count.toLocaleString()}件</span>の体験投稿が見つかりました</>
              : <><span className="font-bold text-gray-800">{count.toLocaleString()}件</span>の体験投稿</>
            }
          </p>
        </div>

        {/* Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {reviews.map(r => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-24 text-center text-gray-400 mb-12">
            <FontAwesomeIcon icon={faPenToSquare} className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-gray-500 mb-1">体験投稿が見つかりませんでした</p>
            <p className="text-sm text-gray-400">条件を変えて再度お試しください</p>
          </div>
        )}

        <Pagination page={page} total={count} perPage={PER_PAGE} basePath={buildBasePath({ category, surgery, clinic, region, year })} />
      </div>

      {/* CTA */}
      <section className="bg-white border-t border-gray-100 py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-gray-400 mb-4">
            あなたの体験も、誰かの参考になります。
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            体験を共有してみませんか？
          </h2>
          <Link
            href="/post/new"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            体験を投稿する
            <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      
    </div>
  )
}
