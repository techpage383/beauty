'use client'

import { useState, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminModal } from './AdminModal'
import type { Clinic } from '@/lib/supabase/types'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 60) + '-' + Math.random().toString(36).slice(2, 7)
}

type FormState = { name: string; description: string; address: string; website_url: string }
const emptyForm: FormState = { name: '', description: '', address: '', website_url: '' }

const fields: { key: keyof FormState; label: string; placeholder: string }[] = [
  { key: 'name',        label: '名前 *',        placeholder: '湘南美容クリニック 新宿院' },
  { key: 'address',     label: '住所',          placeholder: '東京都新宿区...' },
  { key: 'website_url', label: '公式サイトURL', placeholder: 'https://...' },
]

export function ClinicAdminTable({ clinics: initial }: { clinics: Clinic[] }) {
  const supabase = createClient()
  const [clinics,   setClinics]   = useState(initial)
  const [modal,     setModal]     = useState<'add' | { clinic: Clinic } | null>(null)
  const [form,      setForm]      = useState<FormState>(emptyForm)
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)

  function openAdd() { setForm(emptyForm); setError(''); setModal('add') }
  function openEdit(c: Clinic) {
    setForm({ name: c.name, description: c.description ?? '', address: c.address ?? '', website_url: c.website_url ?? '' })
    setError('')
    setModal({ clinic: c })
  }
  function close() { setModal(null) }

  async function save() {
    if (!form.name.trim()) { setError('名前は必須です'); return }
    setError(''); setSaving(true)

    if (modal === 'add') {
      const { data, error: err } = await supabase
        .from('clinics')
        .insert({ slug: toSlug(form.name), ...form, is_published: true })
        .select()
        .single()
      setSaving(false)
      if (err) { setError(err.message); return }
      setClinics(prev => [data, ...prev])
    } else if (modal && typeof modal === 'object') {
      const id = modal.clinic.id
      const { error: err } = await supabase.from('clinics').update(form).eq('id', id)
      setSaving(false)
      if (err) { setError(err.message); return }
      setClinics(prev => prev.map(c => c.id === id ? { ...c, ...form } : c))
    }
    close()
  }

  async function remove(id: string) {
    if (!confirm('削除しますか？')) return
    await supabase.from('clinics').delete().eq('id', id)
    setClinics(prev => prev.filter(c => c.id !== id))
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

  const isOpen = modal !== null
  const modalTitle = modal === 'add' ? 'クリニックを追加' : 'クリニックを編集'

  return (
    <div>
      <button onClick={openAdd} className="mb-4 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition">
        + クリニックを追加
      </button>

      {isOpen && (
        <AdminModal title={modalTitle} onClose={close}>
          {error && <p className="text-rose-500 text-sm mb-3">{error}</p>}
          <div className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-600 mb-1">{f.label}</label>
                <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} className={inp} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">説明</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3} className={`${inp} resize-none`} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={saving} className="bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition disabled:opacity-50">
              {saving ? '保存中…' : modal === 'add' ? '追加する' : '保存する'}
            </button>
            <button onClick={close} className="bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition">キャンセル</button>
          </div>
        </AdminModal>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-[40%]">名前</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell w-[40%]">住所</th>
              <th className="px-4 py-3 w-[20%]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clinics.map(c => (
              <Fragment key={c.id}>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{c.address ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(c)} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">編集</button>
                      <button onClick={() => remove(c.id)} className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">削除</button>
                    </div>
                  </td>
                </tr>
              </Fragment>
            ))}
            {clinics.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">クリニックがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
