import type { Clinic, Review, Treatment } from '@/lib/supabase/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://truelog.example.com'

export function reviewSchema(review: Review) {
  const scores = [
    review.score_doctor, review.score_counseling, review.score_anesthesia,
    review.score_aftercare, review.score_price, review.score_staff,
    review.score_facility, review.score_downtime,
  ].filter((s): s is number => s !== null)
  const avgRating = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
    : null

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'LocalBusiness',
      name: review.clinics?.name ?? '美容クリニック',
    },
    reviewRating: avgRating !== null
      ? { '@type': 'Rating', ratingValue: avgRating, bestRating: 5 }
      : undefined,
    author: {
      '@type': 'Person',
      name: review.profiles?.display_name ?? '匿名ユーザー',
    },
    reviewBody: review.body_reason ?? '',
    datePublished: review.published_at?.slice(0, 10),
  }
}

export function localBusinessSchema(clinic: Clinic, reviewCount: number, ratingValue: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: clinic.name,
    description: clinic.description,
    address: clinic.address,
    url: clinic.website_url,
    aggregateRating: reviewCount > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: ratingValue.toFixed(1),
          reviewCount,
        }
      : undefined,
  }
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

export function breadcrumbSchema(crumbs: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.href}`,
    })),
  }
}

export function treatmentSchema(treatment: Treatment) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: treatment.name,
    description: treatment.description,
  }
}
