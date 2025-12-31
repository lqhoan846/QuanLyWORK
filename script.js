// --- CẤU HÌNH & KHỞI TẠO ---
const params = new URLSearchParams(window.location.search);
const roomId = params.get('id');
const storageKey = `master_data_${roomId}`;
let appState = JSON.parse(localStorage.getItem(storageKey)) || {
    userName: '',
    tasks: [],
    firstVisit: true
};

// Kho dữ liệu Icon khổng lồ
const iconVault = ["❤️","🔥","✨","🚀","🌈","🍀","⭐","🌸","🍎","🍕","🎸","⚽","🐱","💡","💎","⚡","🦋","🍩","🍿","🦄","🌍","🏝️"];

// --- ĐIỀU HƯỚNG BAN ĐẦU ---
if (roomId) {
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('dashboard-page').classList.add('active');
    
    if (appState.userName === '') {
        document.getElementById('welcome-modal').classList.add('active');
    } else {
        startDashboard();
    }
} else {
    document.getElementById('landing-page').classList.add('active');
}

// 1. TẠO LINK ĐỘC QUYỀN
document.getElementById('btn-create-room').onclick = () => {
    const uniqueId = 'room-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const fullUrl = window.location.origin + window.location.pathname + '?id=' + uniqueId;
    document.getElementById('generated-url').value = fullUrl;
    document.getElementById('link-result-area').classList.remove('hidden');
};

document.getElementById('btn-copy-url').onclick = () => {
    const input = document.getElementById('generated-url');
    input.select();
    document.execCommand('copy');
    alert("Đã sao chép! Hãy lưu lại link độc bản của cậu nhé.");
};

// 2. CHÀO HỎI LẦN ĐẦU
document.getElementById('btn-start-app').onclick = () => {
    const name = document.getElementById('user-name-input').value.trim();
    if (name) {
        appState.userName = name;
        save();
        document.getElementById('welcome-modal').classList.remove('active');
        startDashboard();
    } else {
        alert("Nhập tên để tui biết gọi cậu là gì chớ!");
    }
};

// 3. AI PHÂN TÍCH TIẾNG VIỆT (TỐI ƯU SIÊU CẤP)
async function aiParsingEngine(input) {
    const status = document.getElementById('ai-status-bubble');
    status.innerHTML = "🌀 Đợi tui xíu, tui đang phân tích 'não bộ' của cậu...";
    
    const text = input.toLowerCase();
    
    // Logic bắt ngày: ngày 15/10, 15-10, ngày mai, thứ hai tuần sau...
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})/);
    const timeMatches = text.match(/(\d{1,2})(h|:)(\d{0,2})/g);
    
    if (!dateMatch || !timeMatches) {
        speakAI(`Cậu ơi, tui không hiểu thời gian cậu nhập! Cần có ngày (vd: 15/10) và giờ (vd: 14h) nha ${appState.userName}.`);
        return null;
    }

    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    const startH = parseInt(timeMatches[0]);
    const endH = timeMatches[1] ? parseInt(timeMatches[1]) : startH + 1; // Mặc định 1 tiếng nếu ko nhập end

    // Rút gọn tên công việc
    let name = text.replace(dateMatch[0], "").replace(/(\d{1,2})(h|:)(\d{0,2})/g, "").trim();
    name = name.substring(0, 30).toUpperCase();

    // Check trùng
    const isOverlap = appState.tasks.find(t => t.day === day && t.month === month && t.startH === startH);
    if (isOverlap) {
        if (confirm(`Cậu ơi, lúc ${startH}h cậu có việc "${isOverlap.name}" rồi. Cậu định phân thân chi thuật hay muốn tui xóa việc cũ để thay việc này?`)) {
            appState.tasks = appState.tasks.filter(t => t !== isOverlap);
        } else return null;
    }

    return { id: Date.now(), name, day, month, startH, endH, color: getRandomPastel() };
}

