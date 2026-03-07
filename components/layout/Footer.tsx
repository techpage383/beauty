import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.svg" alt="Be Voice" width={32} height={32} className="shrink-0" />
              <span className="font-bold text-xl text-white">Be Voice</span>
            </div>
            <p className="text-base leading-relaxed text-gray-500 max-w-xs">
              美容クリニックの施術口コミサービス。<br />
              リアルな体験談で美容医療選びをサポートします。
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-500 tracking-widest mb-5">EXPLORE</p>
            <nav className="flex flex-col gap-3 text-base">
              <Link href="/clinics"    className="hover:text-white transition-colors">クリニック一覧</Link>
              <Link href="/treatments" className="hover:text-white transition-colors">施術一覧</Link>
              <Link href="/reviews"    className="hover:text-white transition-colors">口コミ一覧</Link>
            </nav>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-500 tracking-widest mb-5">LEGAL</p>
            <nav className="flex flex-col gap-3 text-base">
              <Link href="/terms"   className="hover:text-white transition-colors">利用規約</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>© 2026 Be Voice. All rights reserved.</p>
          <Link href="/post/new" className="text-brand-500 hover:text-brand-400 font-medium transition-colors">
            口コミを投稿する →
          </Link>
        </div>
      </div>
    </footer>
  )
}
