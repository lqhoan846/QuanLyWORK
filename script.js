// Cấu hình dữ liệu và ID
const params = new URLSearchParams(window.location.search);
const roomId = params.get('id');
let userData = JSON.parse(localStorage.getItem(`data_${roomId}`)) || { name: '', tasks: [] };

// Hệ thống Icon phong phú
const iconLibrary = ["❤️", "⭐", "🔥", "🚀", "🌈", "🎈", "🍀", "🌸", "🍔", "🎸", "📚", "⚽", "🐱", "🐶", "🍦", "🍎", "⚡", "💎"];

// 1. KHỞI CHẠY HỆ THỐNG
if (roomId) {
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    
    // Kiểm tra tên người dùng
    if (!userData.name) {
        document.getElementById('welcome-modal').classList.add('active');
    } else {
        initDashboard();
    }
} else {
    document.getElementById('landing-page').classList.add('active');
}

// 2. TẠO LINK VÔ HẠN
document.getElementById('btn-create-link').onclick = () => {
    const newId = 'room-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const link = window.location.origin + window.location.pathname + '?id=' + newId;
    document.getElementById('share-url').value = link;
    document.getElementById('result-link').classList.remove('hidden');
};

document.getElementById('btn-copy').onclick = () => {
    const input = document.getElementById('share-url');
    input.select();
    document.execCommand('copy');
    alert("Đã sao chép link độc quyền! Hãy lưu lại nhé.");
};

// 3. XỬ LÝ TÊN NGƯỜI DÙNG
document.getElementById('btn-start-app').onclick = () => {
    const nameInput = document.getElementById('user-name-input').value.trim();
    if (nameInput) {
        userData.name = nameInput;
        saveData();
        document.getElementById('welcome-modal').classList.remove('active');
        initDashboard();
    }
};

// 4. AI PHÂN TÍCH NHẬN DẠNG LẮT LÉO (Brain AI)
async function aiSmartParse(input) {
    const status = document.getElementById('ai-status-text');
    status.innerHTML = "🌀 AI đang 'vắt óc' phân tích...";

    // Giả lập xử lý ngôn ngữ tự nhiên
    const text = input.toLowerCase();
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})/);
    const timeMatches = text.match(/(\d{1,2})[h:](\d{0,2})/g);

    if (!dateMatch || !timeMatches) {
        status.innerHTML = "❌ Cậu ơi, thiếu ngày hoặc giờ rồi!";
        return null;
    }

    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    const startHour = parseInt(timeMatches[0]);
    const endHour = timeMatches[1] ? parseInt(timeMatches[1]) : startHour + 1;

    // Tóm tắt tên công việc (Loại bỏ các cụm từ chỉ thời gian)
    let taskName = text.replace(dateMatch[0], "").replace(/(\d{1,2})[h:](\d{0,2})/g, "").trim();
    taskName = taskName || "Công việc không tên";

    // Kiểm tra trùng lịch
    const overlap = userData.tasks.find(t => t.day === day && t.month === month && t.startHour === startHour);
    if (overlap) {
        if (!confirm(`Cảnh báo: Cậu đã có việc "${overlap.name}" lúc này rồi. Có xóa việc cũ để thay việc này không?`)) return null;
        userData.tasks = userData.tasks.filter(t => t !== overlap);
    }

    return { 
        id: Date.now(), 
        name: taskName.toUpperCase(), 
        day, month, 
        startHour, endHour, 
        color: `hsl(${Math.random() * 360}, 70%, 60%)` 
    };
}

// 5. HIỆN THỊ DASHBOARD
function initDashboard() {
    renderGrids();
    updateAIQuote();
    setInterval(updateAIQuote, 600000); // 10 phút
    document.getElementById('real-time-clock').innerText = new Date().toLocaleString();
    setInterval(() => {
        document.getElementById('real-time-clock').innerText = new Date().toLocaleString();
    }, 1000);
}

function renderGrids() {
    renderWeek('grid-now', 'header-now', 0); // Tuần này
    renderWeek('grid-next', 'header-next', 7); // Tuần sau
}

function renderWeek(gridId, headerId, offset) {
    const grid = document.getElementById(gridId);
    const header = document.getElementById(headerId);
    grid.innerHTML = ''; header.innerHTML = '';
    
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1 + offset));

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        
        // Header
        const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
        header.innerHTML += `<div class="day-box-header">${dayNames[i]}<br>(${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()})</div>`;
        
        // Column
        const col = document.createElement('div');
        col.className = 'day-column';
        
        // Render Tasks
        userData.tasks.filter(t => t.day === d.getDate() && t.month === (d.getMonth()+1)).forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-card clickable';
            el.style.backgroundColor = task.color;
            el.style.top = `${(task.startHour / 24) * 100}%`;
            el.style.height = `${((task.endHour - task.startHour) / 24) * 100}%`;
            el.innerHTML = `${task.startHour}h-${task.endHour}h: ${task.name}`;
            
            el.onclick = (e) => spawnIcons(e);
            el.oncontextmenu = (e) => {
                e.preventDefault();
                if(confirm("Tui xóa công việc này nhé?")) {
                    userData.tasks = userData.tasks.filter(t => t.id !== task.id);
                    saveData(); renderGrids();
                }
            };
            col.appendChild(el);
        });
        grid.appendChild(col);
    }
}

// 6. HIỆU ỨNG ICON BAY
function spawnIcons(e) {
    const icon = iconLibrary[Math.floor(Math.random() * iconLibrary.length)];
    for(let i=0; i<5; i++) {
        const span = document.createElement('span');
        span.className = 'flying-icon';
        span.innerText = icon;
        span.style.left = e.clientX + 'px';
        span.style.top = e.clientY + 'px';
        span.style.fontSize = (Math.random() * 20 + 10) + 'px';
        document.body.appendChild(span);
        setTimeout(() => span.remove(), 1500);
    }
}

// AI Emotion Engine
function updateAIQuote() {
    const quotes = [
        `Tui thấy cậu hơi bị bận đó ${userData.name}, nhớ uống nước nha!`,
        `Cố lên nè ${userData.name}, tui luôn ở đây cổ vũ cậu.`,
        `Hôm nay nhìn cậu năng suất thiệt sự luôn đó ${userData.name}!`,
        `Đừng quên mấy việc quan trọng nha ${userData.name}, tui nhắc đó.`
    ];
    document.getElementById('ai-bubble').innerText = quotes[Math.floor(Math.random()*quotes.length)];
}

// Helpers
function saveData() { localStorage.setItem(`data_${roomId}`, JSON.stringify(userData)); }

document.getElementById('btn-add').onclick = async () => {
    const input = document.getElementById('ai-input').value;
    if(!input) return;
    const task = await aiSmartParse(input);
    if(task) {
        userData.tasks.push(task);
        saveData();
        renderGrids();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        document.getElementById('ai-input').value = "";
    }
};

// Help Modal Logic
document.getElementById('help-icon').onclick = () => document.getElementById('help-modal').classList.add('active');
document.querySelector('.close-btn').onclick = () => document.getElementById('help-modal').classList.remove('active');
