'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function RegisterForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [err, setErr]                 = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')

    if (password.length < 8) {
      setErr('パスワードは8文字以上で入力してください')
      return
    }
    if (password !== confirm) {
      setErr('パスワードが一致しません')
      return
    }

    setLoading(true)

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpErr) {
      setErr(signUpErr.message)
      setLoading(false)
      return
    }

    // Update display_name in profiles (trigger creates the row)
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', data.user.id)
    }

    // If email confirmation is disabled in Supabase → go straight to mypage
    // If enabled → show confirmation message
    if (data.session) {
      router.push('/mypage')
      router.refresh()
    } else {
      router.push('/register/confirm')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
      {err && (
        <p className="text-red-500 text-sm text-center bg-red-50 border border-red-100 rounded-xl py-2 px-3">
          {err}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
          placeholder="ニックネームを入力"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          パスワード <span className="text-gray-400 text-xs font-normal">（8文字以上）</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
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
        {loading ? '登録中...' : 'アカウントを作成'}
      </button>

      <p className="text-center text-sm text-gray-500 pt-2">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" className="text-brand-600 hover:underline font-medium">
          ログイン
        </Link>
      </p>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        登録することで
        <a href="/terms" className="text-brand-600 underline">利用規約</a>および
        <a href="/privacy" className="text-brand-600 underline">プライバシーポリシー</a>
        に同意したものとみなします。
      </p>
    </form>
  )
}
