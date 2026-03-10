'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { processImages } from '@/lib/image/upload'
import type { Clinic, Treatment } from '@/lib/supabase/types'

interface Props {
  clinics: Clinic[]
  treatments: Treatment[]
  userId: string
  lockedTreatmentId?: string
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
  { key: 'body_reason',       label: '選んだ理由と妥当性',       placeholder: 'このクリニック・施術を選んだ経緯や決め手を教えてください。' },
  { key: 'body_counseling',   label: 'カウンセリングのリアル',    placeholder: 'カウンセリング時の雰囲気、説明の丁寧さ、気になった点など。' },
  { key: 'body_experience',   label: '術中・術後の体感',          placeholder: '施術中の痛み・感覚、術後の腫れ・回復の様子を具体的に。' },
  { key: 'body_satisfaction', label: '仕上がりの満足度とギャップ', placeholder: '理想と実際の仕上がりの差、現在の状態をお聞かせください。' },
  { key: 'body_advice',       label: '後輩患者へのアドバイス',    placeholder: 'これから受ける方へ、事前に知っておくべきことや注意点。' },
] as const

type ScoreKey = typeof SCORE_ITEMS[number]['key']
type BodyKey  = typeof BODY_SECTIONS[number]['key']

const ANESTHESIA_OPTIONS = ['なし', '局所麻酔', '表面麻酔', '静脈麻酔', '全身麻酔', 'その他']
const PRICE_TYPE_OPTIONS = ['通常価格', 'モニター価格', 'コース価格', 'キャンペーン価格', 'その他']

function ScoreSelector({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-base text-gray-600 flex-1">{label}</span>
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
        <span className="text-lg font-bold text-gray-700 w-10 text-right">
          {value > 0 ? `${value}/5` : '-'}
        </span>
      </div>
    </div>
  )
}

