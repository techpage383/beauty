import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Doctor } from '@/lib/supabase/types'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('doctors')
    .select('name')
    .eq('id', Number(id))
    .eq('is_published', true)
    .single()
  if (!data) return { title: '医師情報' }
  return { title: `${data.name} | 医師情報` }
}

export default async function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', Number(id))
    .eq('is_published', true)
    .single()

  if (!data) notFound()
  const doc = data as Doctor

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-10 md:py-14">
          <Link href="/doctors" className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-700 transition-colors mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            医師情報一覧に戻る
          </Link>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Photo */}
            <div className="flex-shrink-0 w-36 md:w-48">
              <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '3/4' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={doc.photo_url ?? ''} alt={`${doc.name}先生のプロフィール写真`} className="w-full h-full object-cover object-top" />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2 leading-relaxed">※ 顔写真は公式公開素材を使用</p>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {doc.specialties.map(s => (
                  <span key={s} className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">{s}</span>
                ))}
              </div>
              <p className="text-sm text-gray-400 mb-1">{doc.kana}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{doc.name}</h1>
              <p className="text-base text-gray-700 font-medium mb-1">{doc.clinic}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-4">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {doc.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  体験投稿数：{doc.review_count}件
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-10">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Left sidebar */}
          <div className="md:col-span-1 space-y-6">

            {/* 経歴 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-brand-500 tracking-wider uppercase mb-4">経歴</h2>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">※ 公式サイト掲載内容に基づきます</p>
              <ul className="space-y-2">
                {doc.career.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                    <span className="mt-2 flex-shrink-0 w-1 h-1 rounded-full bg-brand-300 block" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* 保有資格 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-brand-500 tracking-wider uppercase mb-4">保有資格</h2>
              <ul className="space-y-2">
                {doc.qualifications.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* 所属学会 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-brand-500 tracking-wider uppercase mb-4">所属学会</h2>
              <ul className="space-y-2">
                {doc.societies.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">{s}</li>
                ))}
              </ul>
            </div>

            {/* 対応施術 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-brand-500 tracking-wider uppercase mb-4">対応施術一覧</h2>
              <p className="text-xs text-gray-400 mb-3">事実ベースの情報です</p>
              <div className="flex flex-wrap gap-2">
                {doc.treatments.map((t, i) => (
                  <span key={i} className="inline-block px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-md">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right main */}
          <div className="md:col-span-2 space-y-6">

            {/* Stats */}
            {doc.stats && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-base font-bold text-gray-900">体験投稿データ</h2>
                  <span className="text-xs text-gray-400 mt-0.5">統計表示</span>
                </div>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">ユーザーが投稿した体験の集計です。医療効果を示すものではありません。</p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-gray-900">{doc.stats.total}</span>
                  <span className="text-sm text-gray-500">件の体験投稿</span>
                </div>

                {/* Satisfaction */}
                <div className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">体験投稿内訳</h3>
                  <div className="space-y-3">
                    {doc.stats.satisfaction.map(s => (
                      <div key={s.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-700">{s.label}</span>
                          <span className="text-sm text-gray-500">{s.count}件（{s.pct}%）</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-400 rounded-full transition-all duration-500" style={{ width: `${s.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed">※「後悔」「経過観察中」は、投稿時点での体験のため、最終的な結果とは異なる場合があります。</p>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">投稿された施術カテゴリの傾向</h3>
                  <div className="space-y-3">
                    {doc.stats.categories.map(c => (
                      <div key={c.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-gray-700">{c.label}</span>
                          <span className="text-sm text-gray-500">{c.count}件</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 rounded-full transition-all duration-500" style={{ width: `${c.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent reviews */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">この医師に関する体験投稿</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <ul className="space-y-1.5 text-xs text-gray-600 leading-relaxed">
                  <li className="flex items-start gap-2"><span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full bg-gray-300 block" />投稿はユーザーの体験に基づく個人の感想です。</li>
                  <li className="flex items-start gap-2"><span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full bg-gray-300 block" />当サイトは医療行為の結果を保証するものではありません。</li>
                </ul>
              </div>

              <div className="space-y-4">
                {(doc.recent_reviews ?? []).map((r, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-medium text-gray-600">{r.treatment}</span>
                        <span className="text-xs text-gray-400 ml-2">・{r.date}</span>
                      </div>
                      <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${r.statusColor}`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">全{doc.review_count}件の体験投稿</p>
                <Link href="/reviews" className="text-sm text-brand-600 hover:text-brand-900 font-medium transition-colors">
                  すべての体験投稿を見る →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-40 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-2.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs text-gray-300 leading-relaxed">
            <span className="flex items-center gap-1.5 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              透明性ポリシー
            </span>
            <span className="text-gray-600 hidden sm:block">|</span>
            <span>当プラットフォームはクリニックから成果報酬を受け取っていません。</span>
            <span className="text-gray-600 hidden sm:block">|</span>
            <span>掲載情報は公開情報およびユーザー投稿に基づきます。</span>
          </div>
        </div>
      </div>
    </div>
  )
}
