'use client'

import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

export function DragScrollRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const state = useRef({ dragging: false, startX: 0, scrollLeft: 0, moved: false })

  function onPointerDown(e: React.PointerEvent) {
    const el = ref.current
    if (!el) return
    state.current = { dragging: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false }
    el.setPointerCapture(e.pointerId)
    el.style.cursor = 'grabbing'
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!state.current.dragging || !ref.current) return
    const dx = e.clientX - state.current.startX
    if (Math.abs(dx) > 4) state.current.moved = true
    ref.current.scrollLeft = state.current.scrollLeft - dx
  }

  function onPointerUp() {
    state.current.dragging = false
    if (ref.current) ref.current.style.cursor = 'grab'
  }

  function onClickCapture(e: React.MouseEvent) {
    if (state.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      state.current.moved = false
    }
  }

  function scroll(dir: 'left' | 'right') {
    if (!ref.current) return
    const amount = ref.current.clientWidth * 0.75
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="relative group/row">
      {/* Left button */}
      <button
        onClick={() => scroll('left')}
        aria-label="前へ"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-brand-600 hover:bg-brand-50 hover:border-brand-300 transition-all"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
      </button>

      {/* Scrollable row */}
      <div
        ref={ref}
        className={`flex gap-5 overflow-x-auto select-none cursor-grab pb-3 ${className}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => onPointerUp()}
        onPointerCancel={() => onPointerUp()}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll('right')}
        aria-label="次へ"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-brand-600 hover:bg-brand-50 hover:border-brand-300 transition-all"
      >
        <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
      </button>
    </div>
  )
}
