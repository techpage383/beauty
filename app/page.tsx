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

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(display_name), clinics(name), treatments(name), review_images(*)')
    .eq('status', 'approved')
    .order('published_at', { ascending: false })
    .limit(6)

  const { data: clinics } = await supabase
    .from('clinics')
    .select('*')
    .eq('is_published', true)
    .limit(6)

  const { data: treatments } = await supabase
    .from('treatments')
    .select('*')
    .eq('is_published', true)
    .limit(6)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            美容医療の<span className="text-brand-600">リアルな体験</span>を<br className="hidden md:block" />シェアしよう
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            施術の感想・費用・クリニックの口コミを投稿・検索できます
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/reviews"
              className="bg-brand-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-700 transition"
            >
              口コミを探す
            </Link>
            <Link
              href="/post/new"
              className="border-2 border-brand-600 text-brand-600 px-8 py-3 rounded-xl font-medium hover:bg-brand-50 transition"
            >
              口コミを投稿する
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Reviews */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">最新の口コミ</h2>
          <Link href="/reviews" className="text-sm text-brand-600 hover:underline">もっと見る →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(reviews as Review[])?.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      </section>

      {/* Clinics */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">クリニック一覧</h2>
            <Link href="/clinics" className="text-sm text-brand-600 hover:underline">もっと見る →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {clinics?.map(c => (
              <Link
                key={c.id}
                href={`/clinics/${c.slug}`}
                className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition"
              >
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Treatments */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">施術カテゴリ</h2>
          <Link href="/treatments" className="text-sm text-brand-600 hover:underline">もっと見る →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {treatments?.map(t => (
            <Link
              key={t.id}
              href={`/treatments/${t.slug}`}
              className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-center hover:bg-brand-100 transition"
            >
              <p className="text-sm font-medium text-brand-800 line-clamp-2">{t.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
