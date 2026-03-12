import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '運営会社',
  description: 'Be Voice 運営会社情報',
}

export default function CompanyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-brand-500 text-sm font-bold tracking-widest mb-1">COMPANY</p>
        <h1 className="text-3xl font-bold text-gray-900">運営会社</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-base">
          <tbody className="divide-y divide-gray-50">
            {[
              { label: '会社名',       value: '株式会社 Be Voice' },
              { label: '設立',         value: '2025年4月' },
              { label: '所在地',       value: '〒100-0001 東京都千代田区千代田1-1' },
              { label: '代表取締役',   value: '代表者氏名' },
              { label: '事業内容',     value: '美容クリニック口コミプラットフォームの企画・開発・運営' },
              { label: 'メール',       value: 'info@bevoice.me' },
              { label: 'サービス名',   value: 'Be Voice' },
              { label: 'サービスURL',  value: 'https://bevoice.me' },
            ].map(({ label, value }) => (
              <tr key={label}>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 w-40 bg-gray-50 whitespace-nowrap">
                  {label}
                </th>
                <td className="px-8 py-5 text-gray-800">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link href="/" className="text-brand-600 hover:text-brand-700 text-base font-medium transition-colors">
          ← トップへ戻る
        </Link>
      </div>
    </div>
  )
}
