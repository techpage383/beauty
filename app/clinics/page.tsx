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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[
        { name: 'TOP', href: '/' },
        { name: 'クリニック一覧', href: '/clinics' },
      ]} />

      <h1 className="text-2xl font-bold text-gray-900 mb-8">クリニック一覧</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clinics?.map(clinic => (
          <Link
            key={clinic.id}
            href={`/clinics/${clinic.slug}`}
            className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition"
          >
            <h2 className="font-bold text-gray-900 mb-1">{clinic.name}</h2>
            {clinic.address && (
              <p className="text-sm text-gray-400">{clinic.address}</p>
            )}
            {clinic.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{clinic.description}</p>
            )}
          </Link>
        ))}
      </div>

      <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} basePath="/clinics" />
    </div>
  )
}
