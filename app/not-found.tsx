import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">ページが見つかりません</h1>
        <p className="text-gray-500 text-sm mb-6">お探しのページは削除されたか、URLが変更された可能性があります。</p>
        <Link href="/" className="bg-brand-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition">
          トップへ戻る
        </Link>
      </div>
    </div>
  )
}
