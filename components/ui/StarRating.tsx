export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`評価 ${rating}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}
