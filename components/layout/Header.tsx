import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HeaderMenu } from './HeaderMenu'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xs font-black group-hover:bg-brand-700 transition-colors">
            TL
          </span>
          <span className="font-bold text-lg text-gray-900 group-hover:text-brand-700 transition-colors">
            True Log
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {[
            { href: '/clinics',    label: 'クリニック' },
            { href: '/treatments', label: '施術' },
            { href: '/reviews',    label: '口コミ' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 rounded-lg text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all"
            >
              {label}
            </Link>
          ))}
        </nav>

        <HeaderMenu user={user} profile={profile} />
      </div>
    </header>
  )
}
