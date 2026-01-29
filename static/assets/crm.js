(function(){
  const API = (window.ABQD_API_BASE || "https://api.abqd.ru");
  const app = document.getElementById("app");

  const isCEOPage = location.pathname.includes("/crm/ceo");

  const PLANS = ["none","trial","starter","pro","business","ceo"];
  const planRank = (p)=> Math.max(0, PLANS.indexOf((p||"none").toLowerCase()));
  const has = (me, needPlan)=> planRank(me.plan) >= planRank(needPlan) || (me.role === "ceo");

  const token = localStorage.getItem("abqd_token");
  if(!token){
    location.href="/auth/?next=" + encodeURIComponent(location.pathname + location.search);
    return;
  }

  const headers = { "authorization": "Bearer " + token };

  function esc(s){ return String(s||"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

  async function getMe(){
    const r = await fetch(API + "/api/v1/auth/me", { headers });
    if(!r.ok) throw new Error("auth");
    return r.json();
  }

  function render(me){
    if(isCEOPage && me.role !== "ceo"){
      location.href="/crm/";
      return;
    }

    const lockedPlugins = [
      {id:"ai_next_action", title:"AI-Next Action", need:"pro", tip:"Подсказывает следующий шаг по клиенту/сделке и ставит задачу автоматически."},
      {id:"ltv_radar", title:"LTV-радар", need:"business", tip:"Сегментация, прогноз повторных покупок, кто «остынет» в ближайшие 7–14 дней."},
      {id:"autofollow", title:"Авто-фоллоуап", need:"starter", tip:"Шаблоны сообщений + таймеры: не забыть дожать сделку/встречу."},
      {id:"ceo_dashboard", title:"CEO-дашборд", need:"ceo", tip:"Панель собственника: пользователи, планы, выручка, активность, конверсия."},
    ];

    app.innerHTML = `
      <div class="panel">
        <div class="phead">
          <div class="t">ABQD CRM</div>
          <div class="s">Пользователь: <b>${esc(me.email)}</b> • role=<b>${esc(me.role)}</b> • plan=<b>${esc(me.plan)}</b></div>
        </div>
        <div class="pbody">
          <div class="nav">
            <a href="/crm/"><span>CRM</span><span class="badge">основное</span></a>
            <a href="/constructor/"><span>Конструктор</span><span class="badge">профиль</span></a>
            <a href="/crm/ceo/" class="${me.role==='ceo'?'':'lock'}"><span>CEO кабинет</span><span class="badge">${me.role==='ceo'?'доступ':'закрыто'}</span></a>
          </div>
          <div style="height:12px"></div>
          <button class="btn" id="logoutBtn">Выйти</button>
          <div class="msg" style="margin-top:10px">Плагины видны всем, но работают только по тарифу — это нормально для продаж.</div>
        </div>
      </div>

      <div class="panel">
        <div class="phead">
          <div class="t">${isCEOPage ? "CEO дашборд (скелет)" : "Доска сделок (скелет)"}</div>
          <div class="s">Сейчас это каркас. Дальше подключим реальные данные из API.</div>
        </div>
        <div class="pbody">
          <div class="board">
            <div class="col"><div class="h">Новые</div>
              <div class="card" data-card="1">Лид: “Риелтор” → запрос визитки</div>
              <div class="card" data-card="2">Лид: “Музыкант” → хочет NFC-значок</div>
            </div>
            <div class="col"><div class="h">В работе</div>
              <div class="card" data-card="3">Сделка: “Партнёрство” → встреча</div>
            </div>
            <div class="col"><div class="h">Готово</div>
              <div class="card" data-card="4">Оплата: “Тариф старт” → активирован</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="phead">
          <div class="t">Плагины</div>
          <div class="s">Наведи — описание. Нажми — если нет доступа, покажем “замок”.</div>
        </div>
        <div class="pbody" id="plugins"></div>
      </div>
    `;

    document.getElementById("logoutBtn").onclick = ()=>{
      localStorage.removeItem("abqd_token");
      location.href="/auth/";
    };

    const box = document.getElementById("plugins");
    box.innerHTML = lockedPlugins.map(p=>{
      const ok = has(me, p.need);
      return `
        <div class="tip ${ok?'':'lock'}" data-tip="${esc(p.tip)}" style="padding:10px 12px;border:1px solid var(--br);border-radius:12px;margin-bottom:10px;cursor:pointer" data-id="${esc(p.id)}" data-ok="${ok?1:0}">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
            <div style="font-weight:800">${esc(p.title)}</div>
            <span class="badge">${ok ? "доступ" : ("нужен " + esc(p.need))}</span>
          </div>
          <div class="msg" style="margin-top:6px">${ok ? "Можно включить" : "Можно прочитать, но использовать нельзя"}</div>
        </div>
      `;
    }).join("");

    box.querySelectorAll("[data-id]").forEach(el=>{
      el.addEventListener("click", ()=>{
        const ok = el.getAttribute("data-ok")==="1";
        if(!ok){
          alert("Этот инструмент доступен в более высоком тарифе. Для интереса — описание видно по наведению.");
          return;
        }
        alert("OK. Дальше это подключим к реальному API и настройкам пользователя.");
      });
    });
  }

  (async ()=>{
    try{
      const me = await getMe();
      render(me);
    }catch(e){
      localStorage.removeItem("abqd_token");
      location.href="/auth/?err=auth";
    }
  })();
})();
