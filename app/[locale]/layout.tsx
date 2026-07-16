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
  title: 'ClinicOS — Next-Generation Clinic Management',
  description: 'Streamline your clinic operations, manage appointments, and elevate patient care with ClinicOS.',
  manifest: '/manifest.json',
  keywords: ['clinic management', 'healthcare', 'appointments', 'medical software'],
  authors: [{ name: 'ClinicOS' }],
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
