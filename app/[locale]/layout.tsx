import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google'
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata = {
  title: {
    default: 'ClinicOS — نظام إدارة العيادات المتكامل | Complete Clinic Management System',
    template: '%s | ClinicOS',
  },
  description: 'نظام إدارة عيادات متكامل مصمم للسوق المصري — إدارة المرضى، المواعيد، الروشتات الإلكترونية، الفواتير، المخزون، الموارد البشرية، والتسويق. 24+ تخصص طبي. مجاناً.',
  metadataBase: new URL('https://clinicoseg.vercel.app'),
  manifest: '/manifest.json',
  keywords: ['clinic management', 'healthcare', 'appointments', 'medical software', 'e-prescriptions', 'billing', 'inventory', 'إدارة عيادات', 'نظام طبي', 'روشتات إلكترونية', 'فواتير', 'Egyptian clinics', 'عيادات مصرية'],
  authors: [{ name: 'ClinicOS', url: 'https://clinicoseg.vercel.app' }],
  creator: 'ClinicOS',
  publisher: 'ClinicOS',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    siteName: 'ClinicOS',
    title: 'ClinicOS — نظام إدارة العيادات المتكامل',
    description: 'نظام إدارة عيادات متكامل — إدارة المرضى، المواعيد، الروشتات الإلكترونية، الفواتير، المخزون، الموارد البشرية، والتسويق. 24+ تخصص طبي.',
    url: 'https://clinicoseg.vercel.app',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ClinicOS — Complete Clinic Management System' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicOS — نظام إدارة العيادات المتكامل',
    description: 'نظام إدارة عيادات متكامل — إدارة المرضى، المواعيد، الروشتات الإلكترونية، الفواتير. 24+ تخصص طبي.',
    images: ['/og-image.png'],
    creator: '@clinicos',
  },
  alternates: {
    canonical: 'https://clinicoseg.vercel.app',
    languages: { 'en': '/en', 'ar': '/ar' },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/icons/icon-192.png',
  },
  verification: {},
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
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
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
