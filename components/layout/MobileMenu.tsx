'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'

const navItems = [
  { href: '/about',    label: 'Be Voiceとは' },
  { href: '/reviews',  label: '口コミを見る' },
  { href: '/doctors',  label: '医師情報' },
  { href: '/post/new', label: '口コミを投稿する' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="メニューを開く"
        className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
      >
        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        suppressHydrationWarning
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-base text-gray-900">メニュー</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="メニューを閉じる"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors border-b border-gray-50"
            >
              {item.label}
            </Link>
          ))}
          <div className="px-5 pt-5">
            <Link
              href="/post/new"
              onClick={() => setOpen(false)}
              className="block w-full text-center bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-3 rounded-lg transition-colors"
            >
              投稿を申請する
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
