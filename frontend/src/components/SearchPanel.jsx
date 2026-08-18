import { useState, useRef } from 'react'
import './SearchPanel.css'

export default function SearchPanel({ folders, defaultFolder, onAdded }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [folderId, setFolderId] = useState(defaultFolder?.id ?? '')
  const [progressType, setProgressType] = useState('volume')
  const [adding, setAdding] = useState(false)
  const debounceRef = useRef(null)

  const search = async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/manga/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (e) => {
    const v = e.target.value
    setQuery(v)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 500)
  }

  const addManga = async () => {
    if (!selected || !folderId) return
    setAdding(true)
    try {
      await fetch('/api/manga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder_id: Number(folderId),
          mal_id: selected.mal_id,
          title: selected.title,
          title_japanese: selected.title_japanese,
          image_url: selected.image_url,
          total_volumes: selected.volumes,
          total_chapters: selected.chapters,
          progress_type: progressType,
        }),
      })
      onAdded()
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="search-panel">
      <div className="search-bar">
        <input
          placeholder="漫画名で検索…"
          value={query}
          onChange={handleInput}
          autoFocus
        />
        {loading && <span className="loading-dot">検索中…</span>}
      </div>

      <div className="search-layout">
        <div className="results-col">
          {results.length === 0 && !loading && query && (
            <p className="no-results">「{query}」の検索結果はありません</p>
          )}
          <div className="results-list">
            {results.map((r) => (
              <div
                key={r.mal_id}
                className={`result-item ${selected?.mal_id === r.mal_id ? 'selected' : ''}`}
                onClick={() => setSelected(r)}
              >
                {r.image_url && (
                  <img className="result-thumb" src={r.image_url} alt={r.title} loading="lazy" />
                )}
                <div className="result-info">
                  <div className="result-title">{r.title}</div>
                  {r.title_japanese && (
                    <div className="result-jp">{r.title_japanese}</div>
                  )}
                  <div className="result-meta">
                    {r.volumes ? `全${r.volumes}巻` : '巻数不明'}
                    {r.status && ` · ${r.status}`}
                    {r.score && ` · ★${r.score}`}
                  </div>
                  {r.synopsis && (
                    <div className="result-synopsis">
                      {r.synopsis.slice(0, 80)}{r.synopsis.length > 80 ? '…' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div className="add-panel">
            <div className="add-title">追加: {selected.title}</div>

            <div className="add-field">
              <label>フォルダを選択</label>
              <select value={folderId} onChange={(e) => setFolderId(e.target.value)}>
                <option value="">-- 選択してください --</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="add-field">
              <label>記録方法</label>
              <div className="type-toggle">
                <button
                  className={progressType === 'volume' ? 'active' : ''}
                  onClick={() => setProgressType('volume')}
                >巻数</button>
                <button
                  className={progressType === 'chapter' ? 'active' : ''}
                  onClick={() => setProgressType('chapter')}
                >話数</button>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
              onClick={addManga}
              disabled={!folderId || adding}
            >
              {adding ? '追加中…' : 'フォルダに追加'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
