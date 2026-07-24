import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Outfit, Inter } from 'next/font/google'
import '../globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata = {
  title: 'ClinicOS',
  description: 'نظام إدارة العيادات المتكامل — إدارة المرضى، المواعيد، الروشتات، الفواتير، المخزون، والموارد البشرية.',
  manifest: '/manifest.json',
  keywords: ['clinic management', 'healthcare', 'appointments', 'medical software', 'إدارة عيادات'],
  authors: [{ name: 'ClinicOS' }],
  icons: {
    icon: '/logo.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport = {
  themeColor: '#00d4aa',
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className="dark"
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ClinicOS" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
