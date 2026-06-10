/**
 * ui.js
 * Menangani logika Event Listener, Form Builder, dan Panel Analisis
 */

const curveSelect = document.getElementById('curveType');
const paramsContainer = document.getElementById('paramsContainer');
const presetGrid = document.getElementById('presetGrid');
const analysisContent = document.getElementById('analysisContent');
const btnProcess = document.getElementById('btnProcess');

// Menyediakan definisi form input secara dinamis untuk masing-masing kurva
function getParamDefs(curveType) {
    const commonParams = [
        { id: 'xc', label: 'Pusat X (xc)', type: 'number', default: 0 },
        { id: 'yc', label: 'Pusat Y (yc)', type: 'number', default: 0 },
        { id: 'tMin', label: 'T Min', type: 'number', default: 0 },
        { id: 'tMax', label: 'T Max', type: 'number', default: 360 },
        { id: 'delta', label: 'Interval (\u0394)', type: 'number', default: 1, step: 0.1 }
    ];

    switch (curveType) {
        case 'circle':
            return [
                ...commonParams,
                { id: 'r', label: 'Jari-jari (r)', type: 'number', default: 100 }
            ];
        case 'ellipse':
            return [
                ...commonParams,
                { id: 'a', label: 'Jari-jari X (a)', type: 'number', default: 150 },
                { id: 'b', label: 'Jari-jari Y (b)', type: 'number', default: 80 }
            ];
        case 'parabola':
            return [
                { id: 'xc', label: 'Pusat X (xc)', type: 'number', default: 0 },
                { id: 'yc', label: 'Pusat Y (yc)', type: 'number', default: 0 },
                { id: 'tMin', label: 'T Min', type: 'number', default: -10 },
                { id: 'tMax', label: 'T Max', type: 'number', default: 10 },
                { id: 'delta', label: 'Interval (\u0394)', type: 'number', default: 0.1, step: 0.01 },
                { id: 'a', label: 'Fokus (a)', type: 'number', default: 10 },
                { id: 'orientation', label: 'Orientasi', type: 'select', options: [
                    { value: 'up', label: 'Buka ke Atas' },
                    { value: 'down', label: 'Buka ke Bawah' },
                    { value: 'right', label: 'Buka ke Kanan' },
                    { value: 'left', label: 'Buka ke Kiri' }
                ], default: 'up'}
            ];
        case 'hyperbola':
            return [
                { id: 'xc', label: 'Pusat X (xc)', type: 'number', default: 0 },
                { id: 'yc', label: 'Pusat Y (yc)', type: 'number', default: 0 },
                { id: 'tMin', label: 'T Min (derajat)', type: 'number', default: -60 },
                { id: 'tMax', label: 'T Max (derajat)', type: 'number', default: 60 },
                { id: 'delta', label: 'Interval (\u0394)', type: 'number', default: 1, step: 0.1 },
                { id: 'a', label: 'Sumbu Semi-Mayor (a)', type: 'number', default: 50 },
                { id: 'b', label: 'Sumbu Semi-Minor (b)', type: 'number', default: 40 },
                { id: 'orientation', label: 'Orientasi', type: 'select', options: [
                    { value: 'horizontal', label: 'Horizontal (Kanan)' },
                    { value: 'left-branch', label: 'Horizontal (Kiri)' },
                    { value: 'vertical', label: 'Vertikal' }
                ], default: 'horizontal'}
            ];
    }
}

