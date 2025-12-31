// ===== TIỆN ÍCH =====
function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  );
}

function qs(id) {
  return document.getElementById(id);
}

// ===== KIỂM TRA LINK =====
const params = new URLSearchParams(window.location.search);
const workspaceId = params.get("id");

// ===== PHẦN TẠO LINK =====
if (!workspaceId) {
  qs("btnCreate").onclick = () => {
    const id = generateId();
    const link =
      location.origin +
      location.pathname +
      "?id=" +
      id;

    qs("privateLink").value = link;
    qs("btnOpen").href = link;
    qs("linkBox").classList.remove("hidden");
  };

  qs("btnCopy").onclick = () => {
    qs("privateLink").select();
    document.execCommand("copy");
    alert("Đã sao chép link!");
  };
}

// ===== PHẦN WORKSPACE =====
if (workspaceId) {
  qs("homePage").classList.add("hidden");
  qs("workspacePage").classList.remove("hidden");
  qs("workspaceId").textContent = "ID: " + workspaceId;

  const STORAGE_KEY = "tasks_" + workspaceId;
  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  function render() {
    const list = qs("taskList");
    list.innerHTML = "";
    tasks.forEach((t, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${t}</span>
        <button data-i="${i}">X</button>
      `;
      list.appendChild(li);
    });
  }

  qs("addTask").onclick = () => {
    const text = qs("taskText").value.trim();
    if (!text) return;
    tasks.push(text);
    qs("taskText").value = "";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    render();
  };

  qs("taskList").onclick = (e) => {
    if (e.target.tagName === "BUTTON") {
      tasks.splice(e.target.dataset.i, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      render();
    }
  };

  render();
}
