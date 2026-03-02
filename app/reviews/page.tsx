import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReviewCard } from '@/components/review/ReviewCard'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Pagination } from '@/components/ui/Pagination'
import type { Review } from '@/lib/supabase/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '口コミ一覧',
  description: '美容クリニックの口コミ・施術体験談一覧。実際に受けた方のリアルな感想を掲載。',
}

const PER_PAGE = 15

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page     = Math.max(1, parseInt(pageStr ?? '1'))
  const from     = (page - 1) * PER_PAGE
  const supabase = await createClient()

  const { data: reviews, count } = await supabase
    .from('reviews')
    .select('*, profiles(display_name), clinics(name, slug), treatments(name), review_images(*)', { count: 'exact' })
    .eq('status', 'approved')
    .order('published_at', { ascending: false })
    .range(from, from + PER_PAGE - 1)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumb crumbs={[
        { name: 'TOP', href: '/' },
        { name: '口コミ一覧', href: '/reviews' },
      ]} />

      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-brand-500 text-xs font-bold tracking-widest mb-1">REVIEWS</p>
          <h1 className="text-2xl font-bold text-gray-900">口コミ一覧</h1>
        </div>
        <span className="text-sm text-gray-400">{count ?? 0}件</span>
      </div>

      {reviews?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(reviews as Review[]).map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-24 text-center text-gray-400">
          <p className="text-5xl mb-4">✍️</p>
          <p className="font-medium">まだ口コミがありません</p>
        </div>
      )}

      <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} basePath="/reviews" />
    </div>
  )
}
