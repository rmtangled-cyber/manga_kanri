import { useState, useEffect } from 'react'
import MangaCard from './MangaCard'
import './FolderView.css'

export default function FolderView({ folder, onSearch }) {
  const [mangaList, setMangaList] = useState([])

  const fetchManga = async () => {
    const res = await fetch(`/api/folders/${folder.id}/manga`)
    setMangaList(await res.json())
  }

  useEffect(() => { fetchManga() }, [folder.id])

  return (
    <div className="folder-view">
      {mangaList.length === 0 ? (
        <div className="folder-empty">
          <p>まだ漫画がありません</p>
          <button className="btn-primary" onClick={onSearch}>漫画を検索して追加</button>
        </div>
      ) : (
        <div className="manga-grid">
          {mangaList.map((m) => (
            <MangaCard key={m.id} manga={m} onUpdated={fetchManga} />
          ))}
        </div>
      )}
    </div>
  )
}
