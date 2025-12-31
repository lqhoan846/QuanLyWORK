/* ===== INIT ===== */
const qs = new URLSearchParams(location.search);
let spaceId = qs.get("id");

const landing = document.getElementById("landing");
const dashboard = document.getElementById("dashboard");

if (!spaceId) landing.classList.remove("hidden");
else init(spaceId);

document.getElementById("createSpace").onclick = () => {
  const id = crypto.randomUUID();
  location.search = "?id=" + id;
};

/* ===== DATA ===== */
function load() {
  return JSON.parse(localStorage.getItem("space_"+spaceId)) 
  || { name:null, tasks:[] };
}
function save(d) {
  localStorage.setItem("space_"+spaceId, JSON.stringify(d));
}

/* ===== INIT SPACE ===== */
function init(id){
  landing.classList.add("hidden");
  dashboard.classList.remove("hidden");
  const data = load();
  if(!data.name) askName(data);
  renderWeek(0,"calendarThisWeek");
  renderWeek(7,"calendarNextWeek");
  ai(`Chào ${data.name||"bạn"} nha 🌱`);
}

/* ===== AI PARSER ===== */
function parse(text){
  const time = text.match(/(\d{1,2})h\s*-\s*(\d{1,2})h/);
  const date = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(!time||!date) return null;
  return {
    title:text.replace(time[0],"").replace(date[0],"").trim(),
    start:+time[1],
    end:+time[2],
    date:`${date[3]}-${date[2]}-${date[1]}`
  };
}

/* ===== ADD TASK ===== */
document.getElementById("addTask").onclick=()=>{
  const input = taskInput.value;
  const p = parse(input);
  if(!p){ ai("Tui chưa hiểu rõ giờ hoặc ngày 😗"); return; }
  const d = load();
  d.tasks.push({...p,color:randColor()});
  save(d);
  renderWeek(0,"calendarThisWeek");
  ai("Xong rồi nè ✨");
};

/* ===== CALENDAR ===== */
function renderWeek(offset,target){
  const cal = document.getElementById(target);
  cal.innerHTML="";
  const start = startOfWeek(offset);

  for(let i=0;i<7;i++){
    const d = new Date(start);
    d.setDate(d.getDate()+i);
    cal.appendChild(dayHeader(d));
  }

  for(let h=0;h<24*7;h++) cal.appendChild(document.createElement("div"));

  const data = load();
  data.tasks.forEach(t=>{
    const td = new Date(t.date);
    if(td>=start && td<new Date(start.getTime()+7*864e5)){
      const day = (td.getDay()+6)%7;
      const pos = 7 + day + (t.start*7);
      const el = document.createElement("div");
      el.className="task";
      el.style.background=t.color;
      el.style.gridRow=`${t.start+2} / ${t.end+2}`;
      el.style.gridColumn=day+1;
      el.innerHTML=`<b>${t.start}h-${t.end}h</b><br>${t.title}`;
      cal.appendChild(el);
    }
  });
}

/* ===== DAY HEADER + LUNAR (MOCK) ===== */
function dayHeader(d){
  const div = document.createElement("div");
  div.className="day-header";
  div.innerHTML=`
    <div>Thứ ${d.getDay()==0?"CN":d.getDay()+1}</div>
    <div>(${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()})</div>
    <div class="lunar">(Âm ${d.getDate()}/${d.getMonth()+1})</div>
  `;
  return div;
}

/* ===== UTILS ===== */
function startOfWeek(offset){
  const d=new Date();
  d.setDate(d.getDate()+offset);
  const day=(d.getDay()+6)%7;
  d.setDate(d.getDate()-day);
  d.setHours(0,0,0,0);
  return d;
}
function randColor(){
  return `hsl(${Math.random()*360},70%,70%)`;
}
function ai(t){
  document.getElementById("aiMessage").innerText=t;
}

/* ===== NAME MODAL ===== */
function askName(d){
  show(`
    <h3>Xin chào bạn 🌸</h3>
    <p>Mình là hệ thống quản lý công việc thông minh được tạo bởi Lam Quoc Hoan.</p>
    <input id="n" placeholder="Tên của bạn"/>
    <button id="ok">BẮT ĐẦU</button>
  `);
  ok.onclick=()=>{
    d.name=n.value;
    save(d);
    close();
  }
}
function show(html){
  overlay.classList.remove("hidden");
  modal.innerHTML=html;
  modal.classList.remove("hidden");
}
function close(){
  overlay.classList.add("hidden");
  modal.classList.add("hidden");
}
