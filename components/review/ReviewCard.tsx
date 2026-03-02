import Link from 'next/link'
import Image from 'next/image'
import { StarRating } from '@/components/ui/StarRating'
import type { Review } from '@/lib/supabase/types'
import { getPublicUrl } from '@/lib/image/upload'

export function ReviewCard({ review }: { review: Review }) {
  const firstImage = review.review_images?.[0]
  const imageUrl = firstImage
    ? getPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!, firstImage.storage_path)
    : null

  return (
    <Link
      href={`/reviews/${review.slug}`}
      className="block bg-white rounded-2xl border border-gray-100 hover:shadow-md transition overflow-hidden"
    >
      {imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={imageUrl}
            alt={review.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {review.rating && <StarRating rating={review.rating} />}
          {review.clinics && (
            <span className="text-xs text-gray-400">{review.clinics.name}</span>
          )}
        </div>
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{review.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{review.body}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>{review.treatments?.name}</span>
          {review.cost && <span>¥{review.cost.toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  )
}
