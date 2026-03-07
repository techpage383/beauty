'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars, faXmark,
  faHospital, faWandMagicSparkles, faNewspaper, faPenToSquare, faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const navItems: { href: string; label: string; icon: IconDefinition }[] = [
  { href: '/clinics',    label: 'クリニック', icon: faHospital },
  { href: '/treatments', label: '施術',       icon: faWandMagicSparkles },
  { href: '/reviews',    label: '口コミ',     icon: faNewspaper },
  { href: '/post/new',   label: '投稿する',   icon: faPenToSquare },
  { href: '/reviews',    label: '検索',       icon: faMagnifyingGlass },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
        className="flex items-center justify-center w-10 h-10 rounded-lg text-brand-700 hover:bg-brand-50 transition-colors lg:hidden"
      >
        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-600">
          <span className="font-bold text-lg text-brand-700">メニュー</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="メニューを閉じる"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 px-5 py-3.5 text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <span className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
              </span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
