'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Clinic } from '@/lib/supabase/types'

export function ClinicAdminTable({ clinics: initial }: { clinics: Clinic[] }) {
  const supabase  = createClient()
  const [clinics, setClinics] = useState(initial)
  const [adding, setAdding]   = useState(false)
  const [form, setForm]       = useState({ slug: '', name: '', description: '', address: '', website_url: '' })
  const [error, setError]     = useState('')

  async function add() {
    setError('')
    if (!form.slug || !form.name) { setError('スラッグと名前は必須です'); return }
    const { data, error: err } = await supabase
      .from('clinics')
      .insert({ ...form, is_published: true })
      .select()
      .single()
    if (err) { setError(err.message); return }
    setClinics(prev => [data, ...prev])
    setForm({ slug: '', name: '', description: '', address: '', website_url: '' })
    setAdding(false)
  }

  async function togglePublish(clinic: Clinic) {
    await supabase.from('clinics').update({ is_published: !clinic.is_published }).eq('id', clinic.id)
    setClinics(prev => prev.map(c => c.id === clinic.id ? { ...c, is_published: !c.is_published } : c))
  }

  async function remove(id: string) {
    if (!confirm('削除しますか？')) return
    await supabase.from('clinics').delete().eq('id', id)
    setClinics(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <button
        onClick={() => setAdding(a => !a)}
        className="mb-4 bg-brand-600 text-white px-4 py-2 rounded-xl text-base font-medium hover:bg-brand-700 transition"
      >
        + クリニックを追加
      </button>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 space-y-3">
          {error && <p className="text-rose-400 text-base">{error}</p>}
          {[
            { key: 'slug',        label: 'スラッグ（URL用 英数字-）', placeholder: 'shonan-beauty-shinjuku' },
            { key: 'name',        label: '名前', placeholder: '湘南美容クリニック 新宿院' },
            { key: 'address',     label: '住所', placeholder: '東京都新宿区...' },
            { key: 'website_url', label: '公式サイトURL', placeholder: 'https://...' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{f.label}</label>
              <input
                type="text"
                value={(form as Record<string,string>)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">説明</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">名前</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">スラッグ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">公開</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clinics.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-sm">{c.slug}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(c)}
                    className={`text-sm px-2 py-0.5 rounded-full ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_published ? '公開中' : '非公開'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(c.id)} className="text-sm text-rose-400 hover:text-rose-500 transition">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
