import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import type { Review } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'マイページ' }

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string }>
}) {
  const { posted } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active) redirect('/banned')

  // Check terms agreement
  const { data: agreement } = await supabase
    .from('user_agreements')
    .select('id')
    .eq('user_id', user.id)
    .eq('version', 'v1.0')
    .single()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, clinics(name), treatments(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">マイページ</h1>
      <p className="text-gray-500 text-sm mb-8">ようこそ、{profile?.display_name} さん</p>

      {posted === '1' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 text-sm">
          口コミを投稿しました。審査後に公開されます。
        </div>
      )}

      {!agreement && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
          <strong>利用規約への同意が必要です。</strong>
          <a href="/terms" className="ml-2 text-brand-600 underline">規約を確認する →</a>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">投稿した口コミ</h2>
        <Link
          href="/post/new"
          className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition"
        >
          + 新しい口コミ
        </Link>
      </div>

      {reviews?.length ? (
        <div className="space-y-3">
          {(reviews as Review[]).map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={r.status} />
                    {r.clinics && <span className="text-xs text-gray-400">{r.clinics.name}</span>}
                    {r.treatments && <span className="text-xs text-gray-400">{r.treatments.name}</span>}
                  </div>
                  <p className="font-medium text-gray-900 truncate">{r.title}</p>
                  {r.rating && <StarRating rating={r.rating} />}
                  {r.status === 'rejected' && r.rejected_reason && (
                    <p className="text-xs text-red-500 mt-1">却下理由: {r.rejected_reason}</p>
                  )}
                </div>
                {(r.status === 'draft' || r.status === 'pending') && (
                  <Link
                    href={`/post/${r.id}/edit`}
                    className="text-xs text-brand-600 hover:underline shrink-0"
                  >
                    編集
                  </Link>
                )}
                {r.status === 'approved' && (
                  <Link
                    href={`/reviews/${r.slug}`}
                    className="text-xs text-brand-600 hover:underline shrink-0"
                  >
                    表示 →
                  </Link>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(r.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400">
          <p className="mb-3">まだ口コミがありません</p>
          <Link
            href="/post/new"
            className="text-brand-600 text-sm hover:underline"
          >
            最初の口コミを投稿する →
          </Link>
        </div>
      )}
    </div>
  )
}
