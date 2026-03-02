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

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, clinics(name), treatments(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const approved = reviews?.filter(r => r.status === 'approved').length ?? 0
  const pending  = reviews?.filter(r => r.status === 'pending').length ?? 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Profile card */}
      <div className="relative overflow-hidden bg-gray-950 rounded-3xl p-7 text-white mb-8">
        {/* glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-600 rounded-full blur-[60px] opacity-30" />
        <div className="absolute -bottom-10 left-10 w-32 h-32 bg-pink-500 rounded-full blur-[60px] opacity-20" />

        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 shadow-lg shadow-brand-900/50 flex items-center justify-center text-2xl font-black shrink-0">
            {profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-bold text-xl">{profile?.display_name}</p>
            <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="relative flex gap-8 mt-6 pt-6 border-t border-white/10">
          {[
            { val: reviews?.length ?? 0, label: '投稿数' },
            { val: approved, label: '公開中' },
            { val: pending, label: '審査中' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold">{val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {posted === '1' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 mb-6 text-sm flex items-center gap-2">
          <span>✅</span> 口コミを投稿しました。審査後に公開されます。
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">投稿した口コミ</h2>
        <Link
          href="/post/new"
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm shadow-brand-200 transition-all hover:-translate-y-0.5"
        >
          + 新しい口コミ
        </Link>
      </div>

      {reviews?.length ? (
        <div className="space-y-3">
          {(reviews as Review[]).map(r => (
            <div
              key={r.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={r.status} />
                    {r.clinics && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        {r.clinics.name}
                      </span>
                    )}
                    {r.treatments && (
                      <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">
                        {r.treatments.name}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                  {r.rating && <div className="mt-1.5"><StarRating rating={r.rating} /></div>}
                  {r.status === 'rejected' && r.rejected_reason && (
                    <p className="text-xs text-red-500 mt-2 bg-red-50 px-3 py-1.5 rounded-xl">
                      却下理由: {r.rejected_reason}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center">
                  {(r.status === 'draft' || r.status === 'pending') && (
                    <Link
                      href={`/post/${r.id}/edit`}
                      className="text-xs text-brand-600 hover:underline font-semibold px-3 py-1.5 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                      編集
                    </Link>
                  )}
                  {r.status === 'approved' && (
                    <Link
                      href={`/reviews/${r.slug}`}
                      className="text-xs text-brand-600 hover:underline font-semibold px-3 py-1.5 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                      表示 →
                    </Link>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(r.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-16 text-center text-gray-400">
          <p className="text-5xl mb-4">✍️</p>
          <p className="mb-5 font-medium">まだ口コミがありません</p>
          <Link href="/post/new" className="text-brand-600 text-sm hover:underline font-semibold">
            最初の口コミを投稿する →
          </Link>
        </div>
      )}
    </div>
  )
}
