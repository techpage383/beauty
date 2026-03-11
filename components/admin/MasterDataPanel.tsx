'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Item {
  id: number
  name: string
  sort_order: number
}

interface Props {
  title: string
  table: 'doctor_specialties' | 'doctor_regions'
  items: Item[]
}

export function MasterDataPanel({ title, table, items: initial }: Props) {
  const supabase = createClient()
  const [items,     setItems]     = useState(initial)
  const [adding,    setAdding]    = useState(false)
  const [editId,    setEditId]    = useState<number | null>(null)
  const [newName,   setNewName]   = useState('')
  const [editName,  setEditName]  = useState('')
  const [editOrder, setEditOrder] = useState(0)
  const [error,     setError]     = useState('')

  async function add() {
    if (!newName.trim()) { setError('名前は必須です'); return }
    setError('')
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) + 10 : 10
    const { data, error: err } = await supabase
      .from(table)
      .insert({ name: newName.trim(), sort_order: maxOrder })
      .select()
      .single()
    if (err) { setError(err.message); return }
    setItems(prev => [...prev, data as Item])
    setNewName('')
    setAdding(false)
  }

  function startEdit(item: Item) {
    setEditId(item.id)
    setEditName(item.name)
    setEditOrder(item.sort_order)
    setError('')
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) { setError('名前は必須です'); return }
    setError('')
    const { error: err } = await supabase
      .from(table)
      .update({ name: editName.trim(), sort_order: editOrder })
      .eq('id', id)
    if (err) { setError(err.message); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, name: editName.trim(), sort_order: editOrder } : i))
    setEditId(null)
  }

  async function remove(id: number, name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await supabase.from(table).delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const inp = 'border border-gray-200 rounded-lg px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-400'
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button
          onClick={() => { setAdding(a => !a); setNewName(''); setError('') }}
          className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-base font-semibold hover:bg-brand-700 transition"
        >
          + 追加
        </button>
      </div>

      {adding && (
        <div className="px-5 py-4 bg-brand-50 border-b border-brand-100 flex items-center gap-3">
          {error && <p className="text-rose-500 text-base">{error}</p>}
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="名前を入力"
            className={`${inp} flex-1`}
            autoFocus
          />
          <button onClick={add} className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-base font-semibold hover:bg-brand-700 transition">
            追加
          </button>
          <button onClick={() => setAdding(false)} className="text-base text-gray-400 hover:text-gray-600 transition">
            キャンセル
          </button>
        </div>
      )}

      <table className="w-full text-base">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-5 py-2.5 font-medium text-gray-600 w-[50%]">名前</th>
            <th className="text-center px-3 py-2.5 font-medium text-gray-600 w-[20%]">順序</th>
            <th className="px-4 py-2.5 w-[30%]" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map(item => (
            <tr key={item.id} className="hover:bg-gray-50 transition">
              <td className="px-5 py-2.5">
                {editId === item.id ? (
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(item.id)}
                    className={`${inp} w-full`} autoFocus />
                ) : (
                  <span className="font-medium text-gray-800">{item.name}</span>
                )}
              </td>
              <td className="px-3 py-2.5 text-center">
                {editId === item.id ? (
                  <input type="number" value={editOrder} onChange={e => setEditOrder(Number(e.target.value))}
                    className={`${inp} w-16 text-center`} />
                ) : (
                  <span className="text-gray-400">{item.sort_order}</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2 justify-end">
                  {editId === item.id ? (
                    <>
                      <button onClick={() => saveEdit(item.id)}
                        className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition">
                        保存
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="text-sm text-gray-400 hover:text-gray-600 transition">
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(item)}
                        className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition">
                        編集
                      </button>
                      <button onClick={() => remove(item.id, item.name)}
                        className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition">
                        削除
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={3} className="px-5 py-6 text-center text-base text-gray-400">データがありません</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
