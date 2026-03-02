import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditReviewForm } from '@/components/review/EditReviewForm'

export const metadata: Metadata = { title: '口コミを編集' }

export default async function EditReviewPage({ params
}: {
  params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!review) notFound()
  if (!['draft', 'pending', 'rejected'].includes(review.status)) redirect('/mypage')

  const [{ data: clinics }, { data: treatments }] = await Promise.all([
    supabase.from('clinics').select('*').eq('is_published', true).order('name'),
    supabase.from('treatments').select('*').eq('is_published', true).order('name'),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">口コミを編集</h1>
      <EditReviewForm
        review={review}
        clinics={clinics ?? []}
        treatments={treatments ?? []}
      />
    </div>
  )
}
