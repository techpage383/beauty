import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import type { Review, ReviewStatus } from '@/lib/supabase/types'

const PER_PAGE = 15

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: ReviewStatus }>
}) {
  const { page: pageStr, status: statusParam } = await searchParams
  const page     = Math.max(1, parseInt(pageStr ?? '1'))
  const status   = (statusParam ?? 'pending') as ReviewStatus
  const from     = (page - 1) * PER_PAGE
  const supabase = await createClient()

  const { data: reviews, count } = await supabase
    .from('reviews')
    .select('*, profiles(display_name), clinics(name), treatments(name)', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(from, from + PER_PAGE - 1)

  const tabs: { label: string; value: ReviewStatus; color: string }[] = [
    { label: '審査待ち', value: 'pending',  color: 'text-yellow-700' },
    { label: '公開中',   value: 'approved', color: 'text-green-700' },
    { label: '却下',     value: 'rejected', color: 'text-red-700' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">口コミ管理</h1>
        <p className="text-sm text-gray-500 mt-0.5">投稿された口コミの審査・管理</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <Link
            key={t.value}
            href={`/admin/reviews?status=${t.value}`}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              status === t.value
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">タイトル</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">ユーザー</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">クリニック</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">ステータス</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">投稿日</th>
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
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(r.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/reviews/${r.id}`}
                    className="text-brand-600 hover:text-brand-700 font-semibold text-xs"
                  >
                    詳細 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reviews?.length && (
          <p className="text-center text-gray-400 py-12 text-sm">口コミがありません</p>
        )}
      </div>

      <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} basePath={`/admin/reviews?status=${status}&`} />
    </div>
  )
}
