import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewForm } from '@/components/review/ReviewForm'

const CATEGORY_MAP: Record<string, string> = {
  beauty:    '美容医療',
  fertility: '不妊治療',
  gender:    '性別適合手術',
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const name = CATEGORY_MAP[category]
  if (!name) return { title: '口コミを投稿する' }
  return { title: `${name}の体験を投稿する` }
}

export default async function PostCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const treatmentName = CATEGORY_MAP[category]
  if (!treatmentName) notFound()

  const [{ data: clinicsData }, { data: treatmentsData }, { data: treatmentRow }] = await Promise.all([
    supabase.from('clinics').select('*').eq('is_published', true).order('name'),
    supabase.from('treatments').select('*').eq('is_published', true).order('name'),
    supabase.from('treatments').select('id').eq('name', treatmentName).maybeSingle(),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <p className="text-brand-500 text-sm font-bold tracking-widest mb-1">POST REVIEW</p>
        <h1 className="text-3xl font-bold text-gray-900">{treatmentName}の体験を投稿する</h1>
        <p className="text-gray-500 text-base mt-1">
          投稿後に審査があります。承認されると公開されます。
        </p>
      </div>
      <ReviewForm
        clinics={clinicsData ?? []}
        treatments={treatmentsData ?? []}
        userId={user.id}
        lockedTreatmentId={treatmentRow?.id}
      />
    </div>
  )
}
