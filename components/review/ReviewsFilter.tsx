'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

const CATEGORIES = ['すべて', '美容医療', '不妊治療', '性別適合手術'] as const

const YEARS = Array.from({ length: 5 }, (_, i) => 2026 - i)

interface Props {
  initialCategory: string
  initialSurgery: string
  initialClinic: string
  initialRegion: string
  initialYear: string
}

export function ReviewsFilter({ initialCategory, initialSurgery, initialClinic, initialRegion, initialYear }: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const [, startTransition] = useTransition()

  const [surgery, setSurgery] = useState(initialSurgery)
  const [clinic, setClinic]   = useState(initialClinic)
  const [region, setRegion]   = useState(initialRegion)
  const [year, setYear]       = useState(initialYear)

  function navigate(overrides: Record<string, string>) {
    const next = new URLSearchParams(sp.toString())
    const merged = { surgery, clinic, region, year, ...overrides }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) next.set(k, v)
      else next.delete(k)
    })
    next.delete('page')
    startTransition(() => router.push(`/reviews?${next.toString()}`))
  }

  function handleCategory(cat: string) {
    navigate({ category: cat === 'すべて' ? '' : cat })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate({})
  }

  const activeCategory = initialCategory || 'すべて'

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={
              activeCategory === cat
                ? 'bg-brand-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors'
                : 'bg-white border border-gray-200 text-gray-600 px-5 py-2 rounded-full text-sm font-semibold hover:border-brand-300 hover:text-brand-600 transition-colors'
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search filters */}
      <form onSubmit={handleSearch} className="bg-white border border-gray-100 rounded-2xl p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={surgery}
            onChange={e => setSurgery(e.target.value)}
            placeholder="施術名で探す"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
          />
          <input
            value={clinic}
            onChange={e => setClinic(e.target.value)}
            placeholder="クリニック名で探す"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
          />
          <input
            value={region}
            onChange={e => setRegion(e.target.value)}
            placeholder="地域で探す（例：東京）"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
          />
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent bg-white"
          >
            <option value="">年度 すべて</option>
            {YEARS.map(y => (
              <option key={y} value={String(y)}>{y}年</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3.5 h-3.5" />
            検索する
          </button>
        </div>
      </form>
    </div>
  )
}
