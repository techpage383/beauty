import Link from 'next/link'
import Image from 'next/image'
import type { Review } from '@/lib/supabase/types'
import { avgScore } from '@/lib/supabase/types'
import { getPublicUrl } from '@/lib/image/upload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faArrowRight } from '@fortawesome/free-solid-svg-icons'

function formatCost(cost: number | null) {
  if (!cost) return null
  return `¥${cost.toLocaleString()}`
}

export function ReviewCard({ review }: { review: Review }) {
  const firstImage = review.review_images?.[0]
  const imageUrl = firstImage
    ? getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, firstImage.storage_path)
    : null

  const cost = formatCost(review.cost)
  const avg  = avgScore(review)

  return (
    <Link
      href={`/reviews/${review.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50/50 transition-all duration-200 overflow-hidden"
    >
      {/* Thumbnail */}
      {imageUrl ? (
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={review.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-brand-50 via-blue-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-100 rounded-full opacity-40" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-100 rounded-full opacity-40" />
          <FontAwesomeIcon icon={faPenToSquare} className="w-10 h-10 opacity-20 relative text-brand-400" />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {review.body_part && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              {review.body_part}
            </span>
          )}
          {review.treatments?.name && (
            <span className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1 rounded-full font-semibold">
              {review.treatments.name}
            </span>
          )}
          {review.is_verified && (
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full font-semibold">
              ✓ 認証済
            </span>
          )}
          {avg !== null && (
            <span className="ml-auto text-xs font-bold text-gray-700">
              {avg.toFixed(1)}<span className="text-gray-400 font-normal">/5.0</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3 group-hover:text-brand-700 transition-colors">
          {review.title}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-gray-400">
          {cost && <span><span className="text-gray-300 mr-1">総額</span>{cost}</span>}
          {review.treatment_date && <span><span className="text-gray-300 mr-1">施術日</span>{review.treatment_date}</span>}
          {review.anesthesia && <span>{review.anesthesia}</span>}
        </div>

        {/* Excerpt from body_reason */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
          {review.body_reason ?? ''}
        </p>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-300">※個人の体験です</span>
          <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            続きを読む
            <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
