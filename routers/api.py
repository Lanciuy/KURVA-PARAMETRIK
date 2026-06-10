from fastapi import APIRouter, Request
from utils.storage import save_curve_data

# Membuat router khusus untuk endpoint API
router = APIRouter(prefix="/api", tags=["API Data Kurva"])

@router.post("/save-curve")
async def save_curve(request: Request):
    """
    Endpoint (API) untuk menerima koordinat kurva dari frontend
    dan menyimpannya ke dalam file JSON.
    """
    try:
        # Mengambil payload JSON dari frontend
        data = await request.json()
        
        # Panggil logika penyimpanan dari modul utils
        save_curve_data(data)
        
        return {"status": "success", "message": "Data kurva berhasil disimpan."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
