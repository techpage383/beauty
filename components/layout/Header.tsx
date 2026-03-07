import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { HeaderMenu } from './HeaderMenu'
import { MobileMenu } from './MobileMenu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHospital, faWandMagicSparkles, faPenToSquare, faMagnifyingGlass, faNewspaper } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const navItems: { href: string; label: string; icon: IconDefinition }[] = [
  { href: '/clinics',    label: 'クリニック', icon: faHospital },
  { href: '/treatments', label: '施術',       icon: faWandMagicSparkles },
  { href: '/reviews',    label: '口コミ',     icon: faNewspaper },
  { href: '/post/new',   label: '投稿する',   icon: faPenToSquare },
  { href: '/reviews',    label: '検索',       icon: faMagnifyingGlass },
]

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
    <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-600 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-20 flex items-center">

        {/* Logo — filled brand button */}
        <Link
          href="/"
          className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 transition-colors text-white font-bold text-lg px-5 py-2.5 rounded-xl shrink-0"
        >
          <Image src="/logo.svg" alt="Be Voice" width={22} height={22} className="shrink-0 brightness-0 invert" />
          Be Voice
        </Link>

        {/* Spacer left — desktop only */}
        <div className="hidden lg:flex flex-1" />

        {/* Nav items — desktop centered, icon + label */}
        <nav className="hidden lg:flex items-stretch h-20 border-l border-r border-gray-200">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1.5 px-6 border-r border-gray-200 last:border-r-0 text-brand-700 hover:bg-brand-50 transition-colors group"
            >
              <FontAwesomeIcon icon={item.icon} className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-700 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Spacer right — desktop only */}
        <div className="hidden lg:flex flex-1" />

        {/* User actions — desktop */}
        <div className="hidden lg:flex">
          <HeaderMenu user={user} profile={profile} />
        </div>

        {/* Mobile: user actions + hamburger */}
        <div className="flex lg:hidden items-center gap-2 ml-auto">
          <HeaderMenu user={user} profile={profile} />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
