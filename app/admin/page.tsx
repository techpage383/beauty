import { createClient } from '@/lib/supabase/server'

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
    { label: '審査待ち口コミ', value: pending ?? 0,   color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { label: '公開中口コミ',   value: approved ?? 0,  color: 'bg-green-50 text-green-700 border-green-200' },
    { label: '登録ユーザー',   value: users ?? 0,     color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'クリニック数',   value: clinics ?? 0,   color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`border rounded-2xl p-5 ${s.color}`}>
            <p className="text-sm font-medium mb-1">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
