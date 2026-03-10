'use client'

import { useState, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const [adding,     setAdding]     = useState(false)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [form,       setForm]       = useState<FormState>(emptyForm)
  const [editForm,   setEditForm]   = useState<FormState>(emptyForm)
  const [error,      setError]      = useState('')

  async function add() {
    setError('')
    if (!form.name) { setError('名前は必須です'); return }
    const { data, error: err } = await supabase
      .from('treatments')
      .insert({ slug: toSlug(form.name), ...form, is_published: true })
      .select()
      .single()
    if (err) { setError(err.message); return }
    setTreatments(prev => [data, ...prev])
    setForm(emptyForm)
    setAdding(false)
  }

  function startEdit(t: Treatment) {
    setEditingId(t.id)
    setEditForm({ name: t.name, description: t.description ?? '' })
    setError('')
  }

  async function saveEdit(id: string) {
    setError('')
    if (!editForm.name) { setError('名前は必須です'); return }
    const { error: err } = await supabase.from('treatments').update(editForm).eq('id', id)
    if (err) { setError(err.message); return }
    setTreatments(prev => prev.map(t => t.id === id ? { ...t, ...editForm } : t))
    setEditingId(null)
  }

  async function remove(id: string) {
    if (!confirm('削除しますか？')) return
    await supabase.from('treatments').delete().eq('id', id)
    setTreatments(prev => prev.filter(t => t.id !== id))
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <div>
      <button
        onClick={() => { setAdding(a => !a); setForm(emptyForm); setError('') }}
        className="mb-4 bg-brand-600 text-white px-4 py-2 rounded-xl text-base font-semibold hover:bg-brand-700 transition"
      >
        + 施術を追加
      </button>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 space-y-3">
          {error && <p className="text-rose-500 text-base">{error}</p>}
          <div>
            <label className="block text-base font-medium text-gray-600 mb-1">名前 *</label>
            <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="美容医療" className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-600 mb-1">説明</label>
            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <button onClick={add} className="bg-brand-600 text-white px-4 py-2 rounded-xl text-base font-semibold hover:bg-brand-700 transition">
            追加する
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-base">
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
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => editingId === t.id ? setEditingId(null) : startEdit(t)}
                        className="bg-brand-600 hover:bg-brand-700 text-white text-base font-medium px-3 py-1.5 rounded-lg transition"
                      >
                        {editingId === t.id ? 'キャンセル' : '編集'}
                      </button>
                      <button onClick={() => remove(t.id)} className="bg-rose-500 hover:bg-rose-600 text-white text-base font-medium px-3 py-1.5 rounded-lg transition">削除</button>
                    </div>
                  </td>
                </tr>
                {editingId === t.id && (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 bg-brand-50 border-t border-brand-100">
                      {error && <p className="text-rose-500 text-base mb-3">{error}</p>}
                      <div className="grid grid-cols-1 gap-3 mb-3">
                        <div>
                          <label className="block text-base font-medium text-gray-600 mb-1">名前 *</label>
                          <input type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-600 mb-1">説明</label>
                          <textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
                        </div>
                      </div>
                      <button onClick={() => saveEdit(t.id)}
                        className="bg-brand-600 text-white px-4 py-2 rounded-xl text-base font-semibold hover:bg-brand-700 transition">
                        保存する
                      </button>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {treatments.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-400 text-base">施術がありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
