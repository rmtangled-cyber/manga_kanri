import { useState, useEffect } from 'react'
import FolderList from './components/FolderList'
import FolderView from './components/FolderView'
import SearchPanel from './components/SearchPanel'
import './App.css'

export default function App() {
  const [folders, setFolders] = useState([])
  const [activeFolder, setActiveFolder] = useState(null)
  const [view, setView] = useState('folders') // 'folders' | 'folder' | 'search'
  const [addingTo, setAddingTo] = useState(null)

  const fetchFolders = async () => {
    const res = await fetch('/api/folders')
    setFolders(await res.json())
  }

  useEffect(() => { fetchFolders() }, [])

  const openFolder = (folder) => {
    setActiveFolder(folder)
    setView('folder')
  }

  const openSearch = (folder = null) => {
    setAddingTo(folder)
    setView('search')
  }

  const backToFolders = () => {
    setActiveFolder(null)
    setView('folders')
    fetchFolders()
  }

  const backToFolder = () => {
    setView('folder')
    setAddingTo(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          {view !== 'folders' && (
            <button className="back-btn" onClick={view === 'folder' ? backToFolders : backToFolder}>
              ← 戻る
            </button>
          )}
          <h1 className="app-title">
            📚 漫画管理
            {view === 'folder' && activeFolder && (
              <span className="breadcrumb"> / {activeFolder.name}</span>
            )}
            {view === 'search' && (
              <span className="breadcrumb"> / 漫画を検索</span>
            )}
          </h1>
        </div>
        {view !== 'search' && (
          <button className="btn-primary" onClick={() => openSearch(activeFolder)}>
            + 漫画を追加
          </button>
        )}
      </header>

      <main className="app-main">
        {view === 'folders' && (
          <FolderList
            folders={folders}
            onOpen={openFolder}
            onRefresh={fetchFolders}
          />
        )}
        {view === 'folder' && activeFolder && (
          <FolderView
            folder={activeFolder}
            onSearch={() => openSearch(activeFolder)}
          />
        )}
        {view === 'search' && (
          <SearchPanel
            folders={folders}
            defaultFolder={addingTo}
            onAdded={() => {
              if (addingTo) backToFolder()
              else backToFolders()
            }}
          />
        )}
      </main>
    </div>
  )
}
