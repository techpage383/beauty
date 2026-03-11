import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faShieldHalved, faStar, faFileLines } from '@fortawesome/free-solid-svg-icons'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Be Voice | 美容クリニック口コミ・施術ログ',
  description: '実際に受けた美容医療の施術体験をシェア。クリニック・施術の口コミを探すならBe Voice。',
}

const painPoints = [
  '美容医療を検討しているけど、どの情報が本当か分からない',
  '口コミサイトの総評点だけでは、判断する材料が足りない',
  'ポジティブな声は多いのに、リアルなネガティブ体験談が見つからない',
  '後悔しない選択をしたいのに、信頼できる声が少なすぎる',
  '施術前のリアルな経過を、誰かと静かに共有したい',
]

const brandSteps = [
  { label: 'STEP 1', key: 'B', title: 'Before', desc: '施術前——施術前の人のために' },
  { label: 'STEP 2', key: 'V', title: 'Beauty × Voice', desc: '美容 × 声——体験に関する体験の声を集め、共有' },
  { label: 'STEP 3', key: 'e', title: 'Best', desc: '選択——最善な選択を導く' },
  { label: 'GOAL',   key: 'V', title: 'Better', desc: 'より良い——より良い人生にしていただく' },
]

const features = [
  { num: '01', icon: faFileLines,    title: '充実的な施術スペック',    desc: 'クリニック名、術式、金額、術前の悩みなど、実際の詳細情報を細かに記録。' },
  { num: '02', icon: faStar,         title: '6視点の応援スコア',       desc: '医師・技術・カウンセリング品質・アフターケアなど、6つの観点を1〜5点で評価。' },
  { num: '03', icon: faFileLines,    title: '500文字以上の自由記述',   desc: '通った理由・術前術後の体験・仕上がりのギャップ・医療者へのアドバイスを丁寧に記述。' },
  { num: '04', icon: faShieldHalved, title: '証拠資料による認証バッジ', desc: '施術に対する画像の添付（住所・来院情報）で「認証済」バッジを付与、信頼性担保。' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { count: reviewCount },
    { count: clinicCount },
    { count: treatmentCount },
  ] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('clinics').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('treatments').select('*', { count: 'exact', head: true }).eq('is_published', true),
  ])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-600 text-xs font-bold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
            美容医療 × 体験口コミプラットフォーム
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            美容を考えるあなたに、<br />
            リアルな声を。
          </h1>

          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-3">
            Be Voiceは、美容（Beauty）に関する体験の声（Voice）を
          </p>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-3">
            施術前（Before）の人のために整到し、
          </p>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10">
            ユーザーが最善（Best）な選択をするのを助け、<br />
            より良い人生（Better）にしていただく情報基盤です。
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
            >
              Be Voiceについて知る
            </Link>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
            >
              体験ログを見る
            </Link>
          </div>

          {/* Stats */}
          {/* <div className="flex flex-wrap justify-center gap-12 mt-16 pt-10 border-t border-gray-200">
            {[
              { value: reviewCount ?? 0, label: '口コミ件数' },
              { value: clinicCount ?? 0, label: 'クリニック' },
              { value: treatmentCount ?? 0, label: '施術カテゴリ' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {s.value.toLocaleString()}<span className="text-brand-500 text-2xl">+</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* ── Pain Points ──────────────────────────────────── */}
      <section className="bg-white py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            こんな気持ち、ありませんか？
          </h2>
          <ul className="space-y-5">
            {painPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-4 text-gray-600 text-base border-b border-gray-100 pb-5 last:border-0">
                <span className="text-gray-300 font-bold mt-0.5">—</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="text-center text-gray-800 font-semibold text-base mt-10">
            Be Voiceは、そんな声に応えるために生まれました。
          </p>
        </div>
      </section>

      {/* ── Brand Name ───────────────────────────────────── */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">サービス名に込めた想い</h2>
          <p className="text-gray-400 text-base mb-12">Be Voice = ビーボイス</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {brandSteps.map(s => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 text-left">
                <span className="text-xs font-bold text-brand-500 tracking-widest">{s.label}</span>
                <p className="font-bold text-gray-900 mt-1 mb-1">{s.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-left">
            <p className="text-gray-700 text-base leading-relaxed mb-2">
              Be Voiceは、単なる口コミサイトではありません。
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              実際に施術を共有してくれる体験情報資産として整理し、ユーザーが後悔のない選択をするための信頼できる情報基盤です。
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="bg-white py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            &ldquo;信頼できる体験口コミ&rdquo;のための設計
          </h2>
          <p className="text-gray-400 text-base text-center mb-12">
            Be Voiceは、口コミの質を守るため、以下の形で体験を記録します。
          </p>
          <div className="space-y-6">
            {features.map(f => (
              <div key={f.num} className="flex gap-5 items-start">
                <span className="shrink-0 w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                  <FontAwesomeIcon icon={f.icon} className="w-4 h-4 text-brand-600" />
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-brand-400">{f.num}</span>
                    <h3 className="font-bold text-gray-900 text-base">{f.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 重要事項 ─────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">重要事項</p>
          <ul className="space-y-2 text-sm text-gray-500 leading-relaxed">
            <li>・Be Voiceは、医療行為の評価・診断・処方を行うものではありません。</li>
            <li>・掲載の情報・クリニック情報・医師名などは参考目的のみです。</li>
            <li>・掲載された内容は、あくまで個人の主観的な施術の体験であり、医学的・法律的な判断材料として使用することはできません。</li>
            <li>・専門家に関するご相談は、必ず資格のある医療機関にご相談ください。</li>
          </ul>
          <p className="text-xs text-gray-400 mt-5">
            Be Voiceは、そんな声に応えるために生まれました。
          </p>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="bg-white py-24 px-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-400 text-sm mb-6">
            Be Voiceは今、体験を共有してくれる仲間を募集しています。<br />
            あなたのリアルな声が、次に悩む誰かの力になります。
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 leading-tight">
            あなたの声が、<br />誰かの安心になる。
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/post/new"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
            >
              体験口コミを投稿する
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
            >
              体験ログを見る
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
