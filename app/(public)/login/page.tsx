import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'True Logにログインして口コミを投稿しましょう。',
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white text-base font-black shadow-md shadow-brand-200">
                TL
              </span>
              <span className="font-bold text-2xl text-gray-900">True Log</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-1">ログイン</h1>
          <p className="text-gray-500 text-center text-base mb-8">
            IDまたはメールアドレスとパスワードでログイン
          </p>

          <LoginForm />

          <p className="text-center text-base text-gray-400 mt-6">
            アカウントをお持ちでない方は{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
