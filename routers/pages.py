from fastapi import APIRouter
from fastapi.responses import HTMLResponse

# Membuat router khusus untuk halaman web (Views)
router = APIRouter(tags=["Halaman Utama"])

@router.get("/", response_class=HTMLResponse)
async def read_root():
    """
    Endpoint untuk menampilkan halaman HTML utama dashboard.
    Membaca isi file index.html dan mengirimkannya ke browser.
    """
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()
