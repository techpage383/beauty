import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faPenToSquare, faArrowUpAZ, faArrowDownAZ } from '@fortawesome/free-solid-svg-icons'
import type { Review } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'マイページ' }

type Status = 'all' | 'approved' | 'pending' | 'rejected'
type Sort   = 'date_desc' | 'date_asc' | 'rating_desc' | 'rating_asc'

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string; status?: string; sort?: string }>
}) {
  const { posted, status: statusParam, sort: sortParam } = await searchParams
  const status = (statusParam ?? 'all') as Status
  const sort   = (sortParam   ?? 'date_desc') as Sort

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile && !profile.is_active) redirect('/banned')

  // Fetch all reviews for counts
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('id, status')
    .eq('user_id', user.id)

  const counts = {
    all:      allReviews?.length ?? 0,
    approved: allReviews?.filter(r => r.status === 'approved').length ?? 0,
    pending:  allReviews?.filter(r => r.status === 'pending').length ?? 0,
    rejected: allReviews?.filter(r => r.status === 'rejected').length ?? 0,
  }

  // Fetch filtered + sorted reviews
  const isRatingSort = sort.startsWith('rating')
  const ascending    = sort.endsWith('asc')

  let query = supabase
    .from('reviews')
    .select('*, clinics(name), treatments(name)')
    .eq('user_id', user.id)

  if (status !== 'all') query = query.eq('status', status)
  query = query.order(isRatingSort ? 'rating' : 'created_at', { ascending })

  const { data: reviews } = await query

  const statusTabs: { label: string; value: Status }[] = [
    { label: '全て',   value: 'all' },
    { label: '公開済み', value: 'approved' },
    { label: '審査中', value: 'pending' },
    { label: '否決',   value: 'rejected' },
  ]

  const sortOptions: { label: string; value: Sort }[] = [
    { label: '新しい順',    value: 'date_desc' },
    { label: '古い順',      value: 'date_asc' },
    { label: '評価が高い順', value: 'rating_desc' },
    { label: '評価が低い順', value: 'rating_asc' },
  ]

  function buildHref(s: Status, o: Sort) {
    const p = new URLSearchParams()
    if (s !== 'all')         p.set('status', s)
    if (o !== 'date_desc')   p.set('sort', o)
    if (posted === '1')      p.set('posted', '1')
    const q = p.toString()
    return `/mypage${q ? `?${q}` : ''}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Profile card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-7 text-white mb-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-400 rounded-full blur-[60px] opacity-30" />
        <div className="absolute -bottom-10 left-10 w-32 h-32 bg-brand-300 rounded-full blur-[60px] opacity-20" />

        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 shadow-lg shadow-brand-900/50 overflow-hidden shrink-0 flex items-center justify-center">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="avatar" width={64} height={64} className="object-cover w-full h-full" unoptimized />
            ) : (
              <span className="text-3xl font-black text-white">
                {profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>
          <div>
            <p className="font-bold text-2xl">{profile?.display_name}</p>
            <p className="text-gray-400 text-base mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="relative flex gap-8 mt-6 pt-6 border-t border-white/10">
          {[
            { val: counts.all,      label: '投稿数' },
            { val: counts.approved, label: '公開中' },
            { val: counts.pending,  label: '審査中' },
            { val: counts.rejected, label: '否決' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold">{val}</p>
              <p className="text-sm text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile edit */}
      <ProfileEditForm
        userId={user.id}
        displayName={profile?.display_name ?? null}
        avatarUrl={profile?.avatar_url ?? null}
      />

      {posted === '1' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 mb-6 text-base flex items-center gap-2">
          <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-green-600 shrink-0" /> 口コミを投稿しました。審査後に公開されます。
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">投稿した口コミ</h2>
        <Link
          href="/post/new"
          className="bg-brand-600 text-white px-5 py-2.5 rounded-xl text-base font-semibold hover:bg-brand-700 shadow-sm shadow-brand-200 transition-all hover:-translate-y-0.5"
        >
          + 新しい口コミ
        </Link>
      </div>

      {/* Filter + Sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {statusTabs.map(t => (
            <Link
              key={t.value}
              href={buildHref(t.value, sort)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                status === t.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {t.label}
              <span className={`ml-1.5 text-[10px] ${status === t.value ? 'text-gray-300' : 'text-gray-400'}`}>
                {counts[t.value]}
              </span>
            </Link>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex gap-1.5">
          <FontAwesomeIcon icon={sort.endsWith('asc') ? faArrowUpAZ : faArrowDownAZ} className="w-3.5 h-3.5 text-gray-400 self-center" />
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

      {/* Review list */}
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
                      <span className="text-sm bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        {r.clinics.name}
                      </span>
                    )}
                    {r.treatments && (
                      <span className="text-sm bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">
                        {r.treatments.name}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                  {/* score shown via avgScore if needed */}
                  {r.status === 'rejected' && r.rejected_reason && (
                    <p className="text-sm text-rose-400 mt-2 bg-rose-50 px-3 py-1.5 rounded-xl">
                      却下理由: {r.rejected_reason}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex items-center">
                  {(r.status === 'draft' || r.status === 'pending') && (
                    <Link
                      href={`/post/${r.id}/edit`}
                      className="text-sm text-brand-600 hover:underline font-semibold px-3 py-1.5 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                      編集
                    </Link>
                  )}
                  {r.status === 'approved' && (
                    <Link
                      href={`/reviews/${r.slug}`}
                      className="text-sm text-brand-600 hover:underline font-semibold px-3 py-1.5 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                      表示 →
                    </Link>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {new Date(r.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-16 text-center text-gray-400">
          <FontAwesomeIcon icon={faPenToSquare} className="w-12 h-12 mb-4 opacity-30 text-gray-400" />
          <p className="mb-5 font-medium">口コミがありません</p>
          <Link href="/post/new" className="text-brand-600 text-base hover:underline font-semibold">
            最初の口コミを投稿する →
          </Link>
        </div>
      )}
    </div>
  )
}
