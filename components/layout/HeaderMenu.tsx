'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
  profile: { display_name: string | null; role: string } | null
}

export function HeaderMenu({ user, profile }: Props) {
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-brand-50 transition-all"
        >
          ログイン
        </Link>
        <Link
          href="/register"
          className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm shadow-brand-200 transition-all hover:-translate-y-0.5"
        >
          登録
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {profile?.role === 'admin' && (
        <Link
          href="/admin"
          className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all font-semibold"
        >
          管理
        </Link>
      )}
      <Link
        href="/post/new"
        className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm shadow-brand-200 transition-all hover:-translate-y-0.5"
      >
        + 投稿
      </Link>
      <Link
        href="/mypage"
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-brand-50 transition-all"
      >
        <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">
          {profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
        </span>
        <span className="hidden sm:inline font-medium">{profile?.display_name ?? 'マイページ'}</span>
      </Link>
      <button
        onClick={signOut}
        className="text-xs text-gray-400 hover:text-gray-600 px-2 py-2 rounded-lg hover:bg-gray-100 transition-all"
      >
        ログアウト
      </button>
    </div>
  )
}
