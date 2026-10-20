// ==========================================
// ระบบบันทึกเที่ยววิ่ง - เวอร์ชันสมบูรณ์
// ✅ เพิ่มกราฟราคา + ยอดรวมค่าขนส่ง
// ✅ กรอกค่าขนส่งจริงอัตโนมัติเมื่อเลือกประเภทตู้
// ✅ เพิ่มฟีเจอร์จดจำเลขไมล์ล่าสุด
// ==========================================

// ===== ข้อมูลราคาอ้างอิง =====
const priceReference = [
    { minKm:   1, maxKm:  30, emptyPrice:  70, fullPrice:  100 },
    { minKm:  31, maxKm:  50, emptyPrice:  90, fullPrice:  135 },
    { minKm:  51, maxKm:  75, emptyPrice: 135, fullPrice:  195 },
    { minKm:  76, maxKm: 100, emptyPrice: 190, fullPrice:  270 },
    { minKm: 101, maxKm: 150, emptyPrice: 195, fullPrice:  390 },
    { minKm: 151, maxKm: 200, emptyPrice: 310, fullPrice:  615 },
    { minKm: 201, maxKm: 250, emptyPrice: 350, fullPrice:  700 },
    { minKm: 251, maxKm: 300, emptyPrice: 350, fullPrice:  700 },
    { minKm: 301, maxKm: 350, emptyPrice: 420, fullPrice:  840 },
    { minKm: 351, maxKm: 400, emptyPrice: 420, fullPrice:  840 },
    { minKm: 401, maxKm: 450, emptyPrice: 460, fullPrice:  925 },
    { minKm: 451, maxKm: 550, emptyPrice: 460, fullPrice:  925 },
    { minKm: 551, maxKm: 600, emptyPrice: 460, fullPrice:  925 },
    { minKm: 601, maxKm: 850, emptyPrice: 700, fullPrice: 1400 },
    { minKm: 851, maxKm: 950, emptyPrice: 980, fullPrice: 1960 },
    { minKm: 951, maxKm:1000, emptyPrice: 980, fullPrice: 1960 }
];

// ===== ตัวแปรหลัก =====
let tripData = JSON.parse(localStorage.getItem('truckTripData')) || [];
let lastMileEnd = localStorage.getItem('lastMileEnd') || ''; // ✅ จดจำไมล์ล่าสุด
let typeChart = null;
let distanceChart = null;
let fareTypeChart = null;
let fareDailyChart = null;
const tripForm = document.getElementById('tripForm');

// ✅ แปลงเป็นตัวพิมพ์ใหญ่อัตโนมัติ
document.addEventListener('DOMContentLoaded', function() {
    const containerNo = document.getElementById('containerNo');
    const trailerNo = document.getElementById('trailerNo');
    const startPoint = document.getElementById('startPoint');
    const endPoint = document.getElementById('endPoint');
    
    function setupUppercase(input) {
        if (!input) return;
        input.addEventListener('input', function() {
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.toUpperCase();
            this.setSelectionRange(start, end);
        });
    }
    
    setupUppercase(containerNo);
    setupUppercase(trailerNo);
    setupUppercase(startPoint);
    setupUppercase(endPoint);
});

// ===== เหตุการณ์เมื่อกรอกข้อมูล =====
document.getElementById('mileStart').addEventListener('input', updateDistanceAndPrice);
document.getElementById('mileEnd').addEventListener('input', updateDistanceAndPrice);
document.getElementById('containerType').addEventListener('change', showReferencePrice);

// ==========================================
// 📍 ฟีเจอร์จดจำเลขไมล์ล่าสุด
// ==========================================
function showLastMile() {
    const lastMileDisplay = document.getElementById('lastMileDisplay');
    const lastMileEndVal = localStorage.getItem('lastMileEnd') || '';
    
    if (lastMileDisplay && lastMileEndVal) {
        lastMileDisplay.innerHTML = `
            <div class="last-mile-box">
                📍 ไมล์ล่าสุด: <strong>${lastMileEndVal}</strong>
                <button type="button" class="use-last-mile-btn" onclick="useLastMile()">
                    ✅ ใช้งาน
                </button>
            </div>
        `;
    } else if (lastMileDisplay) {
        lastMileDisplay.innerHTML = '<div class="last-mile-box">📍 ยังไม่มีข้อมูลไมล์ล่าสุด</div>';
    }
}

