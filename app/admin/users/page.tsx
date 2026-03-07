import { createClient } from '@/lib/supabase/server'
import { UserActions } from '@/components/admin/UserActions'
import { Pagination } from '@/components/ui/Pagination'
import type { Profile } from '@/lib/supabase/types'

const PER_PAGE = 15

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page     = Math.max(1, parseInt(pageStr ?? '1'))
  const from     = (page - 1) * PER_PAGE
  const supabase = await createClient()

  const { data: users, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PER_PAGE - 1)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ユーザー管理</h1>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-base">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">表示名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">メールアドレス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ロール</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">登録日</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(users as Profile[])?.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">{u.display_name ?? '(未設定)'}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">{u.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-sm font-medium ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-sm font-medium ${
                    u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.is_active ? 'アクティブ' : 'BAN済み'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(u.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-4 py-3">
                  <UserActions user={u} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} basePath="/admin/users" />
    </div>
  )
}
