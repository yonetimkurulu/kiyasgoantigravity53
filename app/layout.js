import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import FooterWrapper from './components/FooterWrapper'
import ScrollToTop from './components/ScrollToTop'
import GlobalChat from './components/GlobalChat'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://www.kiyasgo.com'),
  title: 'KıyasGO - AI Destekli Alışveriş',
  description: 'Akıllı ürün karşılaştırma asistanı',
  verification: {
    yandex: ['99f08abbb34c6766', 'f5dc4d81f509da7e'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              'name': 'KıyasGO',
              'url': 'https://www.kiyasgo.com',
              'logo': 'https://www.kiyasgo.com/icon.png',
              'sameAs': [
                'https://www.instagram.com/kiyasgo'
              ]
            })
          }}
        />
        <Providers>
          <GlobalChat />
          {children}
          <ScrollToTop />
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  )
}