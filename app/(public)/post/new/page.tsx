import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewForm } from '@/components/review/ReviewForm'

export const metadata: Metadata = { title: '口コミを投稿する' }

export default async function PostNewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: clinicsData }, { data: treatmentsData }] = await Promise.all([
    supabase.from('clinics').select('*').eq('is_published', true).order('name'),
    supabase.from('treatments').select('*').eq('is_published', true).order('name'),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-brand-500 text-sm font-bold tracking-widest mb-1">POST REVIEW</p>
        <h1 className="text-3xl font-bold text-gray-900">口コミを投稿する</h1>
        <p className="text-gray-500 text-base mt-1">
          投稿後に審査があります。承認されると公開されます。
        </p>
      </div>
      <ReviewForm
        clinics={clinicsData ?? []}
        treatments={treatmentsData ?? []}
        userId={user.id}
      />
    </div>
  )
}
