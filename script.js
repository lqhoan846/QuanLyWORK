// --- QUẢN LÝ DỮ LIỆU & AI LOGIC ---
let userData = {
    name: "",
    tasks: [] // {id, title, date, startTime, endTime, color}
};

const COLORS = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F3FFE3'];

// Khởi tạo trang
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadData(id);
        checkFirstTime();
    }
};

// Hàm giả lập AI hiểu tiếng Việt (NLP đơn giản)
async function parseTaskAI(input) {
    // Trong thực tế, đây sẽ là nơi gọi API Gemini/OpenAI
    // Ở đây mình tạo logic xử lý thông minh cho bạn
    const prompt = input.toLowerCase();
    
    // Ví dụ phân tích: "Mai 8h sáng đi học tới 10h"
    let date = new Date();
    if(prompt.includes("mai")) date.setDate(date.getDate() + 1);
    
    // Logic tìm giờ (RegEx)
    const timeMatch = prompt.match(/(\d{1,2})h/g);
    if (!timeMatch) return { error: "Cậu ơi, cho tui xin giờ giấc cụ thể với nha!" };

    return {
        title: input.split(' lúc')[0], // Tạm thời lấy phần trước chữ lúc
        date: date.toISOString().split('T')[0],
        startTime: timeMatch[0],
        endTime: timeMatch[1] || (parseInt(timeMatch[0]) + 1) + "h",
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
}

// Hàm thêm công việc
document.getElementById('btn-add-task').addEventListener('click', async () => {
    const input = document.getElementById('ai-task-input').value;
    if (!input) return;

    const result = await parseTaskAI(input);
    
    if (result.error) {
        showAIMessage(result.error);
        return;
    }

    // Kiểm tra trùng lịch
    const isOverlap = userData.tasks.find(t => t.date === result.date && t.startTime === result.startTime);
    if (isOverlap) {
        if (confirm(`Ê, định phân thân chi thuật à? Trùng lịch với việc "${isOverlap.title}" rồi! Thay thế luôn không?`)) {
            // Logic thay thế
        }
        return;
    }

    // Hiệu ứng pháo hoa khi thêm thành công
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    userData.tasks.push(result);
    saveData();
    renderCalendars();
    showAIMessage(`Tui đã thêm "${result.title}" vào lịch cho cậu rồi nhé!`);
});

// Hiển thị tin nhắn AI "Dễ thương"
function showAIMessage(msg) {
    const bubble = document.getElementById('ai-status-bubble');
    const text = document.getElementById('ai-message');
    bubble.classList.remove('hidden');
    text.innerText = `Tui: ${msg}`;
}

// Hiệu ứng Icon bay khi click vào task
function spawnIcons(e) {
    const icons = ['✨', '🌸', '🔥', '🎈', '⭐'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    for (let i = 0; i < 10; i++) {
        const span = document.createElement('span');
        span.innerText = icon;
        span.style.position = 'fixed';
        span.style.left = e.clientX + 'px';
        span.style.top = e.clientY + 'px';
        span.style.pointerEvents = 'none';
        span.style.fontSize = '20px';
        span.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${(Math.random()-0.5)*200}px, ${(Math.random()-0.5)*200}px) scale(0)`, opacity: 0 }
        ], { duration: 1000, easing: 'ease-out' });
        document.body.appendChild(span);
        setTimeout(() => span.remove(), 1000);
    }
}

// Quản lý ID độc nhất
document.getElementById('btn-create-space').onclick = () => {
    const uniqueID = 'space_' + Math.random().toString(36).substr(2, 9);
    const url = window.location.origin + window.location.pathname + '?id=' + uniqueID;
    
    document.getElementById('url-display-area').classList.remove('hidden');
    document.getElementById('exclusive-url').value = url;
};

// Ngữ pháp tiếng Anh bổ trợ cho bạn (TOEIC 800+ focus)
// Cấu trúc: Subject + Verb + Object + Adverbial of Time
// Ví dụ: I (S) will finish (V) the report (O) tomorrow (Time).
// Từ vựng: "Productivity" (Năng suất), "Reschedule" (Đổi lịch), "Conflict" (Xung đột/Trùng lịch).