function useLastMile() {
    const lastMileEndVal = localStorage.getItem('lastMileEnd') || '';
    const mileStartInput = document.getElementById('mileStart');
    if (mileStartInput && lastMileEndVal) {
        mileStartInput.value = lastMileEndVal;
        updateDistanceAndPrice();
        mileStartInput.focus();
    }
}

function saveLastMileEnd(mileEndValue) {
    if (mileEndValue && mileEndValue !== '-') {
        localStorage.setItem('lastMileEnd', mileEndValue);
        lastMileEnd = mileEndValue;
    }
}

// ==========================================
// ฟังก์ชันคำนวณระยะทางและราคา
// ==========================================
function updateDistanceAndPrice() {
    const start = parseFloat(document.getElementById('mileStart').value) || 0;
    const end = parseFloat(document.getElementById('mileEnd').value) || 0;
    const dist = end > start ? parseFloat((end - start).toFixed(1)) : '';
    document.getElementById('distance').value = dist;
    showReferencePrice();
}

function findPrice(km) {
    if (!km || km <= 0) return null;
    for (const p of priceReference) {
        if (km >= p.minKm && km <= p.maxKm) return p;
    }
    return km > 1000 ? priceReference.at(-1) : null;
}

function showReferencePrice() {
    const dist = parseFloat(document.getElementById('distance').value);
    const type = document.getElementById('containerType').value;
    const refBox = document.getElementById('refPriceBox');
    const fareInput = document.getElementById('fare');
    
    if (!dist || !type) {
        refBox.style.display = 'none';
        return;
    }
    
    const price = findPrice(dist);
    refBox.style.display = 'block';
    
    if (price) {
        const emptyPrice = price.emptyPrice;
        const fullPrice = price.fullPrice;
        const priceValue = type === 'full' ? fullPrice : emptyPrice;
        
        document.getElementById('refEmptyPrice').textContent = emptyPrice.toLocaleString();
        document.getElementById('refFullPrice').textContent = fullPrice.toLocaleString();
        
        // ✅ กรอกราคาอ้างอิงลงช่องค่าขนส่งจริงอัตโนมัติ
        // เฉพาะเมื่อช่องว่างเท่านั้น ไม่ทับถ้ามีค่าอยู่แล้ว
        if (fareInput && !fareInput.value) {
            fareInput.value = priceValue;
        }
    } else {
        document.getElementById('refEmptyPrice').textContent = '-';
        document.getElementById('refFullPrice').textContent = '-';
    }
}

// ==========================================
// แก้ไขรูปแบบวันที่จาก Excel ให้ถูกต้อง
// ==========================================
function fixDateFormat(dateValue) {
    if (!dateValue) return '';
    
    if (typeof dateValue === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const converted = new Date(excelEpoch.getTime() + dateValue * 86400000);
        return converted.toISOString().split('T')[0];
    }
    
    let str = String(dateValue).trim();
    
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(str)) {
        let parts = str.split(/[\/\-]/);
        let day = parts[0].padStart(2, '0');
        let month = parts[1].padStart(2, '0');
        let year = parseInt(parts[2]);
        
        if (year > 2500) year -= 543;
        return `${year}-${month}-${day}`;
    }
    
    return str;
}

