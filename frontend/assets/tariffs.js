(() => {
  const API = "https://api.abqd.ru/api/v1";
  const APP_ORIGIN = "https://app.abqd.ru";
  const CABINET_ORIGIN = "https://app.abqd.ru"; // фиксируем один домен для localStorage
  const TOKEN_KEY = "abqd_token";

  const mapPlan = (p) => {
    p = (p || "").toLowerCase();
    if (p === "starter") return "probn";
    if (["probn","pro","full","trial"].includes(p)) return p;
    return p;
  };

  const token = () => localStorage.getItem(TOKEN_KEY) || "";
  const authed = () => !!token();
  const qs = () => new URLSearchParams(location.search);

  const goAuth = (plan) => {
    const next = `${CABINET_ORIGIN}/tariffs/?plan=${encodeURIComponent(plan)}&autostart=1`;
    location.href = `${CABINET_ORIGIN}/auth/?mode=register&next=${encodeURIComponent(next)}`;
  };

  async function createPayment(plan){
    const return_url = `${CABINET_ORIGIN}/tariffs/?plan=${encodeURIComponent(plan)}&paid=1`;
    const headers = { "Content-Type": "application/json" };
    const t = token();
    if (t) headers["Authorization"] = `Bearer ${t}`; // если токен есть — прикладываем
    const res = await fetch(`${API}/payments/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ plan, return_url })
    });
    const text = await res.text();
    let j; try { j = JSON.parse(text); } catch { throw new Error(text.slice(0,200)); }
    if (!res.ok) throw new Error(j.detail || `HTTP ${res.status}`);
    return j;
  }

  async function activateTrial(){
    const t = token();
    if (!t) throw new Error("Нет токена");
    const res = await fetch(`${API}/trial/activate`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${t}`, "Content-Type": "application/json" },
      body: "{}"
    });
    const text = await res.text();
    let j; try { j = JSON.parse(text); } catch { j = { detail: text.slice(0,200) }; }
    if (!res.ok) throw new Error(j.detail || `HTTP ${res.status}`);
    return j;
  }

  async function pay(plan){
    plan = mapPlan(plan);

    // TRIAL: нужен аккаунт → активируем trial → constructor
    if (plan === "trial"){
      if (!authed()) return goAuth("trial");
      try{
        const btn = document.activeElement;
        if (btn && btn.tagName === "BUTTON") {
          btn.disabled = true;
          btn.dataset._txt = btn.textContent;
          btn.textContent = "Активируем Trial…";
        }

  // --- ABQD_TRIAL_AUTOSTART_V1 ---
  (function(){
    try{
      const q = new URLSearchParams(location.search);
      const planQ = (q.get("plan") || "").toLowerCase();
      const auto = (q.get("autostart") || "") === "1";
      if (planQ === "trial" && auto){
        // запускаем один раз, чтобы "назад" не крутило
        q.delete("autostart");
        history.replaceState({}, "", location.pathname + (q.toString() ? ("?"+q.toString()) : ""));
        setTimeout(()=>pay("trial"), 50);
      }
    }catch(e){}
  })();
        await activateTrial();
        location.href = `${CABINET_ORIGIN}/constructor/`;
      }catch(e){
        alert("Ошибка Trial: " + (e?.message || e));
        const btn = document.activeElement;
        if (btn && btn.tagName === "BUTTON" && btn.dataset._txt){
          btn.disabled = false;
          btn.textContent = btn.dataset._txt;
        }
      }
      return;
    }

    // PAID: сразу в ЮKassa (без обязательного логина)
    try{
      const btn = document.activeElement;
      if (btn && btn.tagName === "BUTTON") {
        btn.disabled = true;
        btn.dataset._txt = btn.textContent;
        btn.textContent = "Переходим к оплате…";
      }

      const j = await createPayment(plan);
      if (!j.confirmation_url) throw new Error("Нет confirmation_url от ЮKassa");
      location.href = j.confirmation_url;

    }catch(e){
      alert("Ошибка оплаты: " + (e?.message || e));
      const btn = document.activeElement;
      if (btn && btn.tagName === "BUTTON" && btn.dataset._txt){
        btn.disabled = false;
        btn.textContent = btn.dataset._txt;
      }
    }
  }

  // Авто-старт Trial после логина: /tariffs/?plan=trial&autostart=1
  try{
    const p = mapPlan(qs().get("plan"));
    const autostart = qs().get("autostart") === "1";
    if (autostart && p === "trial" && authed()){
      const u = new URL(location.href);
      u.searchParams.delete("autostart");
      history.replaceState(null, "", u.toString());
      pay("trial");
    }
  }catch(e){}

  const btnTrial = document.getElementById("btnStartTrial");
  if (btnTrial) btnTrial.addEventListener("click", (e) => { e.preventDefault(); pay("trial"); });
document.querySelectorAll(".btnChoosePlan").forEach(b => {
    b.addEventListener("click", (e) => { e.preventDefault(); pay(b.dataset.plan); });
});
})();