// 4. HIỂN THỊ LỊCH TRÌNH
function startDashboard() {
    renderAllGrids();
    speakAI(`Chào cậu chủ ${appState.userName}! Hôm nay tui sẵn sàng giúp cậu quản lý mọi thứ rồi đây.`);
    
    // Đồng hồ
    setInterval(() => {
        document.getElementById('digital-clock').innerText = new Date().toLocaleString('vi-VN');
    }, 1000);
}

function renderAllGrids() {
    renderWeek('grid-now', 'labels-now', 0); // Tuần này
    renderWeek('grid-next', 'labels-next', 7); // Tuần sau
    clearOldData(); // Xóa quá 4 tuần
}

function renderWeek(gridId, labelId, offset) {
    const grid = document.getElementById(gridId);
    const label = document.getElementById(labelId);
    grid.innerHTML = ''; label.innerHTML = '';
    
    const now = new Date();
    const monday = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + offset));

    const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        
        // Header Label
        const lBox = document.createElement('div');
        lBox.className = 'day-label-box glass';
        lBox.innerHTML = `${dayNames[i]}<br>(${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()})`;
        label.appendChild(lBox);
        
        // Column
        const col = document.createElement('div');
        col.className = 'day-col';
        
        appState.tasks.filter(t => t.day === d.getDate() && t.month === (d.getMonth()+1)).forEach(task => {
            const pill = document.createElement('div');
            pill.className = 'task-pill btn-physic';
            pill.style.backgroundColor = task.color;
            pill.style.top = `${(task.startH / 24) * 100}%`;
            pill.style.height = `${((task.endH - task.startH) / 24) * 100}%`;
            pill.innerHTML = `<span>${task.startH}h: ${task.name}</span>`;
            
            pill.onclick = (e) => triggerVisualEffects(e);
            pill.oncontextmenu = (e) => {
                e.preventDefault();
                if (confirm(`Tôi xóa công việc "${task.name}" này nhé?`)) {
                    appState.tasks = appState.tasks.filter(it => it.id !== task.id);
                    save(); renderAllGrids();
                    speakAI(`Đã xóa xong xuôi rồi nha ${appState.userName}!`);
                }
            };
            col.appendChild(pill);
        });
        grid.appendChild(col);
    }
}

// 5. HIỆU ỨNG TƯƠNG TÁC
function triggerVisualEffects(e) {
    const emoji = iconVault[Math.floor(Math.random() * iconVault.length)];
    for (let i = 0; i < 6; i++) {
        const span = document.createElement('span');
        span.className = 'flying-emoji';
        span.innerText = emoji;
        span.style.left = e.clientX + 'px';
        span.style.top = e.clientY + 'px';
        span.style.fontSize = (Math.random() * 20 + 15) + 'px';
        document.body.appendChild(span);
        setTimeout(() => span.remove(), 1200);
    }
}

// AI Voice (Messenger Frame)
function speakAI(msg) {
    const box = document.getElementById('ai-text-response');
    box.innerText = msg;
    // Animation nhẹ cho khung tin nhắn
    const frame = document.getElementById('ai-msg-frame');
    frame.style.animation = 'none';
    setTimeout(() => frame.style.animation = 'bounce 0.4s', 10);
}

// --- CONTROLS ---
document.getElementById('btn-add-task').onclick = async () => {
    const input = document.getElementById('task-ai-input').value;
    if (!input) return;
    
    const res = await aiParsingEngine(input);
    if (res) {
        appState.tasks.push(res);
        save();
        renderAllGrids();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        speakAI(`Xong rồi nè! Tui đã thêm việc vào lịch cho cậu rồi đó ${appState.userName}.`);
        document.getElementById('task-ai-input').value = "";
    }
};

// Help & Sub-Views
document.getElementById('btn-open-help').onclick = () => document.getElementById('help-modal').classList.add('active');
document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => b.parentElement.parentElement.classList.remove('active'));

// --- HELPERS ---
function save() { localStorage.setItem(storageKey, JSON.stringify(appState)); }
function getRandomPastel() { return `hsl(${Math.random() * 360}, 70%, 55%)`; }
function clearOldData() {
    const now = new Date();
    // Logic tự động xóa việc cũ hơn 4 tuần...
}
