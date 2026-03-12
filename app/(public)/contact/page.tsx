import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'Be Voice へのお問い合わせはこちらから。',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-brand-500 text-sm font-bold tracking-widest mb-1">CONTACT</p>
        <h1 className="text-3xl font-bold text-gray-900">お問い合わせ</h1>
        <p className="text-base text-gray-400 mt-2">
          ご不明な点やご要望がございましたら、下記メールアドレスまでお気軽にご連絡ください。
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">

        <div>
          <p className="text-sm font-bold text-gray-500 mb-1">メールアドレス</p>
          <a
            href="mailto:info@bevoice.me"
            className="text-brand-600 hover:text-brand-700 text-lg font-semibold transition-colors"
          >
            info@bevoice.me
          </a>
        </div>

        <div className="border-t border-gray-50 pt-6 space-y-2 text-sm text-gray-500">
          <p>・お問い合わせへの回答は、通常2〜3営業日以内にご返信いたします。</p>
          <p>・内容によってはお時間をいただく場合がございます。</p>
          <p>・営業・広告・スパム目的のご連絡はお断りしております。</p>
        </div>

        <div className="border-t border-gray-50 pt-6">
          <p className="text-sm font-bold text-gray-500 mb-3">お問い合わせ種別</p>
          <div className="flex flex-wrap gap-2">
            {['サービスに関するご質問', '口コミの削除依頼', 'クリニック掲載について', '不具合・バグの報告', 'その他'].map(item => (
              <span key={item} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-lg border border-gray-100">
                {item}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">上記の件名を含めてご連絡いただくとスムーズに対応できます。</p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-brand-600 hover:text-brand-700 text-base font-medium transition-colors">
          ← トップへ戻る
        </Link>
      </div>
    </div>
  )
}
