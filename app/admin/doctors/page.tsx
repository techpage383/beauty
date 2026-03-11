import { createClient } from '@/lib/supabase/server'
import { DoctorAdminTable } from '@/components/admin/DoctorAdminTable'
import type { Doctor } from '@/lib/supabase/types'

export default async function AdminDoctorsPage() {
  const supabase = await createClient()
  const [
    { data: doctors },
    { data: clinics },
    { data: specialties },
    { data: regions },
  ] = await Promise.all([
    supabase.from('doctors').select('*').order('id'),
    supabase.from('clinics').select('id, name').eq('is_published', true).order('name'),
    supabase.from('doctor_specialties').select('name').order('sort_order'),
    supabase.from('doctor_regions').select('name').order('sort_order'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">医師管理</h1>
      </div>
      <DoctorAdminTable
        doctors={(doctors ?? []) as Doctor[]}
        clinicOptions={(clinics ?? []) as { id: string; name: string }[]}
        specialtyOptions={(specialties ?? []).map(s => s.name)}
        regionOptions={(regions ?? []).map(r => r.name)}
      />
    </div>
  )
}
