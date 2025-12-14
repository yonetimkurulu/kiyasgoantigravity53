import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import FooterWrapper from './components/FooterWrapper'
import ScrollToTop from './components/ScrollToTop'
import GlobalChat from './components/GlobalChat'
import { createClient } from '@/app/utils/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://www.kiyasgo.com'),
  title: 'KıyasGO - AI Destekli Alışveriş',
  description: 'Akıllı ürün karşılaştırma asistanı',
  verification: {
    yandex: ['99f08abbb34c6766', 'f5dc4d81f509da7e'],
    google: 'qtXDtDstYDWH6y2-qC-oWNCCKFEhXla_IFwbqoNU2LA',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-rounded.png', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon-rounded.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default async function RootLayout({ children }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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
              'logo': 'https://www.kiyasgo.com/logo.png',
              'sameAs': [
                'https://www.instagram.com/kiyasgo'
              ]
            })
          }}
        />
        <Providers user={user}>
          <GlobalChat />
          {children}
          <ScrollToTop />
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  )
}