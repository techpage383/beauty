'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear, faRightFromBracket, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
  profile: { display_name: string | null; role: string; avatar_url: string | null } | null
}

export function HeaderMenu({ user, profile }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm font-semibold text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-brand-50 transition-all"
        >
          ログイン
        </Link>
        <Link
          href="/register"
          className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all"
        >
          無料登録
        </Link>
      </div>
    )
  }

  const initial = profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'
  const name = profile?.display_name ?? 'マイページ'
  const avatarUrl = profile?.avatar_url ?? null

  return (
    <div className="relative" ref={ref} suppressHydrationWarning>
      {/* Trigger: avatar + name */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-brand-50 transition-colors group"
      >
        <span className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-brand-600 flex items-center justify-center text-base font-bold text-white">
          {avatarUrl
            ? <Image src={avatarUrl} alt={name} width={36} height={36} className="w-full h-full object-cover" unoptimized />
            : initial
          }
        </span>
        <span className="hidden sm:inline text-base font-semibold text-gray-700 group-hover:text-brand-700 max-w-[9rem] truncate">
          {name}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50" suppressHydrationWarning>
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-brand-600 flex items-center justify-center text-base font-bold text-white">
              {avatarUrl
                ? <Image src={avatarUrl} alt={name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                : initial
              }
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-gray-800 truncate">{name}</p>
              <p className="text-sm text-gray-400 truncate">{profile?.role === 'admin' ? '管理者' : 'ユーザー'}</p>
            </div>
          </div>

          {/* Links */}
          <div className="py-1.5">
            <Link
              href="/mypage"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
              マイページ
            </Link>

            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                <FontAwesomeIcon icon={faGear} className="w-4 h-4 text-amber-400" />
                管理パネル
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1.5">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-base text-rose-400 hover:bg-rose-50 transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
