'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import type { Clinic, Review, Treatment } from '@/lib/supabase/types'

interface Props {
  review: Review
  clinics: Clinic[]
  treatments: Treatment[]
}

export function EditReviewForm({ review, clinics, treatments }: Props) {
  const router  = useRouter()
  const supabase = createClient()

  const [title, setTitle]             = useState(review.title)
  const [body, setBody]               = useState(review.body)
  const [clinicId, setClinicId]       = useState(review.clinic_id ?? '')
  const [treatmentId, setTreatmentId] = useState(review.treatment_id ?? '')
  const [date, setDate]               = useState(review.treatment_date ?? '')
  const [cost, setCost]               = useState(review.cost?.toString() ?? '')
  const [rating, setRating]           = useState(review.rating ?? 0)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!title || !body) { setError('タイトルと本文は必須です'); return }
    if (body.length > 300) { setError('本文は300文字以内にしてください'); return }

    setSubmitting(true)
    const { error: err } = await supabase
      .from('reviews')
      .update({
        title,
        body,
        clinic_id: clinicId || null,
        treatment_id: treatmentId || null,
        treatment_date: date || null,
        cost: cost ? parseInt(cost) : null,
        rating,
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', review.id)

    setSubmitting(false)
    if (err) { setError(err.message); return }
    router.push('/mypage')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-gray-100 p-6">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {review.rejected_reason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>却下理由：</strong> {review.rejected_reason}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">クリニック</label>
        <select value={clinicId} onChange={e => setClinicId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
          <option value="">選択してください</option>
          {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">施術</label>
        <select value={treatmentId} onChange={e => setTreatmentId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
          <option value="">選択してください</option>
          {treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タイトル <span className="text-red-500">*</span></label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          口コミ本文 <span className="text-red-500">*</span>
          <span className={`ml-2 text-xs ${body.length > 300 ? 'text-red-500' : 'text-gray-400'}`}>{body.length} / 300文字</span>
        </label>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">評価</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(v => (
            <button key={v} type="button" onClick={() => setRating(v)}
              className={`transition ${v <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}>
              <FontAwesomeIcon icon={v <= rating ? faStar : faStarRegular} className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">施術日</label>
          <input type="month" value={date} onChange={e => setDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">費用（円）</label>
          <input type="number" value={cost} onChange={e => setCost(e.target.value)} min="0"
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
      </div>

      <button type="submit" disabled={submitting}
        className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50">
        {submitting ? '更新中...' : '更新して再審査申請'}
      </button>
    </form>
  )
}
