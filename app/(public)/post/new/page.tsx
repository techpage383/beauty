import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: '体験を投稿する' }

const CATEGORIES = [
  {
    slug: 'beauty',
    name: '美容医療',
    nameEn: 'Cosmetic Medicine',
    desc: '二重整形・鼻・輪郭・注入系など美容外科・美容皮膚科の体験を共有します。',
    tags: ['二重整形', '鼻整形', '輪郭形成', 'ヒアルロン酸', 'ボトックス'],
    anonymous: false,
  },
  {
    slug: 'fertility',
    name: '不妊治療',
    nameEn: 'Fertility Treatment',
    desc: '体外受精・人工授精など不妊治療の体験を共有します。完全匿名で投稿できます。',
    tags: ['体外受精', '人工授精', 'タイミング法', '採卵', '胚移植'],
    anonymous: true,
  },
  {
    slug: 'gender',
    name: '性別適合手術',
    nameEn: 'Gender-Affirming Surgery',
    desc: '性別適合手術・ホルモン療法などの体験を共有します。完全匿名で投稿できます。',
    tags: ['手術', 'ホルモン療法', '準備期間', '術後生活'],
    anonymous: true,
  },
]

export default async function PostNewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <p className="text-xs font-semibold text-brand-500 tracking-widest uppercase mb-2">Share Your Experience</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">体験を投稿する</h1>
          <p className="text-gray-600 leading-relaxed">
            あなたの体験を、信頼できる情報資産として残してください。<br />
            投稿先のカテゴリを選んでください。カテゴリごとに専用フォームがあります。
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="bg-gray-100 border border-gray-300 rounded-lg px-5 py-4 mb-10">
            <p className="text-sm text-gray-700 leading-relaxed">
              本ページは医療体験の共有を目的としています。医療行為の結果を保証するものではありません。
              治療判断は必ず医療機関へご相談ください。
            </p>
          </div>

          <div className="space-y-5">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/post/new/${cat.slug}`}
                className="group block bg-white border border-gray-200 rounded-xl p-6 hover:border-brand-400 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                      <span className="text-xs text-gray-400 font-medium">{cat.nameEn}</span>
                      {cat.anonymous && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          完全匿名
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{cat.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500 group-hover:text-gray-900 transition-colors font-medium">
                      フォームへ
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">投稿にあたっての注意事項</h3>
            <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5 flex-shrink-0">•</span><span>投稿はユーザーの体験に基づく個人の感想です。医療効果・治療成否を保証するものではありません。</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5 flex-shrink-0">•</span><span>特定個人・医師・クリニックを誹謗中傷する内容は掲載できません。</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5 flex-shrink-0">•</span><span>不妊治療・性別適合手術カテゴリは完全匿名です。氏名・住所など個人特定情報は入力しないでください。</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5 flex-shrink-0">•</span><span>投稿された内容の削除・修正ポリシーについては<Link href="/terms" className="text-brand-600 underline ml-1">利用規約</Link>をご確認ください。</span></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
