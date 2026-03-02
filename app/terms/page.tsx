import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '利用規約',
  description: 'True Log 利用規約',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-brand-500 text-xs font-bold tracking-widest mb-1">LEGAL</p>
        <h1 className="text-2xl font-bold text-gray-900">利用規約</h1>
        <p className="text-sm text-gray-400 mt-1">最終更新日：2026年3月1日</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-gray-700">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第1条（適用）</h2>
          <p className="leading-relaxed">
            本利用規約（以下「本規約」）は、True Log（以下「当サービス」）が提供するサービスの利用条件を定めるものです。
            ユーザーは本規約に同意の上、当サービスをご利用ください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第2条（禁止事項）</h2>
          <p className="leading-relaxed mb-3">ユーザーは以下の行為を行ってはなりません。</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>虚偽の口コミや誤解を招く情報の投稿</li>
            <li>他のユーザーや第三者への誹謗・中傷</li>
            <li>当サービスの運営を妨害する行為</li>
            <li>スパムや広告目的の投稿</li>
            <li>その他、当サービスが不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第3条（免責事項）</h2>
          <p className="leading-relaxed">
            当サービスに掲載された口コミ情報は、ユーザーによる主観的な体験に基づくものです。
            当サービスは掲載情報の正確性・完全性を保証せず、利用者が本サービスを利用したことによって生じる損害について責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-3">第4条（規約の変更）</h2>
          <p className="leading-relaxed">
            当サービスは、必要に応じて本規約を変更することができます。
            変更後の規約は本ページに掲載した時点で効力を生じるものとします。
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
