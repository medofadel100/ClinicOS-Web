

export default function ClinicDashboardPage({
  params: { clinicId }
}: {
  params: { clinicId: string }
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Clinic Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the dashboard for clinic: <code className="bg-muted px-1 py-0.5 rounded">{clinicId}</code>
      </p>
    </div>
  )
}
