/**
 * geometryCalc.js
 * Logika perhitungan matematika untuk kurva parametrik
 */

// Menghitung titik-titik untuk Lingkaran
// Rumus Parametrik:
// x = xc + r * cos(t)
// y = yc + r * sin(t)
function calculateCircle(xc, yc, r, delta, tMin, tMax) {
    const points = [];
    for (let t = tMin; t <= tMax; t += delta) {
        // Konversi t dari derajat ke radian untuk fungsi Math JS
        const rad = t * (Math.PI / 180);
        const x = xc + r * Math.cos(rad);
        const y = yc + r * Math.sin(rad);
        points.push({ x, y, t });
    }
    return points;
}

// Menghitung titik-titik untuk Elips
// Rumus Parametrik:
// x = xc + a * cos(t)
// y = yc + b * sin(t)
function calculateEllipse(xc, yc, a, b, delta, tMin, tMax) {
    const points = [];
    for (let t = tMin; t <= tMax; t += delta) {
        const rad = t * (Math.PI / 180);
        const x = xc + a * Math.cos(rad);
        const y = yc + b * Math.sin(rad);
        points.push({ x, y, t });
    }
    return points;
}

// Menghitung titik-titik untuk Parabola
// Mendukung 4 orientasi (kanan, kiri, atas, bawah)
function calculateParabola(xc, yc, a, delta, tMin, tMax, orientation) {
    const points = [];
    for (let t = tMin; t <= tMax; t += delta) {
        let x, y;
        
        switch(orientation) {
            case 'right':
                // Terbuka ke kanan: x = at^2, y = 2at
                x = xc + a * t * t;
                y = yc + 2 * a * t;
                break;
            case 'left':
                // Terbuka ke kiri: x = -at^2, y = 2at
                x = xc - a * t * t;
                y = yc + 2 * a * t;
                break;
            case 'up':
                // Terbuka ke atas: x = 2at, y = at^2
                x = xc + 2 * a * t;
                y = yc + a * t * t;
                break;
            case 'down':
                // Terbuka ke bawah: x = 2at, y = -at^2
                x = xc + 2 * a * t;
                y = yc - a * t * t;
                break;
            default:
                x = xc + a * t * t;
                y = yc + 2 * a * t;
        }
        points.push({ x, y, t });
    }
    return points;
}

// Menghitung titik-titik untuk Hiperbola
// Mendukung 3 mode orientasi (horizontal, vertikal, cabang kiri)
// Rumus umum menggunakan sec(t) dan tan(t)
function calculateHyperbola(xc, yc, a, b, delta, tMin, tMax, orientation) {
    const points = [];
    
    // Helper function untuk merender satu sisi cabang hiperbola
    function makeBranch(signX, signY, isVertical) {
        for (let t = tMin; t <= tMax; t += delta) {
            // Mencegah nilai tak terhingga pada sec/tan (sudut mendekati 90 atau -90)
            if (Math.abs(t % 180) === 90) continue;
            
            const rad = t * (Math.PI / 180);
            
            // sec(t) = 1 / cos(t)
            const secT = 1 / Math.cos(rad);
            const tanT = Math.tan(rad);
            
            let x, y;
            if (isVertical) {
                // Hiperbola Vertikal: y = a*sec(t), x = b*tan(t)
                x = xc + b * tanT * signX;
                y = yc + a * secT * signY;
            } else {
                // Hiperbola Horizontal: x = a*sec(t), y = b*tan(t)
                x = xc + a * secT * signX;
                y = yc + b * tanT * signY;
            }
            
            // Abaikan titik yang terlalu jauh dari kanvas untuk rendering yang bersih
            if (Math.abs(x) > 5000 || Math.abs(y) > 5000) continue;
            
            points.push({ x, y, t });
        }
    }

    if (orientation === 'horizontal') {
        makeBranch(1, 1, false); // Cabang Kanan
        points.push({ break: true }); // Tanda putus garis antar cabang
        makeBranch(-1, 1, false); // Cabang Kiri
    } else if (orientation === 'vertical') {
        makeBranch(1, 1, true); // Cabang Atas
        points.push({ break: true });
        makeBranch(1, -1, true); // Cabang Bawah
    } else if (orientation === 'left-branch') {
        makeBranch(-1, 1, false); // Hanya cabang kiri
    } else {
        makeBranch(1, 1, false); // Default cabang kanan
    }
    
    return points;
}