export function ReviewForm({ clinics, treatments, userId, lockedTreatmentId }: Props) {
  const router  = useRouter()
  const supabase = createClient()
  const fileRef  = useRef<HTMLInputElement>(null)

  // Basic fields
  const [title,       setTitle]       = useState('')
  const [clinicId,    setClinicId]    = useState('')
  const [treatmentId, setTreatmentId] = useState(lockedTreatmentId ?? '')
  const [date,        setDate]        = useState('')
  const [cost,        setCost]        = useState('')
  const [bodyPart,    setBodyPart]    = useState('')
  const [anesthesia,  setAnesthesia]  = useState('')
  const [priceType,   setPriceType]   = useState('通常価格')

  // 8 scores
  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    score_doctor:     0,
    score_counseling: 0,
    score_anesthesia: 0,
    score_aftercare:  0,
    score_price:      0,
    score_staff:      0,
    score_facility:   0,
    score_downtime:   0,
  })

  // 5 body sections
  const [bodies, setBodies] = useState<Record<BodyKey, string>>({
    body_reason:       '',
    body_counseling:   '',
    body_experience:   '',
    body_satisfaction: '',
    body_advice:       '',
  })

  // Images
  const [previews,    setPreviews]    = useState<string[]>([])
  const [blobs,       setBlobs]       = useState<Blob[]>([])
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    try {
      const processed = await processImages(e.target.files)
      setBlobs(processed)
      setPreviews(processed.map(b => URL.createObjectURL(b)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '画像処理エラー')
    }
  }

  const totalBodyChars = Object.values(bodies).reduce((s, v) => s + v.length, 0)
  const allScoresSet   = Object.values(scores).every(v => v > 0)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!title) { setError('タイトルは必須です'); return }
    if (!allScoresSet) { setError('8項目スコアをすべて入力してください'); return }
    if (!bodies.body_reason) { setError('「選んだ理由と妥当性」は必須です'); return }

    setSubmitting(true)
    try {
      const { data: review, error: reviewErr } = await supabase
        .from('reviews')
        .insert({
          slug:         '',
          user_id:      userId,
          clinic_id:    clinicId || null,
          treatment_id: treatmentId || null,
          title,
          body_part:    bodyPart || null,
          anesthesia:   anesthesia || null,
          price_type:   priceType || null,
          treatment_date: date || null,
          cost:         cost ? parseInt(cost) : null,
          is_verified:  false,
          ...scores,
          ...bodies,
          status: 'pending',
        })
        .select('id, slug')
        .single()

      if (reviewErr) throw new Error(reviewErr.message)
      if (!review)   throw new Error('投稿に失敗しました。ログイン状態を確認してください。')

      // Upload images
      for (let i = 0; i < blobs.length; i++) {
        const uploadPath  = `${userId}/${review.id}/${i}.webp`
        const storagePath = `reviews/${uploadPath}`
        const { error: storageErr } = await supabase.storage
          .from('reviews')
          .upload(uploadPath, blobs[i], { contentType: 'image/webp', upsert: true })
        if (storageErr) throw storageErr
        await supabase.from('review_images').insert({ review_id: review.id, storage_path: storagePath, order_index: i })
      }

      router.push('/mypage?posted=1')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-rose-500 text-base bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>}

      {/* ── 基本情報 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-900 text-lg">基本情報</h2>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1.5">タイトル <span className="text-rose-500">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="例：二重整形（埋没法）でナチュラルな仕上がりに"
            className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">クリニック</label>
            <select value={clinicId} onChange={e => setClinicId(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {!lockedTreatmentId && (
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1.5">施術</label>
              <select value={treatmentId} onChange={e => setTreatmentId(e.target.value)} className={inputClass}>
                <option value="">選択してください</option>
                {treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">施術部位</label>
            <input type="text" value={bodyPart} onChange={e => setBodyPart(e.target.value)}
              placeholder="例：目元、鼻、顔全体"
              className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">施術日（年月）</label>
            <input type="month" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">総額（円）</label>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)}
              placeholder="180000" min="0" className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">価格種類</label>
            <select value={priceType} onChange={e => setPriceType(e.target.value)} className={inputClass}>
              {PRICE_TYPE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1.5">麻酔</label>
            <select value={anesthesia} onChange={e => setAnesthesia(e.target.value)} className={inputClass}>
              <option value="">選択してください</option>
              {ANESTHESIA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── 8項目スコア ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-1">8項目スコア <span className="text-rose-500">*</span></h2>
        <p className="text-base text-gray-400 mb-5">各項目を1〜5点でクリックして選択してください</p>
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
        <h2 className="font-bold text-gray-900 text-lg mb-1">
          自由記述（合計500文字以上推奨）
        </h2>
        <p className="text-base text-gray-400 mb-5">
          現在 <span className={totalBodyChars >= 500 ? 'text-emerald-600 font-bold' : 'text-gray-600 font-semibold'}>{totalBodyChars}文字</span>
          {totalBodyChars < 500 && <span className="text-gray-400"> / あと{500 - totalBodyChars}文字</span>}
          {totalBodyChars >= 500 && <span className="text-emerald-600"> ✓ 十分な記述量です</span>}
        </p>
        <div className="space-y-5">
          {BODY_SECTIONS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-base font-semibold text-gray-700 mb-1.5">
                {label}
                {key === 'body_reason' && <span className="text-rose-500 ml-1">*</span>}
              </label>
              <textarea
                value={bodies[key]}
                onChange={e => setBodies(prev => ({ ...prev, [key]: e.target.value }))}
                rows={4}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── 証拠画像 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 text-lg mb-1">証拠資料（任意）</h2>
        <p className="text-base text-gray-400 mb-4">
          領収書・予約確認画面などを添付すると「認証済」バッジが付与されます。<br />
          提出した画像は審査後に非公開設定も可能です。
        </p>
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.heic,.webp" multiple onChange={handleFiles} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl px-6 py-4 text-base text-gray-400 hover:border-brand-400 hover:text-brand-500 transition w-full"
        >
          + 画像を選択 (.jpg / .png / .heic)
        </button>
        {previews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100">
                <Image src={src} alt={`preview-${i}`} fill className="object-cover" sizes="80px" />
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50"
      >
        {submitting ? '投稿中...' : '体験を投稿する（審査待ち）'}
      </button>
    </form>
  )
}
