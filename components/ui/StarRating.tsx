import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'

export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`評価 ${rating}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={i < rating ? faStarSolid : faStarRegular}
          className={i < rating ? 'text-yellow-400 w-3.5 h-3.5' : 'text-gray-300 w-3.5 h-3.5'}
        />
      ))}
    </span>
  )
}
