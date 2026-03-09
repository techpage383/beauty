'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Treatment } from '@/lib/supabase/types'

export function TreatmentAdminTable({ treatments: initial }: { treatments: Treatment[] }) {
  const supabase = createClient()
  const [treatments, setTreatments] = useState(initial)
  const [adding, setAdding]         = useState(false)
  const [form, setForm]             = useState({ slug: '', name: '', category: '', description: '' })
  const [error, setError]           = useState('')

  async function add() {
    setError('')
    if (!form.slug || !form.name) { setError('スラッグと名前は必須です'); return }
    const { data, error: err } = await supabase
      .from('treatments')
      .insert({ ...form, is_published: true })
      .select()
      .single()
    if (err) { setError(err.message); return }
    setTreatments(prev => [data, ...prev])
    setForm({ slug: '', name: '', category: '', description: '' })
    setAdding(false)
  }

  async function togglePublish(t: Treatment) {
    await supabase.from('treatments').update({ is_published: !t.is_published }).eq('id', t.id)
    setTreatments(prev => prev.map(x => x.id === t.id ? { ...x, is_published: !x.is_published } : x))
  }

  async function remove(id: string) {
    if (!confirm('削除しますか？')) return
    await supabase.from('treatments').delete().eq('id', id)
    setTreatments(prev => prev.filter(x => x.id !== id))
  }

  return (
    <div>
      <button
        onClick={() => setAdding(a => !a)}
        className="mb-4 bg-brand-600 text-white px-4 py-2 rounded-xl text-base font-medium hover:bg-brand-700 transition"
      >
        + 施術を追加
      </button>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 space-y-3">
          {error && <p className="text-rose-400 text-base">{error}</p>}
          {[
            { key: 'slug',     label: 'スラッグ（URL用）', placeholder: 'double-eyelid-maibotsuho' },
            { key: 'name',     label: '施術名', placeholder: '二重整形（埋没法）' },
            { key: 'category', label: 'カテゴリ', placeholder: '目元' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{f.label}</label>
              <input type="text"
                value={(form as Record<string,string>)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">説明</label>
            <textarea value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <button onClick={add} className="bg-brand-600 text-white px-4 py-2 rounded-xl text-base font-medium hover:bg-brand-700 transition">
            追加する
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-base">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">施術名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">カテゴリ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">スラッグ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">公開</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {treatments.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-gray-400">{t.category ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-sm">{t.slug}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(t)}
                    className={`text-sm px-2 py-0.5 rounded-full ${t.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.is_published ? '公開中' : '非公開'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(t.id)} className="text-sm text-rose-400 hover:text-rose-500 transition">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
