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
  category: string | null
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
  body: string
  treatment_date: string | null
  cost: number | null
  rating: number | null
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
