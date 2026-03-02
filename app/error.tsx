'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-sm">
        <p className="text-8xl font-bold text-gray-100 mb-2 leading-none">500</p>
        <h1 className="text-xl font-bold text-gray-900 mb-3">エラーが発生しました</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          予期せぬエラーが発生しました。しばらく時間をおいて再度お試しください。
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm transition-all hover:-translate-y-0.5"
          >
            再試行
          </button>
          <Link
            href="/"
            className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
