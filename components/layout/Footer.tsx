import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.svg" alt="Be Voice" width={28} height={28} />
              <span className="font-bold text-lg text-white">Be Voice</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
              美容を考えるあなたに、<br />リアルな声を届ける体験口コミプラットフォーム。<br />
              静かに共有し、誰かの選択を助けます。
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 mt-5">
              <a href="#" aria-label="X" className="w-9 h-9 border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-500 transition-colors">
                <svg className="w-4 h-4 fill-gray-400" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-500 transition-colors">
                <svg className="w-4 h-4 fill-gray-400" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Service links */}
          <div>
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-5">サービス</p>
            <nav className="flex flex-col gap-3 text-sm">
              <Link href="/about"    className="hover:text-white transition-colors">Be Voiceとは</Link>
              <Link href="/about#closed" className="hover:text-white transition-colors">クローズドの理由</Link>
              <Link href="/about#rules"  className="hover:text-white transition-colors">現在のルール</Link>
              <Link href="/about#review" className="hover:text-white transition-colors">審査内容</Link>
            </nav>
          </div>

          {/* Contact + Legal */}
          <div>
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-5">お問い合わせ</p>
            <a href="mailto:info@bevoice.jp" className="text-sm hover:text-white transition-colors">
              info@bevoice.jp
            </a>
            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-5 mt-8">法的情報</p>
            <nav className="flex flex-col gap-3 text-sm">
              <Link href="/terms"    className="hover:text-white transition-colors">利用規約</Link>
              <Link href="/privacy"  className="hover:text-white transition-colors">プライバシーポリシー</Link>
              <Link href="/company"  className="hover:text-white transition-colors">運営会社</Link>
              <Link href="/contact"  className="hover:text-white transition-colors">お問い合わせ</Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-xs text-gray-600 text-center">
          © 2026 Be Voice. All rights reserved.
        </div>
      </div>

      {/* Disclaimer bar */}
      <div className="bg-gray-950 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold text-gray-500 mb-3">重要事項</p>
          <ul className="space-y-1.5 text-xs text-gray-600 leading-relaxed">
            <li>・Be Voiceは、医療行為の評価・診断・処方を行うものではありません。</li>
            <li>・掲載の情報・クリニック情報・医師名などは参考目的のみです。</li>
            <li>・掲載された内容は、あくまで個人の主観的な施術の体験であり、医学的・法律的な判断材料として使用することはできません。</li>
            <li>・専門家に関するご相談は、必ず資格のある医療機関にご相談ください。</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
