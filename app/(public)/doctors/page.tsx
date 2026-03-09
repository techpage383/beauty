import type { Metadata } from 'next'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserDoctor, faShieldHalved, faClipboardCheck } from '@fortawesome/free-solid-svg-icons'

export const metadata: Metadata = {
  title: '医師情報',
  description: 'Be Voiceに掲載されているクリニック・医師に関する情報と、掲載基準についてご案内します。',
}

const points = [
  {
    icon: faUserDoctor,
    title: '医師情報はユーザー体験に基づく',
    desc: 'Be Voiceに掲載されている医師・クリニック情報は、実際に施術を受けたユーザーの体験をもとに記録されたものです。Be Voice独自の評価・審査によるものではありません。',
  },
  {
    icon: faShieldHalved,
    title: '医療行為の評価・推薦は行いません',
    desc: 'Be Voiceは特定のクリニックや医師を推薦・保証するものではありません。掲載情報はあくまで参考情報であり、最終的な判断はご自身の責任でお願いします。',
  },
  {
    icon: faClipboardCheck,
    title: '掲載基準',
    desc: 'クリニック情報は、ユーザーから投稿された口コミを通じて自動的に蓄積されます。虚偽・誤情報が含まれる場合は、運営チームの審査により非公開・削除の対象となります。',
  },
]

export default function DoctorsPage() {
  return (
    <div className="bg-white">

      {/* Hero */}
      <section className="bg-gray-50 py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            DOCTOR INFO
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
            医師情報
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Be Voiceにおける医師・クリニック情報の取り扱いについてご案内します。
          </p>
        </div>
      </section>

      {/* Points */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {points.map(p => (
            <div key={p.title} className="flex gap-5 items-start bg-gray-50 border border-gray-100 rounded-2xl p-7">
              <span className="shrink-0 w-11 h-11 bg-white border border-gray-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={p.icon} className="w-5 h-5 text-brand-500" />
              </span>
              <div>
                <h2 className="font-bold text-gray-900 text-base mb-2">{p.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-50 border-y border-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">重要事項</p>
          <ul className="space-y-2 text-sm text-gray-500 leading-relaxed">
            <li>・Be Voiceは、医療行為の評価・診断・処方を行うものではありません。</li>
            <li>・掲載の情報・クリニック情報・医師名などは参考目的のみです。</li>
            <li>・掲載された内容は、あくまで個人の主観的な施術の体験であり、医学的・法律的な判断材料として使用することはできません。</li>
            <li>・専門家に関するご相談は、必ず資格のある医療機関にご相談ください。</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-3">クリニックの口コミを探す</h2>
          <p className="text-gray-400 text-sm mb-7">実際に施術を受けたユーザーのリアルな体験を確認できます。</p>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            口コミを見る
          </Link>
        </div>
      </section>
    </div>
  )
}
