import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Pagination } from '@/components/ui/Pagination'

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

  // Group by category
  const byCategory = (treatments ?? []).reduce<Record<string, typeof treatments>>((acc, t) => {
    const cat = t!.category ?? 'その他'
    if (!acc[cat]) acc[cat] = []
    acc[cat]!.push(t)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[
        { name: 'TOP', href: '/' },
        { name: '施術一覧', href: '/treatments' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-8">施術一覧</h1>

      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat} className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">{cat}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items?.map(t => (
              <Link
                key={t!.id}
                href={`/treatments/${t!.slug}`}
                className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
              >
                <p className="text-sm font-medium text-gray-800">{t!.name}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} basePath="/treatments" />
    </div>
  )
}
