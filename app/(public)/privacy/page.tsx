import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'True Log プライバシーポリシー',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-brand-500 text-xs font-bold tracking-widest mb-1">LEGAL</p>
        <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
        <p className="text-sm text-gray-400 mt-1">最終更新日：2026年3月1日</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-gray-700">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第1条（収集する情報）</h2>
          <p className="leading-relaxed mb-3">当サービスは以下の情報を収集します。</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>メールアドレス・表示名（アカウント登録時）</li>
            <li>投稿した口コミ内容・画像</li>
            <li>アクセスログ（IPアドレス・ブラウザ情報）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第2条（情報の利用目的）</h2>
          <p className="leading-relaxed mb-3">収集した情報は以下の目的で利用します。</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>サービスの提供・改善</li>
            <li>本人確認・不正利用の防止</li>
            <li>サービスに関するお知らせの送信</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第3条（第三者提供）</h2>
          <p className="leading-relaxed">
            当サービスは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第4条（情報の管理）</h2>
          <p className="leading-relaxed">
            当サービスは Supabase（米国）のクラウドインフラを利用して情報を管理します。
            適切なセキュリティ対策を講じ、個人情報の漏洩・滅失を防止します。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第5条（開示・削除の請求）</h2>
          <p className="leading-relaxed">
            ユーザーは自身の個人情報の開示・訂正・削除を請求できます。
            ご要望はサービス内のお問い合わせよりご連絡ください。
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-brand-600 hover:text-brand-700 text-sm font-medium transition-colors">
          ← トップへ戻る
        </Link>
      </div>
    </div>
  )
}
