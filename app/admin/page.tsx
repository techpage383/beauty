import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: pending },
    { count: approved },
    { count: users },
    { count: clinics },
  ] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('clinics').select('*',  { count: 'exact', head: true }),
  ])

  const stats = [
    { label: '審査待ち口コミ', value: pending ?? 0,  icon: '⏳', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', href: '/admin/reviews?status=pending' },
    { label: '公開中口コミ',   value: approved ?? 0, icon: '✅', color: 'bg-green-50 text-green-700 border-green-200',   href: '/admin/reviews?status=approved' },
    { label: '登録ユーザー',   value: users ?? 0,    icon: '👤', color: 'bg-blue-50 text-blue-700 border-blue-200',       href: '/admin/users' },
    { label: 'クリニック数',   value: clinics ?? 0,  icon: '🏥', color: 'bg-purple-50 text-purple-700 border-purple-200', href: '/admin/clinics' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-0.5">サービスの統計情報</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className={`border rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 ${s.color}`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold opacity-80">{s.label}</p>
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className="text-3xl font-bold">{s.value.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      {(pending ?? 0) > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-yellow-800">審査待ちの口コミがあります</p>
            <p className="text-sm text-yellow-600 mt-0.5">{pending}件の口コミが審査を待っています</p>
          </div>
          <Link
            href="/admin/reviews?status=pending"
            className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-600 transition-colors shrink-0"
          >
            確認する →
          </Link>
        </div>
      )}
    </div>
  )
}
