// --- LOGIC HỆ THỐNG ---
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('id');
let db = JSON.parse(localStorage.getItem(`data_${roomId}`)) || [];

// 1. ĐIỀU HƯỚNG
if (roomId) {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
    initApp();
} else {
    document.getElementById('landing-page').classList.add('active');
}

// 2. TẠO LINK VÔ HẠN
document.getElementById('btn-create-link').onclick = () => {
    const newId = 'room-' + Math.random().toString(36).substring(2, 15);
    const link = window.location.origin + window.location.pathname + '?id=' + newId;
    document.getElementById('share-url').value = link;
    document.getElementById('result-link').classList.remove('hidden');
    // Lưu lại ID cuối để lần sau tự vào
    localStorage.setItem('last_visited', newId);
};

document.getElementById('btn-copy').onclick = () => {
    const input = document.getElementById('share-url');
    input.select();
    document.execCommand('copy');
    alert("Đã sao chép! Hãy dán vào trình duyệt để bắt đầu không gian riêng của ông.");
};

// 3. AI PHÂN TÍCH TIẾNG VIỆT (NÂNG CẤP)
async function processAIInput(text) {
    const status = document.getElementById('ai-status');
    status.innerText = "🤖 AI đang phân tích lắt léo...";
    
    // Giả lập logic AI (Trong thực tế ông sẽ gọi API Gemini ở đây)
    // Tách ngày (ví dụ: 05/01)
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
    // Tách giờ (ví dụ: 14h, 14:30)
    const timeMatch = text.match(/(\d{1,2})(h|:)(\d{0,2})/);
    
    if (!dateMatch || !timeMatch) {
        status.innerText = "❌ Thiếu ngày hoặc giờ rồi ba ơi!";
        return null;
    }

    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    const hour = parseInt(timeMatch[1]);
    const min = timeMatch[3] ? parseInt(timeMatch[3]) : 0;
    const taskName = text.split(/(\d)/)[0].trim() || "Công việc không tên";

    // Kiểm tra tương lai & quá khứ
    const inputDate = new Date(2026, month - 1, day, hour, min);
    const now = new Date();
    if (inputDate < now) { alert("❌ Không nhập được lịch quá khứ!"); return null; }
    if (inputDate > new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000)) { 
        alert("❌ Chỉ nhập được tối đa 4 tuần tới!"); return null; 
    }

    // Kiểm tra trùng
    const overlap = db.find(t => t.day === day && t.month === month && t.hour === hour);
    if (overlap) {
        if (confirm(`⚠️ Trùng với: "${overlap.name}". Thay thế không?`)) {
            db = db.filter(t => t !== overlap);
        } else { return null; }
    }

    const newTask = {
        id: Date.now(),
        name: taskName,
        day, month, hour, min,
        color: `hsl(${Math.random() * 360}, 70%, 75%)`
    };
    
    db.push(newTask);
    saveData();
    renderAll();
    status.innerText = "✅ Đã thêm vào lịch!";
}

// 4. HIỂN THỊ CHI TIẾT
function renderAll() {
    const grid = document.getElementById('grid-current-week');
    grid.innerHTML = '';
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        
        const col = document.createElement('div');
        col.className = 'day-col';
        col.innerHTML = `<div class="day-header">Thứ ${i+2}<br>${d.getDate()}/${d.getMonth()+1}</div>`;
        
        db.filter(t => t.day === d.getDate() && t.month === (d.getMonth()+1)).forEach(task => {
            const box = document.createElement('div');
            box.className = 'task-box';
            box.style.backgroundColor = task.color;
            box.style.top = `${(task.hour / 24) * 100}%`;
            box.innerHTML = `<b>${task.hour}:${task.min.toString().padStart(2,'0')}</b><br>${task.name}`;
            
            box.onclick = () => {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                getAIReminder(task.name, task.hour);
            };

            box.oncontextmenu = (e) => {
                e.preventDefault();
                if(confirm("Xóa nhé?")) {
                    db = db.filter(t => t.id !== task.id);
                    saveData(); renderAll();
                }
            };
            col.appendChild(box);
        });
        grid.appendChild(col);
    }
}

function saveData() { localStorage.setItem(`data_${roomId}`, JSON.stringify(db)); }

function initApp() {
    renderAll();
    setInterval(() => {
        document.getElementById('clock').innerText = new Date().toLocaleString();
    }, 1000);
}

document.getElementById('btn-add').onclick = () => {
    const val = document.getElementById('ai-input').value;
    if(val) processAIInput(val);
};

// AI Reminder (Faked Gemini API call)
function getAIReminder(name, hour) {
    const msgs = [
        `Ê bạn hiền, đừng quên ${name} lúc ${hour}h nhé, tui tin ông làm được!`,
        `Nhắc nhẹ nè: ${name} sắp tới rồi đó, tập trung lên nha.`,
        `Công việc ${name} đang chờ ông xử đẹp vào lúc ${hour}h đó!`
    ];
    document.getElementById('ai-text').innerText = msgs[Math.floor(Math.random()*msgs.length)];
}
