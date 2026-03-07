import Link from 'next/link'
import Image from 'next/image'
import { StarRating } from '@/components/ui/StarRating'
import type { Review } from '@/lib/supabase/types'
import { getPublicUrl } from '@/lib/image/upload'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'

export function ReviewCard({ review }: { review: Review }) {
  const firstImage = review.review_images?.[0]
  const imageUrl = firstImage
    ? getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, firstImage.storage_path)
    : null

  return (
    <Link
      href={`/reviews/${review.slug}`}
      className="group flex flex-col bg-white rounded-3xl border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50/50 transition-all duration-200 overflow-hidden hover:-translate-y-1"
    >
      {/* Thumbnail */}
      {imageUrl ? (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={review.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-brand-50 via-pink-50 to-rose-50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-100 rounded-full opacity-50" />
          <FontAwesomeIcon icon={faPenToSquare} className="w-10 h-10 opacity-30 relative text-brand-400" />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {review.rating && <StarRating rating={review.rating} />}
          {review.clinics && (
            <span className="text-sm bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
              {review.clinics.name}
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-brand-700 transition-colors">
          {review.title}
        </h3>

        <p className="text-base text-gray-500 line-clamp-2 leading-relaxed flex-1">
          {review.body}
        </p>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 text-sm">
          <span className="bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full font-semibold">
            {review.treatments?.name ?? '施術'}
          </span>
          {review.cost && (
            <span className="font-bold text-gray-600">¥{review.cost.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
