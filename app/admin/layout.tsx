import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar, faPenToSquare, faHospital, faWandMagicSparkles, faUser } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

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

  const navItems: { href: string; label: string; icon: IconDefinition }[] = [
    { href: '/admin',            label: 'ダッシュボード', icon: faChartBar },
    { href: '/admin/reviews',    label: '口コミ管理',     icon: faPenToSquare },
    { href: '/admin/clinics',    label: 'クリニック管理', icon: faHospital },
    { href: '/admin/treatments', label: '施術管理',       icon: faWandMagicSparkles },
    { href: '/admin/users',      label: 'ユーザー管理',   icon: faUser },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-950 text-gray-400 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Be Voice" width={28} height={28} className="shrink-0" />
            <span className="font-bold text-white text-base">Be Voice</span>
          </Link>
          <p className="text-sm text-gray-600 mt-1.5">管理パネル</p>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2.5 text-base rounded-lg hover:bg-gray-800 hover:text-white transition-all"
            >
              <FontAwesomeIcon icon={item.icon} className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-gray-800 text-sm text-gray-600 flex items-center gap-2">
          <span className="w-5 h-5 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-sm font-bold">
            {profile.display_name?.[0]?.toUpperCase()}
          </span>
          <span className="truncate">{profile.display_name}</span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-screen-2xl mx-auto p-8">{children}</div>
      </div>
    </div>
  )
}
