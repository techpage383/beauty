'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'

interface Props {
  reviewId: string
  reviewSlug: string
}

export function ApprovalActions({ reviewId, reviewSlug }: Props) {
  const router  = useRouter()
  const supabase = createClient()

  const [reason, setReason]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function approve() {
    setLoading(true)
    const { error: err } = await supabase
      .from('reviews')
      .update({ status: 'approved', published_at: new Date().toISOString() })
      .eq('id', reviewId)

    if (err) { setError(err.message); setLoading(false); return }

    // Trigger ISR revalidation
    await fetch(`/api/revalidate?path=/reviews/${reviewSlug}`)
    await fetch('/api/revalidate?path=/reviews')
    await fetch('/api/revalidate?path=/')

    router.push('/admin/reviews')
    router.refresh()
  }

  async function reject() {
    if (!reason.trim()) { setError('却下理由を入力してください'); return }
    setLoading(true)
    const { error: err } = await supabase
      .from('reviews')
      .update({ status: 'rejected', rejected_reason: reason })
      .eq('id', reviewId)

    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin/reviews')
    router.refresh()
  }

  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      {error && <p className="text-rose-400 text-base">{error}</p>}

      <button
        onClick={approve}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 mr-1.5" /> 承認して公開
      </button>

      <div className="space-y-2">
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="却下理由を入力してください"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
        />
        <button
          onClick={reject}
          disabled={loading}
          className="w-full bg-rose-500 text-white py-2.5 rounded-xl font-medium hover:bg-rose-600 transition disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5 mr-1.5" /> 却下する
        </button>
      </div>
    </div>
  )
}
