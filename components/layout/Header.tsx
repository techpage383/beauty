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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-brand-600 tracking-tight">
          True Log
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/clinics"   className="hover:text-brand-600 transition">クリニック</Link>
          <Link href="/treatments" className="hover:text-brand-600 transition">施術</Link>
          <Link href="/reviews"   className="hover:text-brand-600 transition">口コミ</Link>
        </nav>

        <HeaderMenu user={user} profile={profile} />
      </div>
    </header>
  )
}
