import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Be Voice | 美容クリニック口コミ・施術ログ',
    template: '%s | Be Voice',
  },
  description: '実際に受けた美容医療の施術体験をシェア。クリニック・施術の口コミを探すならBe Voice。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bevoice.example.com'),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    siteName: 'Be Voice',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
