import json
import os

DATA_DIR = "data"
FILE_PATH = os.path.join(DATA_DIR, "curves.json")

def initialize_storage():
    """
    Memastikan folder penyimpanan data tersedia.
    Jika belum ada, buat foldernya secara otomatis.
    """
    os.makedirs(DATA_DIR, exist_ok=True)

def save_curve_data(data: dict):
    """
    Menyimpan data kurva baru ke dalam file JSON secara bertumpuk (append).
    """
    # 1. Baca data lama jika ada
    if os.path.exists(FILE_PATH):
        with open(FILE_PATH, "r", encoding="utf-8") as f:
            try:
                existing_data = json.load(f)
            except json.JSONDecodeError:
                existing_data = []
    else:
        existing_data = []
        
    # 2. Pastikan bentuk datanya adalah list
    if not isinstance(existing_data, list):
        existing_data = [existing_data]
        
    # 3. Tambahkan data baru
    existing_data.append(data)
    
    # 4. Tulis ulang file JSON dengan tambahan data baru
    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(existing_data, f, indent=4)
