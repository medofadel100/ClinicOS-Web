import { Users, Phone, Calendar, Clock } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PatientHeader({ patient }: { patient: any }) {
  let age = null
  if (patient.date_of_birth) {
    const dob = new Date(patient.date_of_birth)
    const diff_ms = Date.now() - dob.getTime()
    const age_dt = new Date(diff_ms) 
    age = Math.abs(age_dt.getUTCFullYear() - 1970)
  }

  return (
    <div className="bg-[#0a0f1e]/80 backdrop-blur-xl border border-white/[0.05] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="flex items-center gap-6 z-10">
        {/* Avatar Placeholder */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-3xl font-bold text-teal-400">
            {patient.full_name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            {patient.full_name}
            {patient.display_id && (
              <span className="text-xs font-mono font-medium px-2.5 py-1 bg-white/5 text-slate-400 rounded-md border border-white/5">
                #{patient.display_id}
              </span>
            )}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            {patient.phone && (
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Phone className="w-4 h-4 text-teal-500" />
                {patient.phone}
              </span>
            )}
            {age !== null && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-violet-500" />
                {age} years old
              </span>
            )}
            {patient.gender && (
              <span className="flex items-center gap-1.5 capitalize">
                <Users className="w-4 h-4 text-blue-500" />
                {patient.gender}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              Registered {new Date(patient.registered_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 z-10 w-full md:w-auto">
        <button className="flex-1 md:flex-none px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all border border-white/10">
          Edit Profile
        </button>
        <button className="flex-1 md:flex-none px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0a0f1e] rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]">
          Start Consultation
        </button>
      </div>
    </div>
  )
}
