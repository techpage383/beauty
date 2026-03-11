import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { StarRating } from '@/components/ui/StarRating'
import { StatusBadge } from '@/components/ui/Badge'
import { ApprovalActions } from '@/components/admin/ApprovalActions'
import { getPublicUrl } from '@/lib/image/upload'
import type { Review } from '@/lib/supabase/types'

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: review } = await supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url), clinics(name, slug), treatments(name, slug), review_images(*)')
    .eq('id', id)
    .single()

  if (!review) notFound()
  const r = review as Review

  const rows = [
    { label: '投稿者',     value: r.profiles?.display_name },
    { label: 'クリニック', value: r.clinics?.name ?? '—' },
    { label: '施術',       value: r.treatments?.name ?? '—' },
    { label: '施術日',     value: r.treatment_date ?? '—' },
    { label: '費用',       value: r.cost ? `¥${r.cost.toLocaleString()}` : '—' },
    { label: '投稿日',     value: new Date(r.created_at).toLocaleString('ja-JP') },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">口コミ詳細</h1>
        <StatusBadge status={r.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-700 text-base uppercase tracking-wide">投稿データ</h2>
          <div className="space-y-2 text-base">
            {rows.map(row => (
              <div key={row.label} className="flex gap-2">
                <span className="text-gray-400 w-24 shrink-0">{row.label}</span>
                <span className="text-gray-800">{row.value}</span>
              </div>
            ))}
            <div className="flex gap-2 items-center">
              <span className="text-gray-400 w-24 shrink-0">評価</span>
              {r.score_doctor ? <StarRating rating={r.score_doctor} /> : <span>—</span>}
            </div>
          </div>
          {r.status === 'rejected' && r.rejected_reason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-base text-red-700">
              <strong>却下理由：</strong>{r.rejected_reason}
            </div>
          )}
          {r.status === 'pending' && (
            <ApprovalActions reviewId={r.id} reviewSlug={r.slug} />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-700 text-base uppercase tracking-wide mb-4">プレビュー</h2>
          {r.review_images && r.review_images.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {r.review_images.map(img => (
                <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100">
                  <Image src={getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, img.storage_path)} alt="口コミ画像" fill className="object-cover" sizes="96px" />
                </div>
              ))}
            </div>
          )}
          <h3 className="font-bold text-gray-900 text-xl mb-2">{r.title}</h3>
          {r.score_doctor && (
            <div className="flex items-center gap-1 mb-3">
              <StarRating rating={r.score_doctor} />
              <span className="text-base text-gray-500">{r.score_doctor}.0</span>
            </div>
          )}
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{r.body_experience ?? r.body_satisfaction ?? ''}</p>
        </div>
      </div>
    </div>
  )
}
