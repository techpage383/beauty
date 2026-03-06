import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBan } from '@fortawesome/free-solid-svg-icons'

export default function BannedPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon icon={faBan} className="w-9 h-9 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">アカウントが停止されています</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          ご不明な点は管理者にお問い合わせください。
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  )
}
