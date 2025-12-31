const qs = new URLSearchParams(location.search);
const id = qs.get("id");

const landing = document.getElementById("landing");
const workspace = document.getElementById("workspace");

if (!id) {
  // ===== LANDING =====
  document.getElementById("createLink").onclick = () => {
    const uid = crypto.randomUUID();
    const link = location.origin + location.pathname + "?id=" + uid;
    document.getElementById("privateLink").value = link;
    document.getElementById("linkBox").classList.remove("hidden");
  };

  document.getElementById("copyLink").onclick = () => {
    privateLink.select();
    document.execCommand("copy");
    alert("Đã sao chép link riêng");
  };
} else {
  // ===== WORKSPACE =====
  landing.classList.add("hidden");
  workspace.classList.remove("hidden");

  const storeKey = "QLCV_" + id;
  const data = JSON.parse(localStorage.getItem(storeKey) || "{}");

  // LẦN ĐẦU
  if (!data.name) {
    document.getElementById("welcomeModal").classList.remove("hidden");
    document.getElementById("startBtn").onclick = () => {
      data.name = userNameInput.value || "bạn";
      save();
      welcomeModal.classList.add("hidden");
      hello();
    };
  } else {
    hello();
  }

  function hello() {
    document.getElementById("helloText").innerText =
      `Chào ${data.name}, hôm nay mình làm gì nè?`;
  }

  function save() {
    localStorage.setItem(storeKey, JSON.stringify(data));
  }

  // LỊCH
  function renderWeek(el, offset = 0) {
    el.innerHTML = "";
    const base = new Date();
    base.setDate(base.getDate() + offset * 7);
    const monday = new Date(base);
    monday.setDate(base.getDate() - (base.getDay() + 6) % 7);

    const days = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ Nhật"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const key = d.toDateString();
      const tasks = data[key] || [];

      const div = document.createElement("div");
      div.className = "day";

      div.innerHTML = `
        <b>${days[i]}</b>
        <div>${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}</div>
        <div class="lunar">Âm: ${(d.getDate()+1)%30}/${(d.getMonth()+1)%12}</div>
      `;

      tasks.forEach(t => {
        const task = document.createElement("div");
        task.className = "task";
        task.style.background = t.color;
        task.innerText = `${t.start}-${t.end} ${t.title}`;
        div.appendChild(task);
      });

      el.appendChild(div);
    }
  }

  renderWeek(currentWeek, 0);
  renderWeek(nextWeek, 1);

  // AI GIẢ LẬP PARSING
  document.getElementById("addTask").onclick = () => {
    const text = aiInput.value;
    if (!text.match(/\d{1,2}h/)) {
      aiMessage.innerText = `Tui chưa thấy giờ nè ${data.name} ơi 🥺`;
      return;
    }

    const today = new Date().toDateString();
    data[today] ||= [];
    data[today].push({
      title: text.slice(0, 20),
      start: "09:00",
      end: "10:00",
      color: `hsl(${Math.random()*360},70%,60%)`
    });

    save();
    renderWeek(currentWeek, 0);
    aiMessage.innerText = `Ok nè ${data.name} 💪 tui đã thêm công việc rồi`;
  };
}
