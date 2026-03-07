import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDownAZ, faArrowUpAZ } from '@fortawesome/free-solid-svg-icons'
import type { Review, ReviewStatus } from '@/lib/supabase/types'

const PER_PAGE = 15

type StatusFilter = ReviewStatus | 'all'
type Sort = 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc'

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; sort?: string }>
}) {
  const { page: pageStr, status: statusParam, sort: sortParam } = await searchParams
  const page   = Math.max(1, parseInt(pageStr ?? '1'))
  const status = (statusParam ?? 'pending') as StatusFilter
  const sort   = (sortParam   ?? 'date_desc') as Sort
  const from   = (page - 1) * PER_PAGE
  const supabase = await createClient()

  const isRatingSort = sort.startsWith('rating')
  const ascending    = sort.endsWith('asc')

  let query = supabase
    .from('reviews')
    .select('*, profiles(display_name), clinics(name), treatments(name)', { count: 'exact' })

  if (status !== 'all') query = query.eq('status', status as ReviewStatus)
  query = query
    .order(isRatingSort ? 'rating' : 'created_at', { ascending })
    .range(from, from + PER_PAGE - 1)

  const { data: reviews, count } = await query

  // Count per status for badges
  const [
    { count: cntPending },
    { count: cntApproved },
    { count: cntRejected },
    { count: cntAll },
  ] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ])

  const tabs: { label: string; value: StatusFilter; count: number | null }[] = [
    { label: '全て',    value: 'all',      count: cntAll },
    { label: '審査待ち', value: 'pending',  count: cntPending },
    { label: '公開中',  value: 'approved', count: cntApproved },
    { label: '却下',    value: 'rejected', count: cntRejected },
  ]

  const sortOptions: { label: string; value: Sort }[] = [
    { label: '新しい順',    value: 'date_desc' },
    { label: '古い順',      value: 'date_asc' },
    { label: '評価が高い順', value: 'rating_desc' },
    { label: '評価が低い順', value: 'rating_asc' },
  ]

  function buildHref(s: StatusFilter, o: Sort, p = 1) {
    const params = new URLSearchParams()
    params.set('status', s)
    if (o !== 'date_desc') params.set('sort', o)
    if (p > 1) params.set('page', String(p))
    return `/admin/reviews?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">口コミ管理</h1>
        <p className="text-base text-gray-500 mt-0.5">投稿された口コミの審査・管理</p>
      </div>

      {/* Tabs + Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <Link
              key={t.value}
              href={buildHref(t.value, sort)}
              className={`px-4 py-2 rounded-xl text-base font-semibold transition-all flex items-center gap-1.5 ${
                status === t.value
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
              <span className={`text-sm px-1.5 py-0.5 rounded-full ${
                status === t.value ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-400'
              }`}>
                {t.count ?? 0}
              </span>
            </Link>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <FontAwesomeIcon
            icon={sort.endsWith('asc') ? faArrowUpAZ : faArrowDownAZ}
            className="w-3.5 h-3.5 text-gray-400"
          />
          {sortOptions.map(o => (
            <Link
              key={o.value}
              href={buildHref(status, o.value)}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                sort === o.value
                  ? 'bg-brand-50 text-brand-600 font-semibold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-base">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm uppercase tracking-wide">タイトル</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm uppercase tracking-wide">ユーザー</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm uppercase tracking-wide">クリニック</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm uppercase tracking-wide">ステータス</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm uppercase tracking-wide">投稿日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(reviews as Review[])?.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 max-w-[180px] truncate font-medium text-gray-900">{r.title}</td>
                <td className="px-4 py-3 text-gray-500">{r.profiles?.display_name}</td>
                <td className="px-4 py-3 text-gray-500">{r.clinics?.name ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {new Date(r.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/reviews/${r.id}`}
                    className="text-brand-600 hover:text-brand-700 font-semibold text-sm"
                  >
                    詳細 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reviews?.length && (
          <p className="text-center text-gray-400 py-12 text-base">口コミがありません</p>
        )}
      </div>

      <Pagination
        page={page}
        total={count ?? 0}
        perPage={PER_PAGE}
        basePath={buildHref(status, sort).replace(/&?page=\d+/, '') + '&'}
      />
    </div>
  )
}
