document.addEventListener("DOMContentLoaded", () => {

  const qs = new URLSearchParams(window.location.search);
  let spaceId = qs.get("id");

  const landing = document.getElementById("landing");
  const dashboard = document.getElementById("dashboard");

  const createBtn = document.getElementById("createSpace");
  const addBtn = document.getElementById("addTask");
  const input = document.getElementById("taskInput");

  /* ===== START ===== */
  if (!spaceId) {
    landing.classList.remove("hidden");
  } else {
    initSpace(spaceId);
  }

  createBtn.onclick = () => {
    const id = "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
    window.location.href = "?id=" + id;
  };

  /* ===== DATA ===== */
  function loadData() {
    return JSON.parse(localStorage.getItem(spaceId)) || {
      name: null,
      tasks: []
    };
  }

  function saveData(data) {
    localStorage.setItem(spaceId, JSON.stringify(data));
  }

  /* ===== INIT ===== */
  function initSpace(id) {
    landing.classList.add("hidden");
    dashboard.classList.remove("hidden");

    const data = loadData();
    if (!data.name) askName(data);

    renderWeek(0, "calendarThisWeek");
    renderWeek(7, "calendarNextWeek");

    aiSay(`Chào ${data.name || "bạn"} nha 🌱`);
  }

  /* ===== PARSER ===== */
  function parseTask(text) {
    const time = text.match(/(\d{1,2})h\s*-\s*(\d{1,2})h/);
    const date = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!time || !date) return null;

    return {
      title: text.replace(time[0], "").replace(date[0], "").trim(),
      start: Number(time[1]),
      end: Number(time[2]),
      date: `${date[3]}-${date[2]}-${date[1]}`,
      color: randomColor()
    };
  }

  /* ===== ADD TASK ===== */
  addBtn.onclick = () => {
    const parsed = parseTask(input.value);
    if (!parsed) {
      aiSay("Tui chưa hiểu rõ giờ giấc hay ngày tháng 😗");
      return;
    }
    const data = loadData();
    data.tasks.push(parsed);
    saveData(data);

    renderWeek(0, "calendarThisWeek");
    aiSay("Thêm xong rồi nè ✨");
    input.value = "";
  };

  /* ===== RENDER ===== */
  function renderWeek(offset, targetId) {
    const cal = document.getElementById(targetId);
    cal.innerHTML = "";

    const start = startOfWeek(offset);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      cal.appendChild(dayHeader(d));
    }

    for (let i = 0; i < 24 * 7; i++) {
      cal.appendChild(document.createElement("div"));
    }

    const data = loadData();
    data.tasks.forEach(t => {
      const taskDate = new Date(t.date);
      if (taskDate >= start && taskDate < new Date(start.getTime() + 7 * 86400000)) {
        const dayIndex = (taskDate.getDay() + 6) % 7;
        const el = document.createElement("div");
        el.className = "task";
        el.style.background = t.color;
        el.style.gridColumn = dayIndex + 1;
        el.style.gridRow = `${t.start + 2} / ${t.end + 2}`;
        el.innerHTML = `<b>${t.start}h-${t.end}h</b><br>${t.title}`;
        cal.appendChild(el);
      }
    });
  }

  function dayHeader(d) {
    const div = document.createElement("div");
    div.className = "day-header";
    div.innerHTML = `
      <div>Thứ ${d.getDay() === 0 ? "CN" : d.getDay() + 1}</div>
      <div>(${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()})</div>
      <div class="lunar">(Âm ${d.getDate()}/${d.getMonth() + 1})</div>
    `;
    return div;
