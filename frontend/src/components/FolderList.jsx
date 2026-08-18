import { useState } from 'react'
import './FolderList.css'

export default function FolderList({ folders, onOpen, onRefresh }) {
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')

  const createFolder = async () => {
    if (!newName.trim()) return
    await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setNewName('')
    setCreating(false)
    onRefresh()
  }

  const deleteFolder = async (e, id) => {
    e.stopPropagation()
    if (!confirm('このフォルダを削除しますか？（中の漫画もすべて削除されます）')) return
    await fetch(`/api/folders/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  const startEdit = (e, folder) => {
    e.stopPropagation()
    setEditId(folder.id)
    setEditName(folder.name)
  }

  const saveEdit = async (id) => {
    if (!editName.trim()) return
    await fetch(`/api/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setEditId(null)
    onRefresh()
  }

  return (
    <div className="folder-list">
      <div className="folder-grid">
        {folders.map((f) => (
          <div key={f.id} className="folder-card" onClick={() => onOpen(f)}>
            <div className="folder-icon">📁</div>
            {editId === f.id ? (
              <input
                className="folder-edit-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(f.id); if (e.key === 'Escape') setEditId(null) }}
                autoFocus
              />
            ) : (
              <div className="folder-name">{f.name}</div>
            )}
            <div className="folder-count">{f.manga_count} 作品</div>
            <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
              {editId === f.id ? (
                <button className="btn-primary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => saveEdit(f.id)}>保存</button>
              ) : (
                <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={(e) => startEdit(e, f)}>編集</button>
              )}
              <button className="btn-danger" onClick={(e) => deleteFolder(e, f.id)}>削除</button>
            </div>
          </div>
        ))}

        {creating ? (
          <div className="folder-card folder-new-form">
            <div className="folder-icon">📁</div>
            <input
              placeholder="フォルダ名"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setCreating(false) }}
              autoFocus
            />
            <div className="new-folder-btns">
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={createFolder}>作成</button>
              <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setCreating(false)}>キャンセル</button>
            </div>
          </div>
        ) : (
          <div className="folder-card folder-add-card" onClick={() => setCreating(true)}>
            <div className="folder-add-icon">+</div>
            <div className="folder-name">新しいフォルダ</div>
          </div>
        )}
      </div>

      {folders.length === 0 && !creating && (
        <p className="empty-msg">フォルダを作成して漫画を管理しましょう</p>
      )}
    </div>
  )
}
