from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

# Impor komponen-komponen terpisah
from utils.storage import initialize_storage
from routers import api, pages

# 1. Inisialisasi Aplikasi Induk
app = FastAPI(title="Dashboard Kurva API")

# 2. Siapkan Folder Penyimpanan (Logika di luar main)
initialize_storage()

# 3. Mount Folder Static (Menyajikan CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 4. Daftarkan Router (Memasukkan logika dari file terpisah)
app.include_router(pages.router)  # Rute untuk tampilan UI
app.include_router(api.router)    # Rute untuk data API

# 5. Blok eksekusi utama
if __name__ == "__main__":
    # Menjalankan server lokal dengan uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
