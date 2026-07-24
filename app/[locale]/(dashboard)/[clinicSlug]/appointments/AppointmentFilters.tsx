'use client'

interface Doctor {
  id: string;
  staff_members: { full_name: string };
}

export default function AppointmentFilters({
  targetDate,
  doctors,
  selectedDoctor
}: {
  targetDate: string;
  doctors: Doctor[];
  selectedDoctor: string;
}) {
  return (
    <form className="flex items-center gap-2" method="GET">
      <input 
        type="date" 
        name="date" 
        defaultValue={targetDate} 
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
        onChange={(e) => {
          e.target.form?.submit()
        }}
      />
      {doctors.length > 0 && (
        <select
          name="doctor"
          defaultValue={selectedDoctor}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          onChange={(e) => {
            e.target.form?.submit()
          }}
        >
          <option value="">All Doctors</option>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.staff_members.full_name}</option>
          ))}
        </select>
      )}
    </form>
  )
}
