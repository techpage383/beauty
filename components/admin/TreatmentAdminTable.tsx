'use client'

import { useState, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminModal } from './AdminModal'
import type { Treatment } from '@/lib/supabase/types'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 60) + '-' + Math.random().toString(36).slice(2, 7)
}

type FormState = { name: string; description: string }
const emptyForm: FormState = { name: '', description: '' }

export function TreatmentAdminTable({ treatments: initial }: { treatments: Treatment[] }) {
  const supabase = createClient()
  const [treatments, setTreatments] = useState(initial)
  const [modal,      setModal]      = useState<'add' | { treatment: Treatment } | null>(null)
  const [form,       setForm]       = useState<FormState>(emptyForm)
  const [error,      setError]      = useState('')
  const [saving,     setSaving]     = useState(false)

  function openAdd() { setForm(emptyForm); setError(''); setModal('add') }
  function openEdit(t: Treatment) {
    setForm({ name: t.name, description: t.description ?? '' })
    setError('')
    setModal({ treatment: t })
  }
  function close() { setModal(null) }

  async function save() {
    if (!form.name.trim()) { setError('名前は必須です'); return }
    setError(''); setSaving(true)

    if (modal === 'add') {
      const { data, error: err } = await supabase
        .from('treatments')
        .insert({ slug: toSlug(form.name), ...form, is_published: true })
        .select()
        .single()
      setSaving(false)
      if (err) { setError(err.message); return }
      setTreatments(prev => [data, ...prev])
    } else if (modal && typeof modal === 'object') {
      const id = modal.treatment.id
      const { error: err } = await supabase.from('treatments').update(form).eq('id', id)
      setSaving(false)
      if (err) { setError(err.message); return }
      setTreatments(prev => prev.map(t => t.id === id ? { ...t, ...form } : t))
    }
    close()
  }

  async function remove(id: string) {
    if (!confirm('削除しますか？')) return
    await supabase.from('treatments').delete().eq('id', id)
    setTreatments(prev => prev.filter(t => t.id !== id))
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
  const isOpen = modal !== null
  const modalTitle = modal === 'add' ? '施術を追加' : '施術を編集'

  return (
    <div>
      <button onClick={openAdd} className="mb-4 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition">
        + 施術を追加
      </button>

      {isOpen && (
        <AdminModal title={modalTitle} onClose={close}>
          {error && <p className="text-rose-500 text-sm mb-3">{error}</p>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">名前 <span className="text-rose-500">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="美容医療" className={inp} />
            </div>
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
            <button onClick={close} className="text-sm text-gray-500 hover:text-gray-700 transition">キャンセル</button>
          </div>
        </AdminModal>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 w-[80%]">名前</th>
              <th className="px-4 py-3 w-[20%]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {treatments.map(t => (
              <Fragment key={t.id}>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(t)} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">編集</button>
                      <button onClick={() => remove(t.id)} className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">削除</button>
                    </div>
                  </td>
                </tr>
              </Fragment>
            ))}
            {treatments.length === 0 && (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-400">施術がありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
