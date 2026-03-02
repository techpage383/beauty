import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ReviewCard } from '@/components/review/ReviewCard'
import type { Review } from '@/lib/supabase/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'True Log | 美容クリニック口コミ・施術ログ',
  description: '実際に受けた美容医療の施術体験をシェア。クリニック・施術の口コミを探すならTrue Log。',
}

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: reviews },
    { data: clinics },
    { data: treatments },
    { count: reviewCount },
    { count: clinicCount },
  ] = await Promise.all([
    supabase.from('reviews').select('*, profiles(display_name), clinics(name), treatments(name), review_images(*)').eq('status', 'approved').order('published_at', { ascending: false }).limit(6),
    supabase.from('clinics').select('*').eq('is_published', true).limit(8),
    supabase.from('treatments').select('*').eq('is_published', true).limit(8),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('clinics').select('*', { count: 'exact', head: true }).eq('is_published', true),
  ])

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* background glow blobs */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-brand-700 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-pink-600 rounded-full blur-[120px] opacity-15 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-28 pb-32 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-pink-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
            美容医療の口コミプラットフォーム
          </span>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            リアルな施術体験を<br />
            <span className="text-gradient">シェアしよう</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            実際に受けた美容医療の感想・費用・クリニックの評価を<br className="hidden md:block" />
            投稿・検索できます
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
            <Link
              href="/reviews"
              className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-brand-500 shadow-xl shadow-brand-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              口コミを探す →
            </Link>
            <Link
              href="/register"
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              無料で登録する
            </Link>
          </div>

          {/* stats */}
          <div className="flex flex-wrap justify-center gap-12 pt-8 border-t border-white/10">
            {[
              { value: reviewCount ?? 0, label: '口コミ件数' },
              { value: clinicCount ?? 0, label: 'クリニック' },
              { value: treatments?.length ?? 0, label: '施術カテゴリ' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold text-white">
                  {s.value.toLocaleString()}
                  <span className="text-brand-400 text-2xl">+</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <p className="text-brand-600 text-xs font-bold tracking-widest mb-2">HOW IT WORKS</p>
          <h2 className="text-3xl font-bold text-gray-900">かんたん3ステップ</h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '📝', title: '無料登録', desc: 'メールアドレスとパスワードで今すぐ始められます。' },
            { step: '02', icon: '✍️', title: '施術を投稿', desc: 'クリニック・施術・費用・評価を入力して口コミを作成。' },
            { step: '03', icon: '🌟', title: '公開・シェア', desc: '審査後に口コミが公開され、同じ悩みを持つ方の参考に。' },
          ].map(item => (
            <div key={item.step} className="relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-brand-100 transition-all">
              <span className="absolute top-5 right-5 text-xs font-bold text-gray-200">{item.step}</span>
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Latest Reviews ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-500 text-xs font-bold tracking-widest mb-1.5">LATEST REVIEWS</p>
            <h2 className="text-2xl font-bold text-gray-900">最新の口コミ</h2>
          </div>
          <Link href="/reviews" className="text-sm text-gray-400 hover:text-brand-600 transition font-medium">
            すべて見る →
          </Link>
        </div>

        {reviews?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(reviews as Review[]).map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl py-24 text-center text-gray-400">
            <p className="text-5xl mb-4">✍️</p>
            <p className="mb-5 font-medium">まだ口コミがありません</p>
            <Link href="/post/new" className="text-sm text-brand-600 hover:underline font-semibold">
              最初の口コミを投稿する →
            </Link>
          </div>
        )}
      </section>

      {/* ── Clinics ──────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-500 text-xs font-bold tracking-widest mb-1.5">CLINICS</p>
              <h2 className="text-2xl font-bold text-gray-900">クリニック一覧</h2>
            </div>
            <Link href="/clinics" className="text-sm text-gray-400 hover:text-brand-600 transition font-medium">
              すべて見る →
            </Link>
          </div>

          {clinics?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {clinics.map(c => (
                <Link
                  key={c.id}
                  href={`/clinics/${c.slug}`}
                  className="group bg-white hover:bg-brand-50 border border-gray-100 hover:border-brand-200 rounded-2xl p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="w-11 h-11 bg-brand-50 group-hover:bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                    <span className="text-xl">🏥</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-brand-700 line-clamp-2 leading-snug transition-colors">
                    {c.name}
                  </p>
                  {c.address && (
                    <p className="text-xs text-gray-400 mt-1.5 truncate">{c.address}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">クリニックが登録されていません</p>
          )}
        </div>
      </section>

      {/* ── Treatments ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-500 text-xs font-bold tracking-widest mb-1.5">TREATMENTS</p>
            <h2 className="text-2xl font-bold text-gray-900">施術カテゴリ</h2>
          </div>
          <Link href="/treatments" className="text-sm text-gray-400 hover:text-brand-600 transition font-medium">
            すべて見る →
          </Link>
        </div>

        {treatments?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {treatments.map(t => (
              <Link
                key={t.id}
                href={`/treatments/${t.slug}`}
                className="group flex items-center gap-3 bg-white hover:bg-gradient-to-r hover:from-brand-50 hover:to-pink-50 border border-gray-100 hover:border-brand-200 rounded-2xl px-5 py-4 transition-all hover:-translate-y-0.5"
              >
                <span className="text-xl shrink-0">✨</span>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-brand-700 line-clamp-1 transition-colors">
                  {t.name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">施術が登録されていません</p>
        )}
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-950 py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/60 via-gray-950 to-pink-950/40 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600 rounded-full blur-[100px] opacity-10 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto text-center text-white">
          <p className="text-brand-400 text-xs font-bold tracking-widest mb-4">JOIN TRUE LOG</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            あなたの体験を<br />シェアしませんか？
          </h2>
          <p className="text-gray-400 mb-10 text-lg leading-relaxed">
            施術の感想が、同じ悩みを持つ人の役に立ちます
          </p>
          <Link
            href="/post/new"
            className="inline-block bg-brand-600 text-white px-10 py-4 rounded-2xl font-bold text-base hover:bg-brand-500 shadow-xl shadow-brand-900/50 transition-all hover:-translate-y-0.5"
          >
            口コミを投稿する →
          </Link>
        </div>
      </section>
    </>
  )
}
