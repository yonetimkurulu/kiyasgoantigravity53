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
}

export default async function RootLayout({ children }) {
  const supabase = createClient()

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
    <html lang="tr">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              'name': 'KıyasGO',
              'alternateName': [
                'kıyasgo',
                'kiyasgo',
                'Kıyas Go',
                'KiyasGO'
              ],
              'url': 'https://www.kiyasgo.com',
              'logo': 'https://www.kiyasgo.com/logo.png',
              'description': 'KıyasGO, internette fiyat karşılaştırma yapmak isteyen kullanıcılar için geliştirilmiş yapay zeka destekli platformdur.',
              'sameAs': [
                'https://www.instagram.com/kiyasgo',
                'https://www.linkedin.com/company/k%C4%B1yasgo'
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