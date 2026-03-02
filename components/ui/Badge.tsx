import type { ReviewStatus } from '@/lib/supabase/types'

const STATUS_LABELS: Record<ReviewStatus, string> = {
  draft:    '下書き',
  pending:  '審査中',
  approved: '公開済み',
  rejected: '却下',
}

const STATUS_COLORS: Record<ReviewStatus, string> = {
  draft:    'bg-gray-100 text-gray-600',
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
