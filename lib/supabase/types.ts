export type ReviewStatus = 'draft' | 'pending' | 'approved' | 'rejected'
export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserAgreement {
  id: string
  user_id: string
  version: string
  agreed_at: string
}

export interface Clinic {
  id: string
  slug: string
  name: string
  description: string | null
  address: string | null
  website_url: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Treatment {
  id: string
  slug: string
  name: string
  description: string | null
  faq: { question: string; answer: string }[] | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  slug: string
  user_id: string
  clinic_id: string | null
  treatment_id: string | null
  title: string
  category: string | null          // 美容医療 | 不妊治療 | 性別適合手術
  // Meta
  body_part: string | null         // 施術部位 e.g. 目元
  anesthesia: string | null        // 麻酔種類 e.g. 局所麻酔
  price_type: string | null        // 価格種類 e.g. 通常価格
  treatment_date: string | null
  cost: number | null
  is_verified: boolean             // 認証済バッジ
  // 8-item scores (1–5)
  score_doctor: number | null      // 執刀医の技術力
  score_counseling: number | null  // カウンセリングの誠実度
  score_anesthesia: number | null  // 麻酔・痛みの管理
  score_aftercare: number | null   // アフターケアの充実度
  score_price: number | null       // 価格の妥当性
  score_staff: number | null       // 看護師・スタッフの対応
  score_facility: number | null    // 院内の清潔感・設備
  score_downtime: number | null    // ダウンタイムの許容度
  // 5-section free text
  body_reason: string | null       // 選んだ理由と妥当性
  body_counseling: string | null   // カウンセリングのリアル
  body_experience: string | null   // 術中・術後の体感
  body_satisfaction: string | null // 仕上がりの満足度とギャップ
  body_advice: string | null       // 後輩患者へのアドバイス
  // Status
  status: ReviewStatus
  rejected_reason: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // joined
  profiles?: Profile
  clinics?: Clinic
  treatments?: Treatment
  review_images?: ReviewImage[]
}

export interface ReviewImage {
  id: string
  review_id: string
  storage_path: string
  order_index: number
  created_at: string
}

// Computed helper
export function avgScore(review: Review): number | null {
  const scores = [
    review.score_doctor,
    review.score_counseling,
    review.score_anesthesia,
    review.score_aftercare,
    review.score_price,
    review.score_staff,
    review.score_facility,
    review.score_downtime,
  ].filter((s): s is number => s !== null)
  if (scores.length === 0) return null
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
}