// ==========================================
// แก้ไขฟังก์ชันแสดงวันที่ ไม่ให้แสดง Invalid Date
// ==========================================
function formatDate(d) {
    if (!d) return '-';
    
    let dateObj = new Date(d);
    
    if (isNaN(dateObj.getTime())) {
        let str = String(d).trim();
        let parts = str.split(/[\/\-]/);
        if (parts.length === 3) {
            let day = parseInt(parts[0]);
            let month = parseInt(parts[1]) - 1;
            let year = parseInt(parts[2]);
            
            if (year > 2500) year -= 543;
            
            dateObj = new Date(year, month, day);
        }
    }
    
    if (isNaN(dateObj.getTime())) {
        return d;
    }
    
    return dateObj.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// ==========================================
// บันทึกข้อมูล
// ==========================================
tripForm.addEventListener('submit', e => {
    e.preventDefault();
    
    const distanceVal = parseFloat(document.getElementById('distance').value) || 0;
    const priceRef = findPrice(distanceVal);
    const containerType = document.getElementById('containerType').value;
    
    const trip = {
        id: Date.now(),
        date: document.getElementById('tripDate').value,
        containerSize: document.getElementById('containerSize').value,
        startPoint: document.getElementById('startPoint').value.trim().toUpperCase(),
        endPoint: document.getElementById('endPoint').value.trim().toUpperCase(),
        containerNo: document.getElementById('containerNo').value.trim().toUpperCase(),
        trailerNo: document.getElementById('trailerNo').value.trim().toUpperCase() || '-',
        departTime: document.getElementById('departTime').value || '-',
        arriveTime: document.getElementById('arriveTime').value || '-',
        mileStart: document.getElementById('mileStart').value || '-',
        mileEnd: document.getElementById('mileEnd').value || '-',
        distance: distanceVal,
        containerType: containerType,
        refPrice: priceRef ? (containerType === 'full' ? priceRef.fullPrice : priceRef.emptyPrice) : '-',
        fare: parseFloat(document.getElementById('fare').value) || 0,
        notes: document.getElementById('notes').value.trim() || '-'
    };
    
    tripData.unshift(trip);
    saveData();
    renderList();
    updateSummary();
    
    // ✅ บันทึกไมล์จบเป็นค่าล่าสุด
    saveLastMileEnd(document.getElementById('mileEnd').value);
    
    tripForm.reset();
    setTodayDate();
    showLastMile(); // อัปเดตแสดงค่าไมล์ล่าสุดใหม่
    
    alert('✅ บันทึกสำเร็จ!');
});

// ==========================================
// นำเข้าข้อมูลจาก Excel
// ==========================================
document.getElementById('importExcel').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            if (jsonData.length === 0) {
                alert('⚠️ ไม่พบข้อมูลในไฟล์ Excel');
                return;
            }

            let importedCount = 0;
            jsonData.forEach(row => {
                const trip = {
                    id: Date.now() + Math.random(),
                    date: row['วันที่'] ? fixDateFormat(row['วันที่']) : '',
                    containerSize: String(row['ขนาดตู้'] || '').replace(' ฟุต', ''),
                    startPoint: (row['ต้นทาง'] || '').trim().toUpperCase(),
                    endPoint: (row['ปลายทาง'] || '').trim().toUpperCase(),
                    containerNo: (row['เบอร์ตู้'] || '').trim().toUpperCase(),
                    trailerNo: (row['เบอร์หาง'] || '-').trim().toUpperCase(),
                    departTime: row['เวลาออก'] || '-',
                    arriveTime: row['เวลาถึง'] || '-',
                    mileStart: String(row['ไมล์ออก'] || '-'),
                    mileEnd: String(row['ไมล์ถึง'] || '-'),
                    distance: parseFloat(row['ระยะทาง (กม.)']) || 0,
                    containerType: row['ประเภทตู้'] === 'ตู้หนัก' ? 'full' : 'empty',
                    refPrice: row['ราคาอ้างอิง (บาท)'] || '-',
                    fare: parseFloat(row['ค่าขนส่งจริง (บาท)']) || 0,
                    notes: row['หมายเหตุ'] || '-'
                };
                tripData.unshift(trip);
                importedCount++;
            });

            saveData();
            renderList();
            updateSummary();
            showLastMile();
            
            alert(`✅ นำเข้าสำเร็จ! เพิ่ม ${importedCount} รายการ`);
            
        } catch (error) {
            console.error('Import error:', error);
            alert('❌ ไม่สามารถอ่านไฟล์ได้\\nตรวจสอบว่าเป็นไฟล์ .xlsx หรือ .xls และมีรูปแบบถูกต้อง');
        }
        
        e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
});

