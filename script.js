// --- DATABASE & STATE ---
let db = {
    userName: "",
    tasks: [], // {id, title, start, end, date, color}
    isNewUser: true
};

const COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'];
const EMOJIS = ['⭐', '🔥', '✨', '💎', '🌈', '🍀', '🍎', '🎁', '🚀', '🎨'];

// --- INITIALIZATION ---
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const spaceId = urlParams.get('id');

    if (spaceId) {
        loadData(spaceId);
        showScreen('dashboard-page');
        checkFirstTime();
    } else {
        showScreen('landing-page');
    }
    
    startAiTimer();
    renderCalendars();
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// --- LINK GENERATION ---
document.getElementById('btn-create-space').onclick = () => {
    const newId = 'user_' + Math.random().toString(36).substr(2, 9);
    const link = window.location.origin + window.location.pathname + '?id=' + newId;
    
    document.getElementById('exclusive-link').value = link;
    document.getElementById('link-output-area').classList.remove('hidden');
    document.getElementById('btn-create-space').classList.add('hidden');
};

document.getElementById('btn-copy').onclick = () => {
    const el = document.getElementById('exclusive-link');
    el.select();
    document.execCommand('copy');
    alert("Đã sao chép link độc quyền của cậu!");
};

// --- DATA PERSISTENCE ---
function saveData() {
    const spaceId = new URLSearchParams(window.location.search).get('id');
    localStorage.setItem(spaceId, JSON.stringify(db));
}

function loadData(id) {
    const data = localStorage.getItem(id);
    if (data) {
        db = JSON.parse(data);
        db.isNewUser = false;
    }
}

// --- AI LOGIC (PARSING) ---
async function processAIInput() {
    const input = document.getElementById('ai-task-input').value;
    if (!input) return;

    updateAiSpeech("Đang phân tích dữ liệu giúp cậu nè...");

    // Giả lập xử lý AI (Trong thực tế bạn sẽ gọi API Gemini ở đây)
    // Phân tích cơ bản: "Học bài 8h-10h ngày 20/10"
    const timeRegex = /(\d{1,2})h/g;
    const dateRegex = /(\d{1,2})\/(\d{1,2})/;
    
    const times = input.match(timeRegex);
    const dateMatch = input.match(dateRegex);

    if (!times || !dateMatch) {
        updateAiSpeech("Cậu ơi, thiếu giờ giấc hoặc ngày tháng mất rồi. Nhập lại chính xác tui mới thêm được nha!");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: input.split(' ')[0] + " (AI Tóm tắt)",
        start: parseInt(times[0]),
        end: times[1] ? parseInt(times[1]) : parseInt(times[0]) + 1,
        date: `${dateMatch[1]}/${dateMatch[2]}/2025`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };

    // Kiểm tra trùng
    const conflict = db.tasks.find(t => t.date === newTask.date && t.start === newTask.start);
    if (conflict) {
        updateAiSpeech(`Ê, định phân thân chi thuật à? Trùng lịch với việc "${conflict.title}" rồi!`);
        return;
    }

    db.tasks.push(newTask);
    saveData();
    renderCalendars();
    triggerFireworks();
    document.getElementById('ai-task-input').value = "";
    updateAiSpeech("Xong rồi nhé! Tui đã điền vào lịch cho cậu.");
}

document.getElementById('btn-add-task').onclick = processAIInput;

// --- RENDER CALENDAR ---
function renderCalendars() {
    const grids = ['this-week-grid', 'next-week-grid'];
    grids.forEach(gridId => {
        const container = document.getElementById(gridId);
        container.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const col = document.createElement('div');
            col.className = 'day-column';
            col.innerHTML = `
                <div class="day-header">
                    Thứ ${i + 2 === 8 ? 'CN' : i + 2}
                    <br><small>(20/10/2025)</small>
                </div>
                <div class="day-content" id="${gridId}-day-${i}"></div>
            `;
            container.appendChild(col);
        }
    });

    // Render tasks
    db.tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-item';
        taskEl.style.backgroundColor = task.color;
        taskEl.style.top = (task.start * 15) + "px";
        taskEl.style.height = ((task.end - task.start) * 15) + "px";
        taskEl.innerHTML = `<b>${task.start}h: ${task.title}</b>`;
        
        taskEl.onclick = (e) => spawnIcons(e);
        taskEl.oncontextmenu = (e) => {
            e.preventDefault();
            if(confirm("Tui xóa công việc này nhé?")) {
                deleteTask(task.id);
            }
        };

        const target = document.getElementById(`this-week-grid-day-0`); // Demo add to Mon
        if(target) target.appendChild(taskEl);
    });
}

// --- EFFECTS ---
function triggerFireworks() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
}

function spawnIcons(e) {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    for(let i=0; i<5; i++) {
        const span = document.createElement('span');
        span.className = 'floating-icon';
        span.innerText = emoji;
        span.style.left = e.clientX + 'px';
        span.style.top = e.clientY + 'px';
        span.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
        span.style.setProperty('--ty', -Math.random() * 200 + 'px');
        document.body.appendChild(span);
        setTimeout(() => span.remove(), 1000);
    }
}

function updateAiSpeech(msg) {
    const bubble = document.getElementById('ai-speech');
    bubble.innerText = msg.replace("(Tên)", db.userName || "cậu");
}

function startAiTimer() {
    setInterval(() => {
        const quotes = [
            "Cố lên (Tên) ơi, sắp xong việc rồi nè!",
            "Uống miếng nước cho tỉnh táo rồi làm tiếp nha (Tên).",
            "Tui vẫn luôn theo dõi và ủng hộ cậu đó!"
        ];
        updateAiSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 600000); // 10 mins
}

// --- GREETING LOGIC ---
function checkFirstTime() {
    if (db.isNewUser) {
        document.getElementById('name-overlay').classList.remove('hidden');
    }
}

document.getElementById('btn-start').onclick = () => {
    const name = document.getElementById('user-name-input').value;
    if (name) {
        db.userName = name;
        db.isNewUser = false;
        saveData();
        document.getElementById('name-overlay').classList.add('hidden');
        updateAiSpeech(`Chào (Tên)! Rất vui được đồng hành cùng cậu.`);
    }
};

// Help Modal
document.getElementById('btn-help').onclick = () => document.getElementById('help-overlay').classList.remove('hidden');
document.getElementById('btn-close-help').onclick = () => document.getElementById('help-overlay').classList.add('hidden');

function deleteTask(id) {
    db.tasks = db.tasks.filter(t => t.id !== id);
    saveData();
    renderCalendars();
}
