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

  const tabs: { label: string; value: ReviewStatus }[] = [
    { label: '審査待ち', value: 'pending' },
    { label: '公開中',   value: 'approved' },
    { label: '却下',     value: 'rejected' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">口コミ管理</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <Link
            key={t.value}
            href={`/admin/reviews?status=${t.value}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              status === t.value
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">タイトル</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ユーザー</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">クリニック</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">投稿日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(reviews as Review[])?.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 max-w-xs truncate">{r.title}</td>
                <td className="px-4 py-3 text-gray-500">{r.profiles?.display_name}</td>
                <td className="px-4 py-3 text-gray-500">{r.clinics?.name ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/reviews/${r.id}`}
                    className="text-brand-600 hover:underline font-medium"
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
