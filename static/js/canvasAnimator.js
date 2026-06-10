/**
 * canvasAnimator.js
 * Logika manipulasi DOM Canvas, rendering grid, dan animasi kurva
 */

const canvas = document.getElementById('curveCanvas');
const ctx = canvas.getContext('2d');
let animationFrameId = null;

// Memetakan koordinat kartesian matematika ke sistem koordinat piksel layar kanvas
// Titik pusat origin (0,0) digeser ke tengah kanvas
// Sumbu Y dibalik, karena Y pada layar membesar ke bawah, sedangkan matematika membesar ke atas
function mapCoordinate(x, y, w, h) {
    return {
        px: w / 2 + x,
        py: h / 2 - y
    };
}

// Menggambar latar belakang kanvas berupa grid transparan, sumbu X/Y tebal, dan tick marks
function drawGrid(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    
    // Konfigurasi garis grid tipis transparan
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    
    const step = 30; // Garis grid tiap 30px
    const tickStep = 60; // Teks angka dan tick mark khusus tiap 60px
    
    // --- Gambar grid vertikal dan tick mark pada sumbu X ---
    for (let x = 0; x <= w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
        
        if (x % tickStep === 0 && x !== w/2) {
            const val = x - w/2;
            ctx.fillText(val, x + 2, h/2 - 5);
            
            // Tick mark
            ctx.beginPath();
            ctx.moveTo(x, h/2 - 3);
            ctx.lineTo(x, h/2 + 3);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; // kembalikan warna
        }
    }
    
    // --- Gambar grid horizontal dan tick mark pada sumbu Y ---
    for (let y = 0; y <= h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        
        if (y % tickStep === 0 && y !== h/2) {
            const val = h/2 - y;
            ctx.fillText(val, w/2 + 5, y - 2);
            
            // Tick mark
            ctx.beginPath();
            ctx.moveTo(w/2 - 3, y);
            ctx.lineTo(w/2 + 3, y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; // kembalikan warna
        }
    }
    
    // --- Gambar sumbu X Utama (Lebih Tebal) ---
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();
    
    // --- Gambar sumbu Y Utama (Lebih Tebal) ---
    ctx.beginPath();
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w/2, h);
    ctx.stroke();
}

// Menyetel style garis solid yang profesional (tanpa efek kuas tebal)
function setGlowStyle(ctx) {
    ctx.shadowBlur = 4; // Glow tipis agar tetap modern tapi solid
    ctx.shadowColor = 'rgba(255, 0, 127, 0.5)';
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8a2be2'); // Ungu
    gradient.addColorStop(0.5, '#ff007f'); // Merah
    gradient.addColorStop(1, '#ffd700'); // Kuning
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.0; // Ketebalan standar
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

// Mereset kanvas sebelum merender ulang
function resetCanvas() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    drawGrid(ctx, canvas.width, canvas.height);
}

// Fungsi utama render animasi kurva menggunakan requestAnimationFrame
function animateCurve(pointsArray) {
    const w = canvas.width;
    const h = canvas.height;
    
    resetCanvas();
    
    const statusText = document.getElementById('renderStatusText');
    
    if (!pointsArray || pointsArray.length === 0) {
        statusText.textContent = "Tidak ada titik untuk dirender.";
        return;
    }
    
    // Sembunyikan overlay panduan secara halus
    document.getElementById('initialOverlay').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('initialOverlay').style.display = 'none';
    }, 500);
    
    const totalPoints = pointsArray.length;
    let currentIdx = 0;
    const startTime = performance.now();
    
    setGlowStyle(ctx);
    
    const liveX = document.getElementById('liveX');
    const liveY = document.getElementById('liveY');
    
    // Inner function untuk loop frame demi frame
    function drawNextSegment() {
        // Mulai path baru untuk segmen ini agar efek stroke tidak menumpuk berulang kali (mencegah efek kuas)
        ctx.beginPath();
        
        // Pindah ke titik paling ujung dari segmen sebelumnya (jika bukan titik putus)
        const prevIdx = Math.max(0, currentIdx - 1);
        const prevPtData = pointsArray[prevIdx];
        
        if (prevPtData && !prevPtData.break) {
            const prevPt = mapCoordinate(prevPtData.x, prevPtData.y, w, h);
            ctx.moveTo(prevPt.px, prevPt.py);
        }

        // Render kelipatan titik per frame supaya tidak terlalu lama
        const pointsPerFrame = Math.max(1, Math.floor(totalPoints / 120)); 
        let drawnCount = 0;
        
        while (currentIdx < totalPoints && drawnCount < pointsPerFrame) {
            const pt = pointsArray[currentIdx];
            
            // Jika bertemu penanda putus garis (pindah cabang)
            if (pt.break) {
                ctx.stroke();      // Gambar rute yang sudah diakumulasi sejauh ini
                ctx.beginPath();   // Putus garis
                currentIdx++;
                continue;          // Lanjut ke titik berikutnya tanpa menambah drawnCount
            }
            
            const mapped = mapCoordinate(pt.x, pt.y, w, h);
            
            ctx.lineTo(mapped.px, mapped.py);
            
            // Update UI Live Koordinat (akurasi 2 desimal)
            liveX.textContent = `X: ${pt.x.toFixed(2)}`;
            liveY.textContent = `Y: ${pt.y.toFixed(2)}`;
            
            currentIdx++;
            drawnCount++;
        }
        
        ctx.stroke();
        
        // Update Status Dinamis (Merender...)
        statusText.textContent = `Merender... ${currentIdx} dari ${totalPoints}`;
        statusText.style.color = '#ffd700'; // Warna kuning saat proses
        
        if (currentIdx < totalPoints) {
            animationFrameId = requestAnimationFrame(drawNextSegment);
        } else {
            // Animasi Selesai -> Perbarui Teks Status
            const timeElapsed = ((performance.now() - startTime) / 1000).toFixed(2);
            statusText.textContent = `Selesai! ${timeElapsed} dtk, ${totalPoints} titik`;
            statusText.style.color = '#00fa9a'; // Warna hijau neon
            
            // Kirim payload data ke API Backend Python
            saveDataToBackend(pointsArray, totalPoints);
        }
    }
    
    drawNextSegment();
}

// Fetch API ke backend FastAPI
async function saveDataToBackend(points, totalPoints) {
    try {
        const payload = {
            totalPoints: totalPoints,
            curveType: document.getElementById('curveType').value,
            // Simpan array titik, namun dipotong max 200 agar json tidak obesitas
            points: points.slice(0, 200) 
        };
        
        const response = await fetch('/api/save-curve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        console.log("Status Penyimpanan Backend:", result.message);
    } catch (error) {
        console.error("Gagal menyambung ke server:", error);
    }
}

// Event load untuk menggambar grid awal
window.addEventListener('load', () => {
    resetCanvas();
});
