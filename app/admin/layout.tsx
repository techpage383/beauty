import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const navItems = [
    { href: '/admin',             label: 'ダッシュボード' },
    { href: '/admin/reviews',     label: '口コミ管理' },
    { href: '/admin/clinics',     label: 'クリニック管理' },
    { href: '/admin/treatments',  label: '施術管理' },
    { href: '/admin/users',       label: 'ユーザー管理' },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-700">
          <Link href="/" className="font-bold text-white text-sm">True Log</Link>
          <p className="text-xs text-gray-500 mt-0.5">管理パネル</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-5 py-2.5 text-sm hover:bg-gray-800 hover:text-white transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-700 text-xs text-gray-500">
          {profile.display_name}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </div>
    </div>
  )
}
