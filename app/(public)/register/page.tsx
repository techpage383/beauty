import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: '新規登録',
  description: 'True Logに新規登録して美容クリニックの口コミを投稿しましょう。',
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md shadow-brand-200">
                TL
              </span>
              <span className="font-bold text-xl text-gray-900">True Log</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">新規登録</h1>
          <p className="text-gray-500 text-center text-sm mb-8">
            メールアドレスとパスワードで無料登録
          </p>

          <RegisterForm />

          <p className="text-center text-sm text-gray-400 mt-6">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
