'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Clinic, Review, Treatment } from '@/lib/supabase/types'

interface Props {
  review: Review
  clinics: Clinic[]
  treatments: Treatment[]
}

const SCORE_ITEMS = [
  { key: 'score_doctor',     label: '執刀医の技術力（仕上がり満足度）' },
  { key: 'score_counseling', label: 'カウンセリングの誠実度' },
  { key: 'score_anesthesia', label: '麻酔・痛みの管理' },
  { key: 'score_aftercare',  label: 'アフターケアの充実度' },
  { key: 'score_price',      label: '価格の妥当性' },
  { key: 'score_staff',      label: '看護師・スタッフの対応' },
  { key: 'score_facility',   label: '院内の清潔感・設備' },
  { key: 'score_downtime',   label: 'ダウンタイムの許容度（情報の正確性）' },
] as const

const BODY_SECTIONS = [
  { key: 'body_reason',       label: '選んだ理由と妥当性',        placeholder: 'このクリニック・施術を選んだ経緯や決め手を教えてください。' },
  { key: 'body_counseling',   label: 'カウンセリングのリアル',     placeholder: 'カウンセリング時の雰囲気、説明の丁寧さ、気になった点など。' },
  { key: 'body_experience',   label: '術中・術後の体感',           placeholder: '施術中の痛み・感覚、術後の腫れ・回復の様子を具体的に。' },
  { key: 'body_satisfaction', label: '仕上がりの満足度とギャップ',  placeholder: '理想と実際の仕上がりの差、現在の状態をお聞かせください。' },
  { key: 'body_advice',       label: '後輩患者へのアドバイス',     placeholder: 'これから受ける方へ、事前に知っておくべきことや注意点。' },
] as const

type ScoreKey = typeof SCORE_ITEMS[number]['key']
type BodyKey  = typeof BODY_SECTIONS[number]['key']

const ANESTHESIA_OPTIONS = ['なし', '局所麻酔', '表面麻酔', '静脈麻酔', '全身麻酔', 'その他']
const PRICE_TYPE_OPTIONS = ['通常価格', 'モニター価格', 'コース価格', 'キャンペーン価格', 'その他']

function ScoreSelector({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={`w-8 h-8 rounded transition-colors ${i <= value ? 'bg-brand-600 hover:bg-brand-700' : 'bg-gray-200 hover:bg-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-base font-bold text-gray-700 w-10 text-right">
          {value > 0 ? `${value}/5` : '-'}
        </span>
      </div>
    </div>
  )
}

export function EditReviewForm({ review, clinics, treatments }: Props) {
  const router   = useRouter()
  const supabase = createClient()

  const [title,       setTitle]       = useState(review.title)
  const [clinicId,    setClinicId]    = useState(review.clinic_id ?? '')
  const [treatmentId, setTreatmentId] = useState(review.treatment_id ?? '')
  const [date,        setDate]        = useState(review.treatment_date ?? '')
  const [cost,        setCost]        = useState(review.cost?.toString() ?? '')
  const [bodyPart,    setBodyPart]    = useState(review.body_part ?? '')
  const [anesthesia,  setAnesthesia]  = useState(review.anesthesia ?? '')
  const [priceType,   setPriceType]   = useState(review.price_type ?? '通常価格')

  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    score_doctor:     review.score_doctor     ?? 0,
    score_counseling: review.score_counseling ?? 0,
    score_anesthesia: review.score_anesthesia ?? 0,
    score_aftercare:  review.score_aftercare  ?? 0,
    score_price:      review.score_price      ?? 0,
    score_staff:      review.score_staff      ?? 0,
    score_facility:   review.score_facility   ?? 0,
    score_downtime:   review.score_downtime   ?? 0,
  })

  const [bodies, setBodies] = useState<Record<BodyKey, string>>({
    body_reason:       review.body_reason       ?? '',
    body_counseling:   review.body_counseling   ?? '',
    body_experience:   review.body_experience   ?? '',
    body_satisfaction: review.body_satisfaction ?? '',
    body_advice:       review.body_advice       ?? '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  const totalBodyChars = Object.values(bodies).reduce((s, v) => s + v.length, 0)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!title) { setError('タイトルは必須です'); return }

    setSubmitting(true)
    const { error: err } = await supabase
      .from('reviews')
      .update({
        title,
        clinic_id:      clinicId || null,
        treatment_id:   treatmentId || null,
        body_part:      bodyPart || null,
        anesthesia:     anesthesia || null,
        price_type:     priceType || null,
        treatment_date: date || null,
        cost:           cost ? parseInt(cost) : null,
        ...scores,
        ...bodies,
        status:     'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', review.id)

    setSubmitting(false)
    if (err) { setError(err.message); return }
    router.push('/mypage')
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-rose-500 text-sm bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>}

      {review.rejected_reason && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
          <strong>却下理由：</strong> {review.rejected_reason}
        </div>
      )}

      {/* ── 基本情報 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-900 text-base">基本情報</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">タイトル <span className="text-rose-500">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">クリニック</label>
            <select value={clinicId} onChange={e => setClinicId(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">施術</label>
            <select value={treatmentId} onChange={e => setTreatmentId(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">施術部位</label>
            <input type="text" value={bodyPart} onChange={e => setBodyPart(e.target.value)} placeholder="例：目元、鼻" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">施術日（年月）</label>
            <input type="month" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">総額（円）</label>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} min="0" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">価格種類</label>
            <select value={priceType} onChange={e => setPriceType(e.target.value)} className={inputClass}>
              {PRICE_TYPE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">麻酔</label>
            <select value={anesthesia} onChange={e => setAnesthesia(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {ANESTHESIA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── 8項目スコア ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-base mb-5">8項目スコア</h2>
        <div className="space-y-5">
          {SCORE_ITEMS.map(({ key, label }) => (
            <ScoreSelector
              key={key}
              label={label}
              value={scores[key]}
              onChange={v => setScores(prev => ({ ...prev, [key]: v }))}
            />
          ))}
        </div>
      </section>

      {/* ── 自由記述 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-base mb-1">自由記述</h2>
        <p className="text-xs text-gray-400 mb-5">
          現在 <span className={totalBodyChars >= 500 ? 'text-emerald-600 font-bold' : 'text-gray-600 font-semibold'}>{totalBodyChars}文字</span>
        </p>
        <div className="space-y-5">
          {BODY_SECTIONS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
              <textarea
                value={bodies[key]}
                onChange={e => setBodies(prev => ({ ...prev, [key]: e.target.value }))}
                rows={4}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </div>
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50"
      >
        {submitting ? '更新中...' : '更新して再審査申請'}
      </button>
    </form>
  )
}
