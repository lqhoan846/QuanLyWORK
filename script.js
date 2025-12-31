/* ========================
   PHÂN TÍCH URL
======================== */
const params = new URLSearchParams(window.location.search);
const spaceId = params.get("id");

/* ========================
   ELEMENTS
======================== */
const landing = document.getElementById("landing");
const workspace = document.getElementById("workspace");

const btnCreate = document.getElementById("btnCreate");
const linkContainer = document.getElementById("linkContainer");
const linkInput = document.getElementById("linkInput");
const btnCopy = document.getElementById("btnCopy");
const btnOpen = document.getElementById("btnOpen");

/* ========================
   TRANG ĐẠI TRÀ
======================== */
if (!spaceId) {
  btnCreate.onclick = () => {
    const uid = crypto.randomUUID();

    const link =
      window.location.origin +
      window.location.pathname +
      "?id=" +
      uid;

    linkInput.value = link;
    btnOpen.href = link;

    linkContainer.style.display = "block";
  };

  btnCopy.onclick = () => {
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(linkInput.value);
    btnCopy.innerText = "Đã sao chép";
    setTimeout(() => (btnCopy.innerText = "Sao chép"), 1500);
  };
}

/* ========================
   WORKSPACE RIÊNG
======================== */
if (spaceId) {
  landing.style.display = "none";
  workspace.style.display = "block";

  const taskText = document.getElementById("taskText");
  const addTask = document.getElementById("addTask");
  const taskList = document.getElementById("taskList");

  const STORAGE_KEY = "WORKSPACE_" + spaceId;
  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  function render() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.textContent = task;
      li.onclick = () => {
        tasks.splice(index, 1);
        save();
      };
      taskList.appendChild(li);
    });
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    render();
  }

  addTask.onclick = () => {
    if (taskText.value.trim()) {
      tasks.push(taskText.value.trim());
      taskText.value = "";
      save();
    }
  };

  render();
}
