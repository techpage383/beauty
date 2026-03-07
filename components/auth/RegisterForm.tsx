'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [errField, setErrField]       = useState<'name' | 'email' | ''>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setErrField('')

    if (password.length < 8) {
      setErr('パスワードは8文字以上で入力してください')
      return
    }
    if (password !== confirm) {
      setErr('パスワードが一致しません')
      return
    }

    setLoading(true)

    // Check display_name duplicate
    const { data: nameDup } = await supabase
      .from('profiles')
      .select('id')
      .eq('display_name', displayName.trim())
      .maybeSingle()

    if (nameDup) {
      setErr('この表示名はすでに使用されています。別の表示名を入力してください。')
      setErrField('name')
      setDisplayName('')
      setLoading(false)
      return
    }

    // Check email duplicate
    const { data: emailDup } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (emailDup) {
      setErr('このメールアドレスはすでに登録されています。ログインページからログインしてください。')
      setErrField('email')
      setEmail('')
      setLoading(false)
      return
    }

    // Sign up — email confirmation is disabled in Supabase, session is returned immediately
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: displayName.trim() },
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
        .update({ display_name: displayName.trim() })
        .eq('id', data.user.id)
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
        <label className="block text-base font-semibold text-gray-700 mb-1.5">表示名（ID）</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
          placeholder="ニックネームを入力"
          className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors ${
            errField === 'name' ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-700 mb-1.5">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="example@email.com"
          className={`w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors ${
            errField === 'email' ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-700 mb-1.5">
          パスワード <span className="text-gray-400 text-sm font-normal">（8文字以上）</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-base font-semibold text-gray-700 mb-1.5">パスワード（確認）</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
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
        {loading ? '登録中...' : 'アカウントを作成'}
      </button>

      <p className="text-sm text-gray-400 text-center leading-relaxed pt-1">
        登録することで
        <a href="/terms" className="text-brand-600 underline">利用規約</a>および
        <a href="/privacy" className="text-brand-600 underline">プライバシーポリシー</a>
        に同意したものとみなします。
      </p>
    </form>
  )
}
