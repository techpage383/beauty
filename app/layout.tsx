import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'True Log | 美容クリニック口コミ・施術ログ',
    template: '%s | True Log',
  },
  description: '実際に受けた美容医療の施術体験をシェア。クリニック・施術の口コミを探すならTrue Log。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://truelog.example.com'),
  openGraph: {
    siteName: 'True Log',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
