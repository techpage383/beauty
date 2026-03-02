import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'True Logにログインして口コミを投稿しましょう。',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">ログイン</h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          メールアドレスとパスワードでログイン
        </p>
        <LoginForm error={error} />
      </div>
    </div>
  )
}