// 6 Preset unik untuk mempercepat user mencoba parameter yang bagus
function getPresets(curveType) {
    switch (curveType) {
        case 'circle':
            return [
                { label: 'Kecil', params: { xc: 0, yc: 0, r: 50, tMin: 0, tMax: 360, delta: 2 } },
                { label: 'Sedang', params: { xc: 0, yc: 0, r: 120, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Besar', params: { xc: 0, yc: 0, r: 200, tMin: 0, tMax: 360, delta: 0.5 } },
                { label: 'Kanan Atas', params: { xc: 100, yc: 100, r: 80, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Setengah', params: { xc: 0, yc: 0, r: 150, tMin: 0, tMax: 180, delta: 1 } },
                { label: 'Low-Res (Segi)', params: { xc: 0, yc: 0, r: 120, tMin: 0, tMax: 360, delta: 60 } }
            ];
        case 'ellipse':
            return [
                { label: 'Lebar', params: { xc: 0, yc: 0, a: 200, b: 80, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Tinggi', params: { xc: 0, yc: 0, a: 80, b: 200, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Mirip Lingkaran', params: { xc: 0, yc: 0, a: 120, b: 100, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Kiri Bawah', params: { xc: -100, yc: -100, a: 150, b: 50, tMin: 0, tMax: 360, delta: 1 } },
                { label: 'Setengah', params: { xc: 0, yc: 0, a: 180, b: 90, tMin: 0, tMax: 180, delta: 1 } },
                { label: 'Detail Tinggi', params: { xc: 0, yc: 0, a: 150, b: 100, tMin: 0, tMax: 360, delta: 0.2 } }
            ];
        case 'parabola':
            return [
                { label: 'Lebar Atas', params: { xc: 0, yc: 0, a: 20, orientation: 'up', tMin: -5, tMax: 5, delta: 0.05 } },
                { label: 'Sempit Atas', params: { xc: 0, yc: -100, a: 5, orientation: 'up', tMin: -10, tMax: 10, delta: 0.1 } },
                { label: 'Lebar Bawah', params: { xc: 0, yc: 100, a: 15, orientation: 'down', tMin: -6, tMax: 6, delta: 0.1 } },
                { label: 'Kanan', params: { xc: -150, yc: 0, a: 10, orientation: 'right', tMin: -8, tMax: 8, delta: 0.1 } },
                { label: 'Kiri', params: { xc: 150, yc: 0, a: 10, orientation: 'left', tMin: -8, tMax: 8, delta: 0.1 } },
                { label: 'Titik Rapat', params: { xc: 0, yc: 0, a: 10, orientation: 'up', tMin: -8, tMax: 8, delta: 0.01 } }
            ];
        case 'hyperbola':
            return [
                { label: 'H. Standar', params: { xc: 0, yc: 0, a: 50, b: 30, orientation: 'horizontal', tMin: -60, tMax: 60, delta: 0.5 } },
                { label: 'H. Lebar', params: { xc: 0, yc: 0, a: 100, b: 40, orientation: 'horizontal', tMin: -70, tMax: 70, delta: 1 } },
                { label: 'H. Sempit', params: { xc: 0, yc: 0, a: 30, b: 80, orientation: 'horizontal', tMin: -50, tMax: 50, delta: 0.5 } },
                { label: 'V. Standar', params: { xc: 0, yc: 0, a: 30, b: 50, orientation: 'vertical', tMin: -60, tMax: 60, delta: 0.5 } },
                { label: 'Cabang Kiri', params: { xc: 0, yc: 0, a: 50, b: 40, orientation: 'left-branch', tMin: -65, tMax: 65, delta: 0.5 } },
                { label: 'Ultra Detail', params: { xc: 0, yc: 0, a: 40, b: 40, orientation: 'horizontal', tMin: -80, tMax: 80, delta: 0.05 } }
            ];
    }
}

// Generate HTML elements untuk form
function buildForm(curveType) {
    const params = getParamDefs(curveType);
    paramsContainer.innerHTML = ''; // Bersihkan kontainer
    
    params.forEach(param => {
        const div = document.createElement('div');
        div.className = 'form-group';
        
        const label = document.createElement('label');
        label.setAttribute('for', `param_${param.id}`);
        label.textContent = param.label;
        
        let input;
        if (param.type === 'select') {
            input = document.createElement('select');
            input.id = `param_${param.id}`;
            param.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (opt.value === param.default) option.selected = true;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.type = 'number';
            input.id = `param_${param.id}`;
            input.value = param.default;
            if (param.step) input.step = param.step;
        }
        
        div.appendChild(label);
        div.appendChild(input);
        paramsContainer.appendChild(div);
    });
}

// Generate tombol HTML untuk presets
function buildPresets(curveType) {
    const presets = getPresets(curveType);
    presetGrid.innerHTML = '';
    
    presets.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'btn-preset';
        btn.textContent = preset.label;
        btn.addEventListener('click', () => {
            for (const key in preset.params) {
                const input = document.getElementById(`param_${key}`);
                if (input) {
                    input.value = preset.params[key];
                }
            }
        });
        presetGrid.appendChild(btn);
    });
}

// Mengambil semua nilai saat ini di form UI
function getFormValues(curveType) {
    const params = getParamDefs(curveType);
    const values = {};
    params.forEach(param => {
        const input = document.getElementById(`param_${param.id}`);
        if (param.type === 'number') {
            values[param.id] = parseFloat(input.value);
        } else {
            values[param.id] = input.value;
        }
    });
    return values;
}

// Mengisi Panel Analisis dengan Info Rumus dan Properti Kurva
function updateAnalysisPanel(curveType, values, totalPoints) {
    let equation = '';
    let props = '';
    
    switch (curveType) {
        case 'circle':
            equation = `x = ${values.xc} + ${values.r} &middot; cos(t)<br>y = ${values.yc} + ${values.r} &middot; sin(t)`;
            props = `Jari-jari (r): ${values.r}`;
            break;
        case 'ellipse':
            equation = `x = ${values.xc} + ${values.a} &middot; cos(t)<br>y = ${values.yc} + ${values.b} &middot; sin(t)`;
            props = `Sumbu X (a): ${values.a}<br>Sumbu Y (b): ${values.b}`;
            break;
        case 'parabola':
            equation = `x = f(t)<br>y = g(t)<br><em>Tergantung orientasi</em>`;
            props = `Fokus (a): ${values.a}<br>Arah: ${values.orientation.toUpperCase()}`;
            break;
        case 'hyperbola':
            equation = `x = ${values.xc} &plusmn; ${values.a} &middot; sec(t)<br>y = ${values.yc} + ${values.b} &middot; tan(t)`;
            props = `Semi-mayor (a): ${values.a}<br>Semi-minor (b): ${values.b}`;
            break;
    }
    
    const html = `
        <p><strong>Rumus Parametrik:</strong></p>
        <p><code>${equation}</code></p>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:10px 0;">
        <p><strong>Properti Kurva:</strong><br>${props}</p>
        <p><strong>Rentang $t$:</strong> ${values.tMin} s/d ${values.tMax}</p>
        <p><strong>Interval (Δ):</strong> ${values.delta}</p>
        <p><strong>Estimasi Titik:</strong> ~${totalPoints}</p>
    `;
    analysisContent.innerHTML = html;
}

// Listener: Perbarui form saat memilih jenis kurva lain di dropdown
curveSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    buildForm(type);
    buildPresets(type);
    analysisContent.innerHTML = '<p>Klik "Proses Gambar" untuk melihat analisis.</p>';
});

// Listener: Klik Proses Gambar
btnProcess.addEventListener('click', () => {
    const type = curveSelect.value;
    const vals = getFormValues(type);
    
    let points = [];
    
    // Perhitungan matematika melalui geometryCalc.js
    switch (type) {
        case 'circle':
            points = calculateCircle(vals.xc, vals.yc, vals.r, vals.delta, vals.tMin, vals.tMax);
            break;
        case 'ellipse':
            points = calculateEllipse(vals.xc, vals.yc, vals.a, vals.b, vals.delta, vals.tMin, vals.tMax);
            break;
        case 'parabola':
            points = calculateParabola(vals.xc, vals.yc, vals.a, vals.delta, vals.tMin, vals.tMax, vals.orientation);
            break;
        case 'hyperbola':
            points = calculateHyperbola(vals.xc, vals.yc, vals.a, vals.b, vals.delta, vals.tMin, vals.tMax, vals.orientation);
            break;
    }
    
    // Update panel detail info
    updateAnalysisPanel(type, vals, points.length);
    
    // Kirim titik ke canvasAnimator.js untuk dirender
    animateCurve(points);
});

// Load awal aplikasi
window.addEventListener('DOMContentLoaded', () => {
    buildForm('circle');
    buildPresets('circle');
});
