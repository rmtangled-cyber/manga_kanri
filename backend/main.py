from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
from database import init_db, get_db

app = FastAPI(title="Manga Kanri API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# --- Models ---

class FolderCreate(BaseModel):
    name: str

class MangaAdd(BaseModel):
    folder_id: int
    mal_id: Optional[int] = None
    title: str
    title_japanese: Optional[str] = None
    image_url: Optional[str] = None
    total_volumes: Optional[int] = None
    total_chapters: Optional[int] = None
    progress_type: str = "volume"

class ProgressUpdate(BaseModel):
    read_volumes: Optional[int] = None
    read_chapters: Optional[int] = None
    progress_type: Optional[str] = None
    notes: Optional[str] = None


# --- Manga Search ---

@app.get("/api/manga/search")
async def search_manga(q: str, page: int = 1):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.jikan.moe/v4/manga",
            params={"q": q, "page": page, "limit": 20},
            timeout=10,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Jikan API error")
    data = resp.json()
    results = []
    for item in data.get("data", []):
        results.append({
            "mal_id": item["mal_id"],
            "title": item["title"],
            "title_japanese": item.get("title_japanese"),
            "image_url": item.get("images", {}).get("jpg", {}).get("image_url"),
            "volumes": item.get("volumes"),
            "chapters": item.get("chapters"),
            "status": item.get("status"),
            "score": item.get("score"),
            "synopsis": item.get("synopsis"),
        })
    return {"results": results, "pagination": data.get("pagination", {})}


# --- Folders ---

@app.get("/api/folders")
def list_folders():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT f.*, COUNT(m.id) as manga_count FROM folders f LEFT JOIN manga m ON m.folder_id = f.id GROUP BY f.id ORDER BY f.created_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]

@app.post("/api/folders", status_code=201)
def create_folder(body: FolderCreate):
    try:
        with get_db() as conn:
            cursor = conn.execute("INSERT INTO folders (name) VALUES (?)", (body.name,))
            conn.commit()
            return {"id": cursor.lastrowid, "name": body.name}
    except Exception:
        raise HTTPException(status_code=409, detail="Folder name already exists")

@app.delete("/api/folders/{folder_id}", status_code=204)
def delete_folder(folder_id: int):
    with get_db() as conn:
        result = conn.execute("DELETE FROM folders WHERE id = ?", (folder_id,))
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Folder not found")

@app.put("/api/folders/{folder_id}")
def rename_folder(folder_id: int, body: FolderCreate):
    try:
        with get_db() as conn:
            result = conn.execute("UPDATE folders SET name = ? WHERE id = ?", (body.name, folder_id))
            conn.commit()
            if result.rowcount == 0:
                raise HTTPException(status_code=404, detail="Folder not found")
        return {"id": folder_id, "name": body.name}
    except HTTPException:
        raise
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(status_code=409, detail="Folder name already exists")
        raise


# --- Manga in Folders ---

@app.get("/api/folders/{folder_id}/manga")
def list_manga(folder_id: int):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM manga WHERE folder_id = ? ORDER BY added_at DESC", (folder_id,)
        ).fetchall()
    return [dict(r) for r in rows]

@app.post("/api/manga", status_code=201)
def add_manga(body: MangaAdd):
    with get_db() as conn:
        cursor = conn.execute(
            """INSERT INTO manga (folder_id, mal_id, title, title_japanese, image_url,
               total_volumes, total_chapters, progress_type)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (body.folder_id, body.mal_id, body.title, body.title_japanese,
             body.image_url, body.total_volumes, body.total_chapters, body.progress_type),
        )
        conn.commit()
        return {"id": cursor.lastrowid, "title": body.title}

@app.put("/api/manga/{manga_id}")
def update_progress(manga_id: int, body: ProgressUpdate):
    fields, values = [], []
    if body.read_volumes is not None:
        fields.append("read_volumes = ?"); values.append(body.read_volumes)
    if body.read_chapters is not None:
        fields.append("read_chapters = ?"); values.append(body.read_chapters)
    if body.progress_type is not None:
        fields.append("progress_type = ?"); values.append(body.progress_type)
    if body.notes is not None:
        fields.append("notes = ?"); values.append(body.notes)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    values.append(manga_id)
    with get_db() as conn:
        result = conn.execute(f"UPDATE manga SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Manga not found")
    return {"id": manga_id, "updated": True}

@app.delete("/api/manga/{manga_id}", status_code=204)
def delete_manga(manga_id: int):
    with get_db() as conn:
        result = conn.execute("DELETE FROM manga WHERE id = ?", (manga_id,))
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Manga not found")
