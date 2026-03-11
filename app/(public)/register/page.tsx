import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: '新規登録',
  description: 'Be Voiceに新規登録して美容クリニックの口コミを投稿しましょう。',
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Be Voice" width={36} height={36} />
              <span className="font-bold text-2xl text-brand-700">Be Voice</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-1">新規登録</h1>
          <p className="text-gray-500 text-center text-base mb-8">
            メールアドレスとパスワードで無料登録
          </p>

          <RegisterForm />

          <p className="text-center text-base text-gray-400 mt-6">
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
