'use client'

import { useState, useRef, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
import { processImage } from '@/lib/image/upload'
import { AdminModal } from './AdminModal'
import type { Doctor } from '@/lib/supabase/types'

interface Props {
  doctors: Doctor[]
  clinicOptions: { id: string; name: string }[]
  specialtyOptions: string[]
  regionOptions: string[]
}

type FormState = {
  name: string
  kana: string
  specialties: string[]    // multi-select
  clinic: string           // selected clinic name
  location: string         // single-select region
  career: string           // newline-separated
  qualifications: string   // newline-separated
  societies: string        // newline-separated
  treatments: string       // newline-separated
  is_published: boolean
  photo_url: string        // current saved URL
}

const emptyForm: FormState = {
  name: '', kana: '', specialties: [], clinic: '', location: '',
  career: '', qualifications: '', societies: '', treatments: '',
  is_published: true, photo_url: '',
}

function toArr(s: string): string[] {
  return s.split('\n').map(l => l.trim()).filter(Boolean)
}

function fromArr(arr: string[]): string {
  return arr.join('\n')
}

function doctorToForm(d: Doctor): FormState {
  return {
    name: d.name, kana: d.kana ?? '',
    specialties: d.specialties,
    clinic: d.clinic ?? '',
    location: d.location ?? '',
    career: fromArr(d.career),
    qualifications: fromArr(d.qualifications),
    societies: fromArr(d.societies),
    treatments: fromArr(d.treatments),
    is_published: d.is_published,
    photo_url: d.photo_url ?? '',
  }
}

function formToPayload(f: FormState, photoUrl?: string) {
  return {
    name: f.name, kana: f.kana || null,
    specialties: f.specialties,
    clinic: f.clinic || null,
    location: f.location || null,
    photo_url: photoUrl ? photoUrl : (f.photo_url || null),
    career: toArr(f.career),
    qualifications: toArr(f.qualifications),
    societies: toArr(f.societies),
    treatments: toArr(f.treatments),
    is_published: f.is_published,
  }
}

export function DoctorAdminTable({ doctors: initial, clinicOptions, specialtyOptions, regionOptions }: Props) {
  const supabase = createClient()
  const [doctors,   setDoctors]   = useState(initial)
  const [modal,     setModal]     = useState<'add' | { doctor: Doctor } | null>(null)
  const [form,      setForm]      = useState<FormState>(emptyForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function openAdd() { setForm(emptyForm); resetPhoto(); setError(''); setModal('add') }
  function openEdit(d: Doctor) { setForm(doctorToForm(d)); resetPhoto(); setError(''); setModal({ doctor: d }) }
  function close() { setModal(null); resetPhoto() }

  function resetPhoto() {
    setPhotoFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function toggleSpecialty(name: string) {
    setForm(p => ({
      ...p,
      specialties: p.specialties.includes(name)
        ? p.specialties.filter(s => s !== name)
        : [...p.specialties, name],
    }))
  }

  async function uploadPhoto(file: File): Promise<string> {
    const blob = await processImage(file)
    const path = `${crypto.randomUUID()}.webp`
    const { error: err } = await supabase.storage
      .from('doctors')
      .upload(path, blob, { contentType: 'image/webp', upsert: true })
    if (err) throw err
    const { data } = supabase.storage.from('doctors').getPublicUrl(path)
    return data.publicUrl
  }

  async function save() {
    if (!form.name.trim()) { setError('名前は必須です'); return }
    setError(''); setSaving(true)
    try {
      const photoUrl = photoFile ? await uploadPhoto(photoFile) : undefined
      if (modal === 'add') {
        const { data, error: err } = await supabase
          .from('doctors')
          .insert(formToPayload(form, photoUrl))
          .select()
          .single()
        if (err) throw err
        setDoctors(prev => [data as Doctor, ...prev])
      } else if (modal && typeof modal === 'object') {
        const id = modal.doctor.id
        const payload = formToPayload(form, photoUrl)
        const { error: err } = await supabase.from('doctors').update(payload).eq('id', id)
        if (err) throw err
        setDoctors(prev => prev.map(d => d.id === id ? { ...d, ...payload } : d))
      }
      close()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(d: Doctor) {
    const next = !d.is_published
    await supabase.from('doctors').update({ is_published: next }).eq('id', d.id)
    setDoctors(prev => prev.map(x => x.id === d.id ? { ...x, is_published: next } : x))
  }

  async function remove(id: number) {
    if (!confirm('この医師情報を削除しますか？')) return
    await supabase.from('doctors').delete().eq('id', id)
    setDoctors(prev => prev.filter(d => d.id !== id))
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
  const ta  = `${inp} resize-none`
  const sel = `${inp} bg-white`

  const isOpen = modal !== null
  const modalTitle = modal === 'add' ? '医師を追加' : '医師情報を編集'
  const previewSrc = preview ?? (form.photo_url || null)

  return (
    <div>
      <button onClick={openAdd} className="mb-4 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition">
        + 医師を追加
      </button>

      {isOpen && (
        <AdminModal title={modalTitle} onClose={close}>
          {error && <p className="text-rose-500 text-sm mb-3">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Photo */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">顔写真</label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewSrc} alt="プレビュー" className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={onFileChange} className="hidden" id="doctor-photo-input" />
                  <label htmlFor="doctor-photo-input"
                    className="inline-flex items-center gap-2 cursor-pointer bg-white border border-gray-200 hover:border-brand-400 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    {photoFile ? '別の画像を選ぶ' : '画像をアップロード'}
                  </label>
                  {photoFile && <p className="text-xs text-gray-500">{photoFile.name}</p>}
                  {!photoFile && form.photo_url && <p className="text-xs text-gray-400">現在の画像を使用中</p>}
                  <p className="text-xs text-gray-400">JPG / PNG / WebP / HEIC・最大5MB</p>

                  {/* 公開 toggle — placed beside photo */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${form.is_published ? 'bg-brand-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.is_published ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                      {form.is_published ? '公開中' : '非公開'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">名前 <span className="text-rose-500">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="田中 美咲" className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">読み仮名</label>
              <input type="text" value={form.kana} onChange={e => setForm(p => ({ ...p, kana: e.target.value }))} placeholder="たなか みさき" className={inp} />
            </div>

            {/* Clinic dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">クリニック</label>
              <select value={form.clinic} onChange={e => setForm(p => ({ ...p, clinic: e.target.value }))} className={sel}>
                <option value="">— 選択してください —</option>
                {clinicOptions.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Region dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">地域</label>
              <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={sel}>
                <option value="">— 選択してください —</option>
                {regionOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Specialties checkboxes */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                専門科目
                {form.specialties.length > 0 && (
                  <span className="ml-2 text-xs text-brand-600 font-normal">{form.specialties.length}件選択中</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {specialtyOptions.map(s => {
                  const selected = form.specialties.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                        selected
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                      }`}
                    >
                      {selected && <span className="mr-1">✓</span>}{s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Career */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">経歴（1行1項目）</label>
              <textarea rows={4} value={form.career} onChange={e => setForm(p => ({ ...p, career: e.target.value }))}
                placeholder={'2003年 東京大学医学部卒業\n2003〜2009年 東京大学附属病院 形成外科'} className={ta} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">保有資格（1行1項目）</label>
              <textarea rows={3} value={form.qualifications} onChange={e => setForm(p => ({ ...p, qualifications: e.target.value }))}
                placeholder={'日本形成外科学会専門医\n医学博士'} className={ta} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">所属学会（1行1項目）</label>
              <textarea rows={3} value={form.societies} onChange={e => setForm(p => ({ ...p, societies: e.target.value }))}
                placeholder={'日本形成外科学会\n日本美容外科学会（JSAPS）'} className={ta} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">対応施術（1行1項目）</label>
              <textarea rows={3} value={form.treatments} onChange={e => setForm(p => ({ ...p, treatments: e.target.value }))}
                placeholder={'二重整形（埋没法・切開法）\nヒアルロン酸注入'} className={ta} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={saving}
              className="bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition disabled:opacity-50">
              {saving ? 'アップロード中…' : modal === 'add' ? '追加する' : '保存する'}
            </button>
            <button onClick={close} className="bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition">キャンセル</button>
          </div>
        </AdminModal>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-[30%]">医師名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell w-[25%]">クリニック</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell w-[20%]">専門科目</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-[10%]">投稿数</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600 w-[10%]">公開</th>
              <th className="px-4 py-3 w-[160px]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {doctors.map(d => (
              <Fragment key={d.id}>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {d.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={d.photo_url} alt={d.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-400">{d.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{d.clinic ?? '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {d.specialties.slice(0, 2).map(s => (
                        <span key={s} className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{s}</span>
                      ))}
                      {d.specialties.length > 2 && <span className="text-xs text-gray-400">+{d.specialties.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{d.review_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => togglePublish(d)}
                        className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${d.is_published ? 'bg-brand-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${d.is_published ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(d)} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition whitespace-nowrap">編集</button>
                      <button onClick={() => remove(d.id)} className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition whitespace-nowrap">削除</button>
                    </div>
                  </td>
                </tr>
              </Fragment>
            ))}
            {doctors.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">医師情報がありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
