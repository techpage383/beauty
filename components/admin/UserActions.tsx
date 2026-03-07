'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'

export function UserActions({ user }: { user: Profile }) {
  const router   = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function toggleBan() {
    setLoading(true)
    await supabase
      .from('profiles')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)
    setLoading(false)
    router.refresh()
  }

  async function toggleAdmin() {
    setLoading(true)
    await supabase
      .from('profiles')
      .update({ role: user.role === 'admin' ? 'user' : 'admin' })
      .eq('id', user.id)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={toggleBan}
        disabled={loading}
        className={`text-sm px-2 py-1 rounded-lg transition ${
          user.is_active
            ? 'text-red-600 hover:bg-red-50'
            : 'text-green-600 hover:bg-green-50'
        }`}
      >
        {user.is_active ? 'BAN' : 'BAN解除'}
      </button>
      <button
        onClick={toggleAdmin}
        disabled={loading}
        className="text-sm px-2 py-1 rounded-lg text-purple-600 hover:bg-purple-50 transition"
      >
        {user.role === 'admin' ? '管理者解除' : '管理者化'}
      </button>
    </div>
  )
}
