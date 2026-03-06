import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Pagination } from '@/components/ui/Pagination'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '施術一覧',
  description: '美容医療の施術種類一覧。二重整形・鼻整形・脂肪吸引など施術別の口コミを探せます。',
}

const PER_PAGE = 15

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page     = Math.max(1, parseInt(pageStr ?? '1'))
  const from     = (page - 1) * PER_PAGE
  const supabase = await createClient()

  const { data: treatments, count } = await supabase
    .from('treatments')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('name')
    .range(from, from + PER_PAGE - 1)

  const byCategory = (treatments ?? []).reduce<Record<string, typeof treatments>>((acc, t) => {
    const cat = t!.category ?? 'その他'
    if (!acc[cat]) acc[cat] = []
    acc[cat]!.push(t)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumb crumbs={[
        { name: 'TOP', href: '/' },
        { name: '施術一覧', href: '/treatments' },
      ]} />

      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-brand-500 text-xs font-bold tracking-widest mb-1">TREATMENTS</p>
          <h1 className="text-2xl font-bold text-gray-900">施術一覧</h1>
        </div>
        <span className="text-sm text-gray-400">{count ?? 0}件</span>
      </div>

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} className="mb-12">
          <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-brand-500 rounded-full inline-block" />
            {cat}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items?.map(t => (
              <Link
                key={t!.id}
                href={`/treatments/${t!.slug}`}
                className="group flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-brand-200 hover:bg-brand-50 hover:-translate-y-0.5 transition-all"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <p className="text-sm font-medium text-gray-700 group-hover:text-brand-700 line-clamp-1 transition-colors">
                  {t!.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {!Object.keys(byCategory).length && (
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 text-center text-gray-400">
          <FontAwesomeIcon icon={faWandMagicSparkles} className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>施術が登録されていません</p>
        </div>
      )}

      <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} basePath="/treatments" />
    </div>
  )
}
