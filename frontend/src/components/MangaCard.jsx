import { useState } from 'react'
import './MangaCard.css'

export default function MangaCard({ manga, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState(manga.progress_type)
  const [readVol, setReadVol] = useState(manga.read_volumes ?? 0)
  const [readCh, setReadCh] = useState(manga.read_chapters ?? 0)
  const [notes, setNotes] = useState(manga.notes ?? '')

  const save = async () => {
    await fetch(`/api/manga/${manga.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        progress_type: type,
        read_volumes: Number(readVol),
        read_chapters: Number(readCh),
        notes,
      }),
    })
    setEditing(false)
    onUpdated()
  }

  const remove = async () => {
    if (!confirm(`「${manga.title}」を削除しますか？`)) return
    await fetch(`/api/manga/${manga.id}`, { method: 'DELETE' })
    onUpdated()
  }

  const progress = () => {
    if (type === 'volume') {
      const total = manga.total_volumes ? `/ ${manga.total_volumes}巻` : ''
      return `${readVol}巻 ${total}`
    }
    const total = manga.total_chapters ? `/ ${manga.total_chapters}話` : ''
    return `${readCh}話 ${total}`
  }

  const pct = () => {
    if (type === 'volume' && manga.total_volumes)
      return Math.min(100, Math.round((readVol / manga.total_volumes) * 100))
    if (type === 'chapter' && manga.total_chapters)
      return Math.min(100, Math.round((readCh / manga.total_chapters) * 100))
    return null
  }

  const p = pct()

  return (
    <div className="manga-card">
      {manga.image_url && (
        <img className="manga-cover" src={manga.image_url} alt={manga.title} loading="lazy" />
      )}
      <div className="manga-info">
        <div className="manga-title">{manga.title}</div>
        {manga.title_japanese && (
          <div className="manga-title-jp">{manga.title_japanese}</div>
        )}

        {editing ? (
          <div className="manga-edit">
            <div className="edit-row">
              <label>記録方法:</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="volume">巻数</option>
                <option value="chapter">話数</option>
              </select>
            </div>
            {type === 'volume' ? (
              <div className="edit-row">
                <label>読んだ巻数:</label>
                <input type="number" min="0" value={readVol} onChange={(e) => setReadVol(e.target.value)} />
              </div>
            ) : (
              <div className="edit-row">
                <label>読んだ話数:</label>
                <input type="number" min="0" value={readCh} onChange={(e) => setReadCh(e.target.value)} />
              </div>
            )}
            <div className="edit-row">
              <label>メモ:</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="edit-btns">
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={save}>保存</button>
              <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setEditing(false)}>キャンセル</button>
            </div>
          </div>
        ) : (
          <>
            <div className="manga-progress">{progress()}</div>
            {p !== null && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${p}%` }} />
              </div>
            )}
            {notes && <div className="manga-notes">{notes}</div>}
            <div className="card-btns">
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditing(true)}>進捗を更新</button>
              <button className="btn-danger" onClick={remove}>削除</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
