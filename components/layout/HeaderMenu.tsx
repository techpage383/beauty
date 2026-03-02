'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
  profile: { display_name: string | null; role: string } | null
}

export function HeaderMenu({ user, profile }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition"
      >
        ログイン
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {profile?.role === 'admin' && (
        <Link
          href="/admin"
          className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-200 transition"
        >
          管理
        </Link>
      )}
      <Link
        href="/post/new"
        className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition"
      >
        口コミ投稿
      </Link>
      <Link href="/mypage" className="text-sm text-gray-700 hover:text-brand-600 transition">
        {profile?.display_name ?? 'マイページ'}
      </Link>
      <button
        onClick={signOut}
        className="text-sm text-gray-400 hover:text-gray-600 transition"
      >
        ログアウト
      </button>
    </div>
  )
}
