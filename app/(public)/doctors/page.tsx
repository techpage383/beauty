import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Doctor } from '@/lib/supabase/types'

export const metadata: Metadata = {
  title: '医師情報',
  description: '掲載情報は公開情報（各医師の公式サイト・所属クリニック情報）およびユーザー投稿に基づきます。',
}

export const revalidate = 3600

export default async function DoctorsPage() {
  const supabase = await createClient()
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, name, kana, specialties, clinic, review_count, photo_url')
    .eq('is_published', true)
    .order('id')

  const docs = (doctors ?? []) as Pick<Doctor, 'id' | 'name' | 'kana' | 'specialties' | 'clinic' | 'review_count' | 'photo_url'>[]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <p className="text-xs font-semibold text-brand-500 tracking-widest uppercase mb-2">Doctor Information</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">医師情報</h1>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            掲載情報は公開情報（各医師の公式サイト・所属クリニック情報）およびユーザー投稿に基づきます。
            ランキングや優劣の評価は行いません。
          </p>
          <div className="mt-6 inline-flex items-start gap-3 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
            </svg>
            <p className="text-xs text-gray-700 leading-relaxed">
              当プラットフォームはクリニックから成果報酬を受け取っていません。
              掲載情報は公開情報およびユーザー投稿に基づきます。
            </p>
          </div>
        </div>
      </section>

      {/* Doctor Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {docs.map(doc => (
              <Link
                key={doc.id}
                href={`/doctors/${doc.id}`}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-brand-300 hover:shadow-sm transition-all duration-200"
              >
                {/* Photo */}
                <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
                  {doc.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={doc.photo_url}
                      alt={`${doc.name}先生のプロフィール写真`}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">👤</div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{doc.kana}</p>
                      <h2 className="text-lg font-bold text-gray-900">{doc.name}</h2>
                    </div>
                    <span className="flex-shrink-0 mt-0.5 inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      {doc.specialties[0]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 truncate">{doc.clinic}</p>
                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-xs text-gray-500">
                      体験投稿 <span className="font-semibold text-gray-700">{doc.review_count}</span>件
                    </span>
                    <span className="ml-auto text-xs text-gray-400 group-hover:text-brand-600 transition-colors">
                      詳細を見る →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Notice */}
          <div className="mt-12 p-5 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">掲載についてのご案内</h3>
            <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                <span>掲載情報は各医師の公式サイト・所属クリニック公開情報に基づきます。最新情報は各クリニックへ直接お問い合わせください。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                <span>当サイトは医師・クリニックの優劣を評価・比較するものではありません。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                <span>体験投稿データはユーザーの主観的な感想であり、医療効果を保証するものではありません。</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
