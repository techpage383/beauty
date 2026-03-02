import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: '新規登録',
  description: 'True Logに新規登録して美容クリニックの口コミを投稿しましょう。',
}

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">新規登録</h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          メールアドレスとパスワードで無料登録
        </p>
        <RegisterForm />
      </div>
    </div>
  )
}
