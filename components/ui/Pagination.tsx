import Link from 'next/link'

interface Props {
  page: number
  total: number
  perPage?: number
  basePath: string
}

export function Pagination({ page, total, perPage = 15, basePath }: Props) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const base = basePath.replace(/[?&]+$/, '')
  const sep  = base.includes('?') ? '&' : '?'

  return (
    <nav className="flex justify-center items-center gap-2 mt-12" aria-label="ページネーション">
      {page > 1 ? (
        <Link
          href={`${base}${sep}page=${page - 1}`}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-base font-medium text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-all"
        >
          ← 前へ
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-xl text-base text-gray-300 cursor-not-allowed">← 前へ</span>
      )}

      <span className="px-4 py-2 text-base text-gray-500 bg-white border border-gray-100 rounded-xl">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={`${base}${sep}page=${page + 1}`}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-base font-medium text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-all"
        >
          次へ →
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-xl text-base text-gray-300 cursor-not-allowed">次へ →</span>
      )}
    </nav>
  )
}
