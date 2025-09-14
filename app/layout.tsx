import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Silent Surge Tracker - Cryptocurrency Analysis Platform',
  description: 'Advanced cryptocurrency analysis platform with Silent Surge Score methodology for identifying high-potential crypto assets.',
  keywords: 'cryptocurrency, crypto, analysis, trading, blockchain, Silent Surge Score, SSS',
  authors: [{ name: 'Silent Surge Tracker Team' }],
  openGraph: {
    title: 'Silent Surge Tracker - Cryptocurrency Analysis Platform',
    description: 'Advanced cryptocurrency analysis platform with Silent Surge Score methodology',
    url: 'https://silent-surge-tracker.replit.app',
    siteName: 'Silent Surge Tracker',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silent Surge Tracker',
    description: 'Advanced cryptocurrency analysis platform',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}