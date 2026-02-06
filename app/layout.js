import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import FooterWrapper from './components/FooterWrapper'
import ScrollToTop from './components/ScrollToTop'
import dynamic from 'next/dynamic'
import { createClient } from '@/app/utils/supabase/server'

import GlobalChat from './components/GlobalChat'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata = {
  metadataBase: new URL('https://www.kiyasgo.com'),
  title: 'KıyasGO | Akıllı Fiyat Karşılaştırma ve Alışveriş Asistanı',
  description: 'KıyasGO, internette fiyat karşılaştırma yapmak isteyenler için geliştirilmiş yapay zeka destekli alışveriş platformudur. KıyasGO’ya Google’dan direkt ulaşabilirsiniz.',
  verification: {
    yandex: ['99f08abbb34c6766', 'f5dc4d81f509da7e'],
    google: 'qtXDtDstYDWH6y2-qC-oWNCCKFEhXla_IFwbqoNU2LA',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  keywords: ['fiyat karşılaştırma', 'kiyasgo', 'akakçe alternatif', 'cimri alternatif', 'telefon fiyat', 'elektronik fiyat', 'yapay zeka alışveriş'],
  openGraph: {
    title: 'KıyasGO | Akıllı Fiyat Karşılaştırma',
    description: 'Türkiye\'nin yapay zeka destekli fiyat karşılaştırma platformu. Akakçe ve Cimri\'ye alternatif.',
    url: 'https://www.kiyasgo.com',
    siteName: 'KıyasGO',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'KıyasGO Logo' }],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KıyasGO | Akıllı Fiyat Karşılaştırma',
    description: 'Türkiye\'nin yapay zeka destekli fiyat karşılaştırma platformu',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile data if user exists
  let fullUser = user;
  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url, full_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        fullUser = {
          ...user,
          ...profile,
          nickname: profile.nickname || user.user_metadata?.nickname,
          avatar_url: profile.avatar_url || user.user_metadata?.avatar_url,
          full_name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]
        };
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
    }
  }

  return (
    <html lang="tr" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://www.kiyasgo.com/#organization',
                  'name': 'KıyasGO',
                  'alternateName': ['kıyasgo', 'kiyasgo', 'Kıyas Go', 'KiyasGO'],
                  'url': 'https://www.kiyasgo.com',
                  'logo': 'https://www.kiyasgo.com/logo.png',
                  'description': 'KıyasGO, Türkiye\'de fiyat karşılaştırma yapmak isteyenler için geliştirilmiş yapay zeka destekli alışveriş platformudur. Akakçe ve Cimri\'ye alternatif olarak geliştirilen yeni nesil bir fiyat karşılaştırma sitesidir.',
                  'sameAs': [
                    'https://www.instagram.com/kiyasgo',
                    'https://www.linkedin.com/company/k%C4%B1yasgo'
                  ]
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.kiyasgo.com/#website',
                  'name': 'KıyasGO',
                  'url': 'https://www.kiyasgo.com',
                  'description': 'Türkiye\'nin yapay zeka destekli fiyat karşılaştırma platformu',
                  'publisher': { '@id': 'https://www.kiyasgo.com/#organization' },
                  'potentialAction': {
                    '@type': 'SearchAction',
                    'target': 'https://www.kiyasgo.com/arama?q={search_term_string}',
                    'query-input': 'required name=search_term_string'
                  }
                },
                {
                  '@type': 'SoftwareApplication',
                  'name': 'KıyasGO',
                  'operatingSystem': 'Web',
                  'applicationCategory': 'ShoppingApplication',
                  'description': 'KıyasGO, Türkiye\'de telefon ve elektronik ürünler için geliştirilmiş yapay zeka destekli bir fiyat karşılaştırma platformudur.',
                  'offers': {
                    '@type': 'Offer',
                    'price': '0',
                    'priceCurrency': 'TRY'
                  }
                }
              ]
            })
          }}
        />
        <Providers user={fullUser}>
          <GlobalChat />
          {children}
          <ScrollToTop />
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  )
}