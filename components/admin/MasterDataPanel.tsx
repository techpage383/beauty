'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'

interface Item {
  id: number
  name: string
  sort_order: number
}

interface Props {
  title: string
  table: 'doctor_specialties' | 'doctor_regions' | 'doctor_treatment_options'
  items: Item[]
}

interface SortableRowProps {
  item: Item
  editId: number | null
  editName: string
  setEditName: (v: string) => void
  onStartEdit: (item: Item) => void
  onSaveEdit: (id: number) => void
  onCancelEdit: () => void
  onRemove: (id: number, name: string) => void
}

function SortableRow({
  item,
  editId,
  editName,
  setEditName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const inp = 'border border-gray-200 rounded-lg px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-400'

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 transition">
      <td className="px-3 py-2.5 w-8 text-center">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 select-none text-xl leading-none"
          title="ドラッグで並び替え"
        >
          ⠿
        </span>
      </td>
      <td className="px-5 py-2.5">
        {editId === item.id ? (
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSaveEdit(item.id)}
            className={`${inp} w-full`}
            autoFocus
          />
        ) : (
          <span className="font-medium text-gray-800">{item.name}</span>
        )}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2 justify-end">
          {editId === item.id ? (
            <>
              <button
                onClick={() => onSaveEdit(item.id)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
              >
                保存
              </button>
              <button
                onClick={onCancelEdit}
                className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
              >
                キャンセル
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onStartEdit(item)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
              >
                編集
              </button>
              <button
                onClick={() => onRemove(item.id, item.name)}
                className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
              >
                削除
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export function MasterDataPanel({ title, table, items: initial }: Props) {
  const supabase = createClient()
  const [items, setItems] = useState(() => [...initial].sort((a, b) => a.sort_order - b.sort_order))
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

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
    setError('')
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) { setError('名前は必須です'); return }
    setError('')
    const { error: err } = await supabase
      .from(table)
      .update({ name: editName.trim() })
      .eq('id', id)
    if (err) { setError(err.message); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, name: editName.trim() } : i))
    setEditId(null)
  }

  async function remove(id: number, name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await supabase.from(table).delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)

    // Assign new sort_order values (10, 20, 30, ...)
    const updated = reordered.map((item, idx) => ({ ...item, sort_order: (idx + 1) * 10 }))
    setItems(updated)

    // Batch update in DB
    await Promise.all(
      updated.map(item =>
        supabase.from(table).update({ sort_order: item.sort_order }).eq('id', item.id)
      )
    )
  }

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
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-400 flex-1"
            autoFocus
          />
          <button onClick={add} className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-base font-semibold hover:bg-brand-700 transition">
            追加
          </button>
          <button onClick={() => setAdding(false)} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-lg text-base font-semibold transition">
            キャンセル
          </button>
        </div>
      )}

      <DndContext id={table} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full text-base">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-3 py-2.5 w-8" />
              <th className="text-left px-5 py-2.5 font-medium text-gray-600">名前</th>
              <th className="px-4 py-2.5 w-[180px]" />
            </tr>
          </thead>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <SortableRow
                  key={item.id}
                  item={item}
                  editId={editId}
                  editName={editName}
                  setEditName={setEditName}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditId(null)}
                  onRemove={remove}
                />
              ))}
              {items.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-6 text-center text-base text-gray-400">データがありません</td></tr>
              )}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  )
}
