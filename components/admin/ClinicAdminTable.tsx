'use client'

import { useState, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
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

export function ClinicAdminTable({ clinics: initial }: { clinics: Clinic[] }) {
  const supabase = createClient()
  const [clinics,   setClinics]   = useState(initial)
  const [adding,    setAdding]    = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form,      setForm]      = useState<FormState>(emptyForm)
  const [editForm,  setEditForm]  = useState<FormState>(emptyForm)
  const [error,     setError]     = useState('')

  async function add() {
    setError('')
    if (!form.name) { setError('名前は必須です'); return }
    const { data, error: err } = await supabase
      .from('clinics')
      .insert({ slug: toSlug(form.name), ...form, is_published: true })
      .select()
      .single()
    if (err) { setError(err.message); return }
    setClinics(prev => [data, ...prev])
    setForm(emptyForm)
    setAdding(false)
  }

  function startEdit(c: Clinic) {
    setEditingId(c.id)
    setEditForm({ name: c.name, description: c.description ?? '', address: c.address ?? '', website_url: c.website_url ?? '' })
    setError('')
  }

  async function saveEdit(id: string) {
    setError('')
    if (!editForm.name) { setError('名前は必須です'); return }
    const { error: err } = await supabase.from('clinics').update(editForm).eq('id', id)
    if (err) { setError(err.message); return }
    setClinics(prev => prev.map(c => c.id === id ? { ...c, ...editForm } : c))
    setEditingId(null)
  }

  async function remove(id: string) {
    if (!confirm('削除しますか？')) return
    await supabase.from('clinics').delete().eq('id', id)
    setClinics(prev => prev.filter(c => c.id !== id))
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'
  const fields = [
    { key: 'name' as const,        label: '名前 *',        placeholder: '湘南美容クリニック 新宿院' },
    { key: 'address' as const,     label: '住所',          placeholder: '東京都新宿区...' },
    { key: 'website_url' as const, label: '公式サイトURL', placeholder: 'https://...' },
  ]

  return (
    <div>
      <button
        onClick={() => { setAdding(a => !a); setForm(emptyForm); setError('') }}
        className="mb-4 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition"
      >
        + クリニックを追加
      </button>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 space-y-3">
          {error && <p className="text-rose-500 text-sm">{error}</p>}
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input type="text" value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder} className={inputClass} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <button onClick={add} className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition">
            追加する
          </button>
        </div>
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
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => editingId === c.id ? setEditingId(null) : startEdit(c)}
                        className="text-brand-600 hover:text-brand-700 font-medium transition"
                      >
                        {editingId === c.id ? 'キャンセル' : '編集'}
                      </button>
                      <button onClick={() => remove(c.id)} className="text-rose-400 hover:text-rose-500 transition">削除</button>
                    </div>
                  </td>
                </tr>
                {editingId === c.id && (
                  <tr key={`${c.id}-edit`}>
                    <td colSpan={3} className="px-4 py-4 bg-brand-50 border-t border-brand-100">
                      {error && <p className="text-rose-500 text-sm mb-3">{error}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        {fields.map(f => (
                          <div key={f.key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                            <input type="text" value={editForm[f.key]} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                              className={inputClass} />
                          </div>
                        ))}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
                          <textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
                        </div>
                      </div>
                      <button onClick={() => saveEdit(c.id)}
                        className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition">
                        保存する
                      </button>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {clinics.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">クリニックがありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
