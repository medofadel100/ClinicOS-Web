import { redirect } from 'next/navigation'

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  // Middleware ensures the user is authenticated at this point.
  // We don't want them on the landing page, send them to the app.
  redirect(`/${locale}/clinic-switcher`)
}
