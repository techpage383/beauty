import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema } from '@/lib/seo/schemas'

interface Crumb { name: string; href: string }

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <nav className="flex flex-wrap items-center gap-1 mb-8 text-xs text-gray-400">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">›</span>}
            {i === crumbs.length - 1
              ? <span className="text-gray-600 font-medium">{c.name}</span>
              : <Link href={c.href} className="hover:text-brand-600 transition-colors">{c.name}</Link>
            }
          </span>
        ))}
      </nav>
    </>
  )
}
