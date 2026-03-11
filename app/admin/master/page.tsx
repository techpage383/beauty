import { createClient } from '@/lib/supabase/server'
import { MasterDataPanel } from '@/components/admin/MasterDataPanel'

export default async function AdminMasterPage() {
  const supabase = await createClient()
  const [{ data: specialties }, { data: regions }, { data: treatments }] = await Promise.all([
    supabase.from('doctor_specialties').select('id, name, sort_order').order('sort_order'),
    supabase.from('doctor_regions').select('id, name, sort_order').order('sort_order'),
    supabase.from('doctor_treatment_options').select('id, name, sort_order').order('sort_order'),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">基本データ管理</h1>
        <p className="text-base text-gray-500 mt-1">医師登録フォームで使用する選択肢を管理します</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <MasterDataPanel
          title="専門科目"
          table="doctor_specialties"
          items={specialties ?? []}
        />
        <MasterDataPanel
          title="地域"
          table="doctor_regions"
          items={regions ?? []}
        />
        <MasterDataPanel
          title="対応施術"
          table="doctor_treatment_options"
          items={treatments ?? []}
        />
      </div>
    </div>
  )
}
