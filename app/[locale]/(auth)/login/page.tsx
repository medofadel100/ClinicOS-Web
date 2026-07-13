import LoginForm from './LoginForm'

export default async function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <LoginForm locale={locale} />
    </div>
  )
}
