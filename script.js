// CẤU HÌNH BAN ĐẦU
let currentID = new URLSearchParams(window.location.search).get('id');
let tasks = JSON.parse(localStorage.getItem(`tasks_${currentID}`)) || [];

// 1. ĐIỀU HƯỚNG ROUTING
if (currentID) {
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('dashboard-page').classList.add('active');
    initDashboard();
} else {
    // Tự động tìm ID trong LocalStorage nếu có
    const savedID = localStorage.getItem('last_room_id');
    if (savedID) {
        window.location.href = `?id=${savedID}`;
    }
}

// 2. TẠO LINK ĐỘC QUYỀN
document.getElementById('create-room-btn').addEventListener('click', () => {
    const uuid = 'room-' + Math.random().toString(36).substr(2, 9);
    const fullURL = window.location.origin + window.location.pathname + '?id=' + uuid;
    
    document.getElementById('generated-url').value = fullURL;
    document.getElementById('url-display-area').classList.remove('hidden');
    localStorage.setItem('last_room_id', uuid);
});

function copyURL() {
    const copyText = document.getElementById('generated-url');
    copyText.select();
    document.execCommand("copy");
    alert("Đã sao chép link! Hãy dán vào trình duyệt để bắt đầu.");
}

// 3. AI PHÂN TÍCH TIẾNG VIỆT (MINI PARSER)
async function aiParseTask(input) {
    const status = document.getElementById('ai-status');
    status.innerText = "🤖 AI đang phân tích dữ liệu...";
    
    // Giả lập xử lý AI (Trong thực tế ông sẽ gọi Gemini API ở đây)
    // Regex đơn giản để bắt giờ và ngày
    const timeMatch = input.match(/(\d{1,2})[h:](\d{0,2})/);
    const dateMatch = input.match(/(\d{1,2})\/(\d{1,2})/);
    
    if (!timeMatch || !dateMatch) {
        alert("AI nhắc: Bạn thiếu giờ hoặc ngày rồi (VD: 14:00 01/01)");
        return null;
    }

    const hour = parseInt(timeMatch[1]);
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    const taskName = input.replace(timeMatch[0], "").replace(dateMatch[0], "").trim();

    // Check trùng lịch
    const overlap = tasks.find(t => t.day === day && t.month === month && t.hour === hour);
    if (overlap) {
        if (!confirm(`⚠️ Trùng lịch với việc: "${overlap.name}". Bạn có muốn thay thế không?`)) {
            return null;
        }
        tasks = tasks.filter(t => t !== overlap);
    }

    return { name: taskName, hour, day, month, color: `hsl(${Math.random() * 360}, 70%, 60%)` };
}

// 4. HIỂN THỊ LỊCH TRÌNH
function initDashboard() {
    renderWeekGrid();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(updateAIQuote, 600000); // 10 phút đổi câu hỏi thăm
}

function renderWeekGrid() {
    const grid = document.getElementById('week-grid-now');
    grid.innerHTML = '';
    const now = new Date();
    
    for(let i=0; i<7; i++) {
        const d = new Date();
        d.setDate(now.getDate() - now.getDay() + 1 + i); // Bắt đầu từ thứ 2
        
        const dayCol = document.createElement('div');
        dayCol.className = 'day-column';
        dayCol.innerHTML = `<div class="day-header">Thứ ${i+2}<br>${d.getDate()}/${d.getMonth()+1}</div>`;
        
        // Đổ công việc vào cột
        tasks.filter(t => t.day === d.getDate() && t.month === (d.getMonth()+1)).forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-item';
            el.style.backgroundColor = task.color;
            el.style.top = `${(task.hour * 30) + 50}px`; // Mỗi giờ 30px
            el.innerHTML = `<b>${task.hour}h:</b> ${task.name}`;
            
            // Click trái nổ pháo hoa
            el.onclick = (e) => triggerConfetti(e, task);
            
            // Click phải xóa
            el.oncontextmenu = (e) => {
                e.preventDefault();
                if(confirm("Xóa công việc này?")) {
                    tasks = tasks.filter(t => t !== task);
                    saveAndRender();
                }
            };
            
            dayCol.appendChild(el);
        });
        grid.appendChild(dayCol);
    }
}

function saveAndRender() {
    localStorage.setItem(`tasks_${currentID}`, JSON.stringify(tasks));
    renderWeekGrid();
}

// HIỆU ỨNG PHÁO HOA & AI GỢI Ý
function triggerConfetti(e, task) {
    document.getElementById('confetti-sound').play();
    const assistantText = document.getElementById('ai-quote');
    assistantText.innerText = `🤖 Đừng quên: "${task.name}" lúc ${task.hour}h nhé, tui sẽ luôn nhắc em! ❤️`;
    
    // Code hiệu ứng pháo hoa đơn giản tại vị trí click...
    console.log("Pháo hoa tại: ", e.clientX, e.clientY);
}

document.getElementById('add-task-btn').onclick = async () => {
    const input = document.getElementById('task-input').value;
    const taskData = await aiParseTask(input);
    if (taskData) {
        tasks.push(taskData);
        saveAndRender();
        document.getElementById('task-input').value = "";
    }
};

function updateClock() {
    const now = new Date();
    document.getElementById('real-time-clock').innerText = now.toLocaleString('vi-VN');
}