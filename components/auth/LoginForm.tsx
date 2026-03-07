'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [err, setErr]               = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setLoading(true)

    const input = identifier.trim()
    let email   = input

    // If input doesn't contain @, treat as display_name → look up email
    if (!input.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('display_name', input)
        .maybeSingle()

      if (!profile?.email) {
        setErr('IDまたはメールアドレスが正しくありません')
        setLoading(false)
        return
      }
      email = profile.email
    }

    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password })

    if (authErr) {
      setErr('IDまたはメールアドレスとパスワードが正しくありません')
      setLoading(false)
      return
    }

    router.push('/mypage')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {err && (
        <p className="text-red-600 text-base text-center bg-red-50 border border-red-100 rounded-xl py-2.5 px-3">
          {err}
        </p>
      )}

      <div>
        <label className="block text-base font-semibold text-gray-700 mb-1.5">
          IDまたはメールアドレス
        </label>
        <input
          type="text"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
          placeholder="ニックネーム または example@email.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-700 mb-1.5">パスワード</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 shadow-sm shadow-brand-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 mt-2"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}
