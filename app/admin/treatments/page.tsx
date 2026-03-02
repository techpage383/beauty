import { createClient } from '@/lib/supabase/server'
import { TreatmentAdminTable } from '@/components/admin/TreatmentAdminTable'

export default async function AdminTreatmentsPage() {
  const supabase = await createClient()
  const { data: treatments } = await supabase
    .from('treatments')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">施術管理</h1>
      </div>
      <TreatmentAdminTable treatments={treatments ?? []} />
    </div>
  )
}
