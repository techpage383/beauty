'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function LoginForm({ error }: { error?: string }) {
  const router   = useRouter()
  const supabase = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState(error ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)

    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })

    if (authErr) {
      setErr('メールアドレスまたはパスワードが正しくありません')
      setLoading(false)
      return
    }

    router.push('/mypage')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
      {err && (
        <p className="text-red-500 text-sm text-center bg-red-50 border border-red-100 rounded-xl py-2 px-3">
          {err}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="example@email.com"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>

      <p className="text-center text-sm text-gray-500 pt-2">
        アカウントをお持ちでない方は{' '}
        <Link href="/register" className="text-brand-600 hover:underline font-medium">
          新規登録
        </Link>
      </p>
    </form>
  )
}
