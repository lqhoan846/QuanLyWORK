const params = new URLSearchParams(location.search);
const spaceId = params.get("id");

const landing = document.getElementById("landing");
const workspace = document.getElementById("workspace");

/* =========================
   TRANG ĐẠI TRÀ
========================= */
const createBtn = document.getElementById("createLink");
const linkBox = document.getElementById("linkBox");
const privateLink = document.getElementById("privateLink");
const copyBtn = document.getElementById("copyBtn");
const openLink = document.getElementById("openLink");

if (!spaceId) {
  createBtn.onclick = () => {
    const uid = crypto.randomUUID();
    const link = `${location.origin}${location.pathname}?id=${uid}`;

    privateLink.value = link;
    openLink.href = link;
    linkBox.classList.remove("hidden");
  };

  copyBtn.onclick = () => {
    privateLink.select();
    document.execCommand("copy");
    alert("Đã sao chép link!");
  };
}

/* =========================
   TRANG RIÊNG
========================= */
if (spaceId) {
  landing.classList.add("hidden");
  workspace.classList.remove("hidden");

  const taskInput = document.getElementById("taskInput");
  const addTask = document.getElementById("addTask");
  const taskList = document.getElementById("taskList");

  const storageKey = "tasks_" + spaceId;
  const tasks = JSON.parse(localStorage.getItem(storageKey)) || [];

  const render = () => {
    taskList.innerHTML = "";
    tasks.forEach((t, i) => {
      const li = document.createElement("li");
      li.textContent = t;
      li.onclick = () => {
        tasks.splice(i, 1);
        save();
      };
      taskList.appendChild(li);
    });
  };

  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    render();
  };

  addTask.onclick = () => {
    if (taskInput.value.trim()) {
      tasks.push(taskInput.value.trim());
      taskInput.value = "";
      save();
    }
  };

  render();
}
