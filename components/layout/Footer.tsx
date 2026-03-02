import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-gray-500">
        <div>
          <p className="font-bold text-gray-800 text-base mb-2">True Log</p>
          <p>美容クリニックの施術口コミサービス</p>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/clinics"    className="hover:text-brand-600 transition">クリニック一覧</Link>
          <Link href="/treatments" className="hover:text-brand-600 transition">施術一覧</Link>
          <Link href="/reviews"    className="hover:text-brand-600 transition">口コミ一覧</Link>
          <Link href="/terms"      className="hover:text-brand-600 transition">利用規約</Link>
          <Link href="/privacy"    className="hover:text-brand-600 transition">プライバシーポリシー</Link>
        </nav>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © 2026 True Log. All rights reserved.
      </div>
    </footer>
  )
}
