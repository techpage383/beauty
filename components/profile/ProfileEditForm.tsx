'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faFloppyDisk, faSpinner } from '@fortawesome/free-solid-svg-icons'

interface Props {
  userId: string
  displayName: string | null
  avatarUrl: string | null
}

async function resizeToWebP(file: File, size = 200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      // Center-crop to square
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('変換失敗')), 'image/webp', 0.85)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function ProfileEditForm({ userId, displayName, avatarUrl }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(displayName ?? '')
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<Blob | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const initial = (name || displayName || '?').charAt(0).toUpperCase()
  const currentAvatar = preview ?? avatarUrl

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const blob = await resizeToWebP(file)
      setPendingFile(blob)
      setPreview(URL.createObjectURL(blob))
    } catch {
      setError('画像の処理に失敗しました')
    }
    e.target.value = ''
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      let newAvatarUrl = avatarUrl

      if (pendingFile) {
        const path = `avatars/${userId}.webp`
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, pendingFile, { upsert: true, contentType: 'image/webp' })
        if (uploadErr) throw new Error(uploadErr.message)

        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        // Bust cache with timestamp
        newAvatarUrl = `${data.publicUrl}?t=${Date.now()}`
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ display_name: name.trim() || null, avatar_url: newAvatarUrl })
        .eq('id', userId)
      if (updateErr) throw new Error(updateErr.message)

      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">プロフィール編集</h2>

      <div className="flex flex-col sm:flex-row items-start gap-6">

        {/* Avatar upload */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-20 h-20 rounded-2xl overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="アバターを変更"
          >
            {currentAvatar ? (
              <Image src={currentAvatar} alt="avatar" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-brand-600 flex items-center justify-center text-white text-3xl font-black">
                {initial}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-brand-800/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FontAwesomeIcon icon={faCamera} className="w-5 h-5 text-white" />
              <span className="text-white text-[10px] font-semibold mt-1">変更</span>
            </div>
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">クリックして変更</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Name input + save */}
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            表示名
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setSaved(false) }}
            maxLength={30}
            placeholder="表示名を入力"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">{name.length}/30文字</p>

          {error && (
            <p className="text-sm text-rose-500 mt-3">{error}</p>
          )}
          {saved && !error && (
            <p className="text-sm text-green-600 mt-3 font-semibold">保存しました</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {saving
              ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
              : <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4" />
            }
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}
