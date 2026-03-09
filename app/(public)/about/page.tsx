import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Be Voiceとは',
  description: 'Be Voiceは、美容医療の施術体験をリアルにシェアする、信頼できる体験口コミプラットフォームです。',
}

const brandSteps = [
  { label: 'STEP 1', title: 'Before',         desc: '施術前——施術前の人のために' },
  { label: 'STEP 2', title: 'Beauty × Voice', desc: '美容 × 声——体験に関する体験の声を集め、共有' },
  { label: 'STEP 3', title: 'Best',            desc: '選択——最善な選択を導く' },
  { label: 'GOAL',   title: 'Better',          desc: 'より良い——より良い人生にしていただく' },
]

const reasons = [
  {
    title: 'クローズドの理由',
    id: 'closed',
    body: 'Be Voiceは、完全クローズド制を採用しています。誰でも閲覧できる口コミサイトとは異なり、実際に施術を受けたユーザーのみが体験を投稿・閲覧できます。これにより、広告目的や虚偽投稿を排除し、本当に信頼できる体験情報のみを届けることができます。',
  },
  {
    title: '現在のルール',
    id: 'rules',
    body: '投稿者は、施術を受けたクリニック・術式・費用・施術日などの詳細情報を記入する必要があります。また、500文字以上の自由記述と複数視点での評価スコアを必須としています。虚偽・誇張・誹謗中傷にあたる投稿は審査で却下されます。',
  },
  {
    title: '審査内容',
    id: 'review',
    body: '全ての投稿はBe Voice運営チームによる審査を経て公開されます。審査では、内容の具体性・中立性・誠実さを確認します。証拠画像（来院証明・領収書など）を添付することで「認証済」バッジが付与され、信頼性がさらに高まります。',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-white">

      {/* Hero */}
      <section className="bg-gray-50 py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            ABOUT BE VOICE
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            美容を考えるあなたに、<br />リアルな声を。
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Be Voiceは、単なる口コミサイトではありません。<br />
            実際に施術を受けた人の体験を、誠実に共有できる情報基盤です。
          </p>
        </div>
      </section>

      {/* Brand meaning */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">サービス名に込めた想い</h2>
          <p className="text-gray-400 text-sm text-center mb-10">Be Voice = ビーボイス</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {brandSteps.map(s => (
              <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left">
                <span className="text-xs font-bold text-brand-500 tracking-widest">{s.label}</span>
                <p className="font-bold text-gray-900 mt-1 mb-1">{s.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <p className="text-gray-700 text-base leading-relaxed mb-2 font-semibold">
              Be Voiceは、単なる口コミサイトではありません。
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              実際に施術を共有してくれる体験情報資産として整理し、ユーザーが後悔のない選択をするための信頼できる情報基盤です。
            </p>
          </div>
        </div>
      </section>

      {/* Reasons / Rules / Review */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-10">
          {reasons.map(r => (
            <div key={r.id} id={r.id} className="bg-white border border-gray-100 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{r.title}</h2>
              <p className="text-gray-500 text-base leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-gray-100">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">あなたの体験を、シェアしませんか？</h2>
          <p className="text-gray-400 text-sm mb-8">あなたのリアルな声が、次に悩む誰かの力になります。</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/post/new"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              体験口コミを投稿する
            </Link>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-7 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              口コミを見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