// ==========================================
// ส่งออก Excel
// ==========================================
function exportToExcel() {
    if (tripData.length === 0) {
        alert('⚠️ ไม่มีข้อมูลที่จะส่งออก!');
        return;
    }
    
    const exportData = tripData.map(t => ({
        'วันที่': formatDate(t.date),
        'ขนาดตู้': `${t.containerSize} ฟุต`,
        'ต้นทาง': t.startPoint,
        'ปลายทาง': t.endPoint,
        'เบอร์ตู้': t.containerNo,
        'เบอร์หาง': t.trailerNo,
        'เวลาออก': t.departTime,
        'เวลาถึง': t.arriveTime,
        'ไมล์ออก': t.mileStart,
        'ไมล์ถึง': t.mileEnd,
        'ระยะทาง (กม.)': t.distance,
        'ประเภทตู้': t.containerType === 'full' ? 'ตู้หนัก' : 'ตู้เปล่า',
        'ราคาอ้างอิง (บาท)': t.refPrice === '-' ? '-' : t.refPrice,
        'ค่าขนส่งจริง (บาท)': t.fare,
        'หมายเหตุ': t.notes
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'เที่ยววิ่ง');
    
    const today = new Date().toLocaleDateString('th-TH').replaceAll('/', '-');
    XLSX.writeFile(wb, `บันทึกเที่ยววิ่ง_${today}.xlsx`);
    alert('✅ ส่งออกสำเร็จ!');
}

// ==========================================
// ส่วนกราฟ
// ==========================================
function initCharts() {
    const typeCanvas = document.getElementById('typeChart');
    const distCanvas = document.getElementById('distanceChart');
    
    if (!typeCanvas || !distCanvas) {
        console.warn('ไม่พบ canvas สำหรับกราฟ');
        return;
    }
    
    const typeCtx = typeCanvas.getContext('2d');
    const distCtx = distCanvas.getContext('2d');

    typeChart = new Chart(typeCtx, {
        type: 'doughnut',
        data: {
            labels: ['📦 ตู้หนัก', '📭 ตู้เปล่า'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#f59e0b', '#10b981'],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15, font: { size: 14 } } },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.raw} เที่ยว` }
                }
            }
        }
    });

    distanceChart = new Chart(distCtx, {
        type: 'bar',
        data: {
            labels: ['📦 ตู้หนัก', '📭 ตู้เปล่า'],
            datasets: [{
                label: 'ระยะทางรวม (กม.)',
                data: [0, 0],
                backgroundColor: ['#f59e0b', '#10b981'],
                borderRadius: 8,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => v.toLocaleString() + ' กม.' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} กม.` }
                }
            }
        }
    });
}

// ==========================================
// ส่วนกราฟราคา
// ==========================================
function initFareCharts() {
    const fareTypeCanvas = document.getElementById('fareTypeChart');
    const fareDailyCanvas = document.getElementById('fareDailyChart');
    
    if (!fareTypeCanvas || !fareDailyCanvas) {
        console.warn('ไม่พบ canvas สำหรับกราฟราคา');
        return;
    }
    
    const fareTypeCtx = fareTypeCanvas.getContext('2d');
    const fareDailyCtx = fareDailyCanvas.getContext('2d');

    fareTypeChart = new Chart(fareTypeCtx, {
        type: 'doughnut',
        data: {
            labels: ['📦 ตู้หนัก', '📭 ตู้เปล่า'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#ef4444', '#22c55e'],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15, font: { size: 14 } } },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} บาท` }
                }
            }
        }
    });

    fareDailyChart = new Chart(fareDailyCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'ค่าขนส่งรวม (บาท)',
                data: [],
                backgroundColor: '#3b82f6',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: v => v.toLocaleString() }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} บาท` }
                }
            }
        }
    });
}

function updateFareCharts() {
    if (!fareTypeChart || !fareDailyChart) return;
    
    const fullFare = tripData.filter(t => t.containerType === 'full').reduce((s, t) => s + t.fare, 0);
    const emptyFare = tripData.filter(t => t.containerType === 'empty').reduce((s, t) => s + t.fare, 0);
    
    fareTypeChart.data.datasets[0].data = [fullFare, emptyFare];
    fareTypeChart.update();
    
    const dailyMap = {};
    tripData.forEach(t => {
        if (!t.date || t.date === '-') return;
        const shortDate = formatDate(t.date).split(' ').slice(0, 2).join(' ');
        dailyMap[shortDate] = (dailyMap[shortDate] || 0) + t.fare;
    });
    
    const sortedDates = Object.keys(dailyMap).reverse().slice(0, 7).reverse();
    const fareValues = sortedDates.map(d => dailyMap[d]);
    
    fareDailyChart.data.labels = sortedDates;
    fareDailyChart.data.datasets[0].data = fareValues;
    fareDailyChart.update();
}

function updateCharts() {
    if (!typeChart || !distanceChart) return;
    
    const fullTrips = tripData.filter(t => t.containerType === 'full');
    const emptyTrips = tripData.filter(t => t.containerType === 'empty');
    
    const fullCount = fullTrips.length;
    const emptyCount = emptyTrips.length;
    const fullDist = fullTrips.reduce((s, t) => s + t.distance, 0);
    const emptyDist = emptyTrips.reduce((s, t) => s + t.distance, 0);

    typeChart.data.datasets[0].data = [fullCount, emptyCount];
    typeChart.update();
    
    distanceChart.data.datasets[0].data = [fullDist, emptyDist];
    distanceChart.update();
}

// ==========================================
// แสดงผลและจัดการข้อมูล
// ==========================================
function renderList() {
    if (tripData.length === 0) {
        document.getElementById('tripList').innerHTML = `
            <div class="empty-state">
                <div style="font-size:48px;">🚛</div>
                <p>ยังไม่มีรายการบันทึก</p>
            </div>
        `;
        return;
    }
    
    document.getElementById('tripList').innerHTML = tripData.map(t => `
        <div class="log-item">
            <div class="log-top">
                <div>
                    <div class="log-route-line">
                        <span class="log-from">📍 ${t.startPoint}</span>
                        <span class="log-arrow">→</span>
                        <span class="log-to">🏁 ${t.endPoint}</span>
                    </div>
                    <div class="log-meta">
                        📅 ${formatDate(t.date)} | ${t.containerSize} ฟุต · ${t.containerNo}
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span class="tag ${t.containerType === 'full' ? 'full' : 'empty'}">
                        ${t.containerType === 'full' ? '📦 ตู้หนัก' : '📭 ตู้เปล่า'}
                    </span>
                    <button class="delete-small" onclick="deleteTrip(${t.id})">🗑️</button>
                </div>
            </div>
            <div class="log-detail-grid">
                <span>⏰ เวลาออก: <strong>${t.departTime}</strong></span>
                <span>🏁 เวลาถึง: <strong>${t.arriveTime}</strong></span>
                <span>🛣️ ระยะทาง: <strong>${t.distance}</strong> กม.</span>
                <span>💰 ค่าจริง: <strong>${t.fare.toLocaleString()}</strong> บาท</span>
            </div>
        </div>
    `).join('');
}

function updateSummary() {
    document.getElementById('totalTrips').textContent = tripData.length;
    
    const totalKm = tripData.reduce((sum, t) => sum + t.distance, 0);
    document.getElementById('totalKm').textContent = totalKm.toLocaleString() + ' กม.';
    
    const totalFare = tripData.reduce((sum, t) => sum + t.fare, 0);
    const totalFareEl = document.getElementById('totalFare');
    if (totalFareEl) {
        totalFareEl.textContent = totalFare.toLocaleString() + ' บาท';
    }
    
    document.getElementById('totalFull').textContent = tripData.filter(t => t.containerType === 'full').length;
    document.getElementById('totalEmpty').textContent = tripData.filter(t => t.containerType === 'empty').length;
    
    updateCharts();
    updateFareCharts();
}

function deleteTrip(id) {
    if (confirm('ลบรายการนี้?')) {
        tripData = tripData.filter(t => t.id !== id);
        saveData();
        renderList();
        updateSummary();
    }
}

function clearAllData() {
    if (confirm('⚠️ ล้างข้อมูลทั้งหมด? ไม่สามารถกู้คืนได้!')) {
        tripData = [];
        localStorage.removeItem('lastMileEnd'); // ล้างค่าไมล์ล่าสุดด้วย
        saveData();
        renderList();
        updateSummary();
        showLastMile();
    }
}

function saveData() {
    localStorage.setItem('truckTripData', JSON.stringify(tripData));
}

// ตั้งค่าวันที่ปัจจุบัน
function setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateInput = document.getElementById('tripDate');
    if (dateInput) {
        dateInput.value = `${year}-${month}-${day}`;
    }
}

// ===== เริ่มทำงานเมื่อหน้าโหลดเสร็จ =====
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    initCharts();
    initFareCharts();
    renderList();
    updateSummary();
    showLastMile(); // ✅ แสดงไมล์ล่าสุดทันที
});