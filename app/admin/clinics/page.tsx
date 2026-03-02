import { createClient } from '@/lib/supabase/server'
import { ClinicAdminTable } from '@/components/admin/ClinicAdminTable'

export default async function AdminClinicsPage() {
  const supabase = await createClient()
  const { data: clinics } = await supabase
    .from('clinics')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">クリニック管理</h1>
      </div>
      <ClinicAdminTable clinics={clinics ?? []} />
    </div>
  )
}
