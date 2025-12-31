// --- CẤU HÌNH DỮ LIỆU ---
let currentUser = { name: "", id: "" };
let tasks = []; // Lưu trữ công việc
const icons = ["✨", "🔥", "🌈", "🌸", "⭐", "🍀", "🎈", "🎉", "🦄", "💎"];

// --- KHỞI TẠO HỆ THỐNG ---
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const spaceId = urlParams.get('space');

    if (spaceId) {
        currentUser.id = spaceId;
        loadData();
        showPage('dashboard-page');
        checkFirstTime();
    } else {
        showPage('landing-page');
    }
    updateRealTime();
    setInterval(updateRealTime, 60000);
    setInterval(aiRandomChat, 600000); // 10 phút chat 1 lần
};

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    target.style.display = 'flex';
    target.classList.add('active');
    if(pageId === 'dashboard-page') renderCalendar();
}

// --- LOGIC TẠO LINK ĐỘC QUYỀN ---
function generateUniqueSpace() {
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    const link = window.location.origin + window.location.pathname + '?space=' + id;
    document.getElementById('generated-link').value = link;
    
    // Rung nhẹ khi tạo xong
    if (navigator.vibrate) navigator.vibrate(50);
}

function copyLink() {
    const copyText = document.getElementById("generated-link");
    copyText.select();
    document.execCommand("copy");
    alert("Đã sao chép link độc quyền! Hãy lưu lại để sử dụng vĩnh viễn nhé.");
}

// --- LOGIC AI PHÂN TÍCH (SMART PARSING) ---
function processAITask() {
    const input = document.getElementById('ai-task-input').value.trim();
    if (!input) return;

    // AI Logic: Tách thông tin từ câu nói
    // Ví dụ: "Đi tập gym 17h-19h chiều mai"
    const analyzed = mockAIAnalyze(input);

    if (analyzed.error) {
        updateAIChat(analyzed.error);
        return;
    }

    // Kiểm tra trùng lịch
    const isOverlap = checkOverlap(analyzed);
    if (isOverlap) {
        if (confirm(`Ê, định phân thân chi thuật à? Trùng lịch với việc "${isOverlap.title}" rồi! Thay thế luôn không?`)) {
            tasks = tasks.filter(t => t.id !== isOverlap.id);
        } else {
            return;
        }
    }

    // Thêm công việc
    const newTask = {
        id: Date.now(),
        ...analyzed,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
    };

    tasks.push(newTask);
    saveData();
    renderCalendar();
    triggerCelebration();
    document.getElementById('ai-task-input').value = "";
    updateAIChat(`Xong rồi nhé ${currentUser.name}! Tui đã thêm "${analyzed.title}" vào lịch của cậu.`);
}

function mockAIAnalyze(text) {
    // Đây là nơi xử lý Logic Tiếng Việt (Viết tắt, thời gian)
    // Phác thảo nhanh bộ lọc:
    let title = text.split('lúc')[0].split('từ')[0].substring(0, 20);
    let hourStart = text.match(/(\d{1,2})h/)?.[1] || 8;
    let day = new Date(); // Mặc định hôm nay
    
    if (text.includes("mai")) day.setDate(day.getDate() + 1);
    
    // Cảnh báo quá khứ/tương lai 4 tuần (Logic chặn)
    // ... logic kiểm tra date ...

    return {
        title: title.trim(),
        startTime: parseInt(hourStart),
        endTime: parseInt(hourStart) + 1,
        date: day.toISOString().split('T')[0]
    };
}

// --- HIỆU ỨNG TƯƠNG TÁC ---
function triggerCelebration() {
    // Hiệu ứng pháo hoa đơn giản bằng các hạt màu
    for (let i = 0; i < 20; i++) {
        createFlyingIcon(window.innerWidth / 2, window.innerHeight / 2);
    }
}

function createFlyingIcon(x, y) {
    const icon = document.createElement('div');
    icon.className = 'flying-icon';
    icon.innerText = icons[Math.floor(Math.random() * icons.length)];
    icon.style.left = x + 'px';
    icon.style.top = y + 'px';
    document.body.appendChild(icon);
    setTimeout(() => icon.remove(), 800);
}

// --- QUẢN LÝ DỮ LIỆU ---
function saveData() {
    localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(tasks));
    localStorage.setItem(`user_${currentUser.id}`, JSON.stringify(currentUser));
}

function loadData() {
    const savedTasks = localStorage.getItem(`tasks_${currentUser.id}`);
    const savedUser = localStorage.getItem(`user_${currentUser.id}`);
    if (savedTasks) tasks = JSON.parse(savedTasks);
    if (savedUser) currentUser = JSON.parse(savedUser);
}

// --- RENDER GIAO DIỆN ---
function renderCalendar() {
    const grid = document.getElementById('current-week-grid');
    grid.innerHTML = "";
    
    const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
    
    weekdays.forEach((day, index) => {
        const col = document.createElement('div');
        col.className = 'day-column';
        col.innerHTML = `<div class="day-header"><strong>${day}</strong><span>(12/10)</span></div>`;
        
        // Render task của ngày này
        const dayTasks = tasks.filter(t => true); // Logic lọc theo ngày thực tế
        dayTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.style.backgroundColor = task.color;
            card.innerHTML = `<b>${task.startTime}h:</b> ${task.title}`;
            card.onclick = (e) => {
                createFlyingIcon(e.clientX, e.clientY);
                updateAIChat(`Cố gắng hoàn thành ${task.title} nhé ${currentUser.name}!`);
            };
            card.oncontextmenu = (e) => {
                e.preventDefault();
                if(confirm("Tui xóa công việc này nhé?")) {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveData(); renderCalendar();
                }
            };
            col.appendChild(card);
        });
        
        grid.appendChild(col);
    });
}

// --- CHỨC NĂNG PHỤ ---
function saveUserName() {
    const name = document.getElementById('user-name-input').value;
    if (name) {
        currentUser.name = name;
        saveData();
        toggleModal('welcome-modal');
        updateAIChat(`Rất vui được gặp cậu, ${name}! Tụi mình cùng bắt đầu làm việc nhé.`);
    }
}

function updateAIChat(msg) {
    const bubble = document.querySelector('.ai-bubble');
    bubble.innerText = msg;
    bubble.parentElement.classList.add('pulse');
    setTimeout(() => bubble.parentElement.classList.remove('pulse'), 500);
}

function toggleModal(id) {
    const m = document.getElementById(id);
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
}

function checkFirstTime() {
    if (!currentUser.name) toggleModal('welcome-modal');
}
