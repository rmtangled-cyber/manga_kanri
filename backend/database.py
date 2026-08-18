import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "manga_kanri.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS folders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS manga (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                folder_id INTEGER NOT NULL,
                mal_id INTEGER,
                title TEXT NOT NULL,
                title_japanese TEXT,
                image_url TEXT,
                total_volumes INTEGER,
                total_chapters INTEGER,
                read_volumes INTEGER DEFAULT 0,
                read_chapters INTEGER DEFAULT 0,
                progress_type TEXT DEFAULT 'volume',
                notes TEXT,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
            )
        """)
        conn.commit()
