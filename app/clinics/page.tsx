import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Pagination } from '@/components/ui/Pagination'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'クリニック一覧',
  description: '美容クリニックの口コミ・評価一覧。施術別・エリア別で探せます。',
}

const PER_PAGE = 15

export default async function ClinicsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page    = Math.max(1, parseInt(pageStr ?? '1'))
  const from    = (page - 1) * PER_PAGE
  const supabase = await createClient()

  const { data: clinics, count } = await supabase
    .from('clinics')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('name')
    .range(from, from + PER_PAGE - 1)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumb crumbs={[
        { name: 'TOP', href: '/' },
        { name: 'クリニック一覧', href: '/clinics' },
      ]} />

      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-brand-500 text-xs font-bold tracking-widest mb-1">CLINICS</p>
          <h1 className="text-2xl font-bold text-gray-900">クリニック一覧</h1>
        </div>
        <span className="text-sm text-gray-400">{count ?? 0}件</span>
      </div>

      {clinics?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinics.map(clinic => (
            <Link
              key={clinic.id}
              href={`/clinics/${clinic.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-brand-200 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-lg shrink-0 group-hover:bg-brand-100 transition-colors">
                  🏥
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors truncate">
                    {clinic.name}
                  </h2>
                  {clinic.address && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{clinic.address}</p>
                  )}
                  {clinic.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {clinic.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 text-center text-gray-400">
          <p className="text-4xl mb-3">🏥</p>
          <p>クリニックが登録されていません</p>
        </div>
      )}

      <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} basePath="/clinics" />
    </div>
  )
}
