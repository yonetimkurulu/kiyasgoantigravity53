import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'KıyasGO - AI Destekli Alışveriş',
  description: 'Akıllı ürün karşılaştırma asistanı',
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
          {children}
        </Providers>
      </body>
    </html>
  )
}