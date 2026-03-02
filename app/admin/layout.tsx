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
    { href: '/admin',             label: 'ダッシュボード', icon: '📊' },
    { href: '/admin/reviews',     label: '口コミ管理',     icon: '✍️' },
    { href: '/admin/clinics',     label: 'クリニック管理', icon: '🏥' },
    { href: '/admin/treatments',  label: '施術管理',       icon: '✨' },
    { href: '/admin/users',       label: 'ユーザー管理',   icon: '👤' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-950 text-gray-400 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xs font-black">
              TL
            </span>
            <span className="font-bold text-white text-sm">True Log</span>
          </Link>
          <p className="text-xs text-gray-600 mt-1.5">管理パネル</p>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-800 hover:text-white transition-all"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-gray-800 text-xs text-gray-600 flex items-center gap-2">
          <span className="w-5 h-5 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-xs font-bold">
            {profile.display_name?.[0]?.toUpperCase()}
          </span>
          <span className="truncate">{profile.display_name}</span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">{children}</div>
      </div>
    </div>
  )
}
