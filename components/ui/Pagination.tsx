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

  return (
    <nav className="flex justify-center gap-2 mt-10" aria-label="ページネーション">
      {page > 1 && (
        <Link
          href={`${basePath}?page=${page - 1}`}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          ← 前へ
        </Link>
      )}
      <span className="px-4 py-2 text-sm text-gray-500">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={`${basePath}?page=${page + 1}`}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          次へ →
        </Link>
      )}
    </nav>
  )
}
