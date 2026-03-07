import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <p className="text-9xl font-bold text-gray-100 mb-2 leading-none">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">ページが見つかりません</h1>
        <p className="text-gray-500 text-base mb-8 leading-relaxed">
          お探しのページは削除されたか、URLが変更された可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-brand-700 shadow-sm transition-all hover:-translate-y-0.5"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  )
}
