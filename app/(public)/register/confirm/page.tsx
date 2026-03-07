import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'メール確認',
  description: '登録確認メールを送信しました。',
}

export default function RegisterConfirmPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="text-6xl mb-6">📧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">確認メールを送信しました</h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          ご登録のメールアドレスに確認メールを送信しました。<br />
          メール内のリンクをクリックして登録を完了してください。
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-base text-amber-700 mb-8">
          メールが届かない場合は、迷惑メールフォルダをご確認ください。
        </div>
        <Link
          href="/login"
          className="inline-block text-brand-600 hover:underline font-medium text-base"
        >
          ログインページへ戻る
        </Link>
      </div>
    </div>
  )
}
