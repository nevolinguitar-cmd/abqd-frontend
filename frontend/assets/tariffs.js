(() => {
  const CABINET_ORIGIN = "https://app.abqd.ru";
  if (location.origin !== CABINET_ORIGIN) {
    location.href = CABINET_ORIGIN + location.pathname + location.search + location.hash;
    return;
  }

  const API = "https://api.abqd.ru/api/v1";
  const TOKEN_KEYS = ["abqd_token","token","access_token"];

  const token = () => {
    for (const k of TOKEN_KEYS) {
      const v = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (v) return v;
    }
    return "";
  };
  const authed = () => !!token();

  const mapPlan = (p) => {
    p = (p || "").toLowerCase();
    if (p === "starter") return "probn"; // совместимость со старым HTML
    if (p === "probn" || p === "pro" || p === "full" || p === "trial") return p;
    return p;
  };

  const goAuth = (plan) => {
    // safeNext() в auth принимает только относительный путь вида "/..."
    const next = `/tariffs/?plan=${encodeURIComponent(plan)}${plan === "trial" ? "&autostart=1" : ""}`;
    location.href = `/auth/?mode=register&next=${encodeURIComponent(next)}`;
  };

  async function fetchJson(url, opts){
    const res = await fetch(url, opts);
    const text = await res.text();
    let j;
    try { j = JSON.parse(text); } catch { j = { detail: text.slice(0, 200) }; }
    if (!res.ok) throw new Error(j.detail || `HTTP ${res.status}`);
    return j;
  }

  async function accessStatus(){
    return fetchJson(`${API}/access/status`, {
      method: "GET",
      headers: { "authorization": `Bearer ${token()}` }
    });
  }

  async function activateTrial(){
    return fetchJson(`${API}/trial/activate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${token()}`
      },
      body: "{}"
    });
  }

  async function ensureTrial(){
    // если уже есть доступ — просто пропускаем
    try{
      const st = await accessStatus();
      if (st && (st.trial_active || st.paid_active)) return st;
    }catch(e){}
    // иначе активируем trial
    return activateTrial();
  }

  async function createPayment(plan){
    const return_url = `${location.origin}/tariffs/?plan=${encodeURIComponent(plan)}&paid=1`;
    return fetchJson(`${API}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, return_url })
    });
  }

  async function pay(plan){
    plan = mapPlan(plan);

    // ---- TRIAL: активируем на API и только потом в конструктор ----
    if (plan === "trial"){
      if (!authed()) return goAuth("trial");
      if (window.__abqdTrialInFlight) return;
      window.__abqdTrialInFlight = true;

      const btn = document.activeElement;
      try{
        if (btn && btn.tagName === "BUTTON"){
          btn.disabled = true;
          btn.dataset._txt = btn.textContent;
          btn.textContent = "Активируем Trial…";
        }
        await ensureTrial();
        location.href = "/constructor/";
      }catch(e){
        window.__abqdTrialInFlight = false;
        alert("Trial не активировался: " + (e?.message || e));
        if (btn && btn.tagName === "BUTTON" && btn.dataset._txt){
          btn.disabled = false;
          btn.textContent = btn.dataset._txt;
        }
      }
      return;
    }

    // ---- PAID: ЮKassa ----
    if (!authed()) return goAuth(plan);

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
    const qp = new URLSearchParams(location.search);
    const planQ = (qp.get("plan") || "").toLowerCase();
    const auto = qp.get("autostart") === "1";
    if (auto && planQ === "trial" && authed()){
      qp.delete("autostart");
      const clean = `${location.pathname}${qp.toString() ? "?" + qp.toString() : ""}`;
      history.replaceState({}, "", clean);
      setTimeout(()=>pay("trial"), 50);
    }
  }catch(e){}

  const btnTrial = document.getElementById("btnStartTrial");
  if (btnTrial) btnTrial.addEventListener("click", (e) => { e.preventDefault(); pay("trial"); });

  document.querySelectorAll(".btnChoosePlan").forEach(b => {
    b.addEventListener("click", (e) => { e.preventDefault(); pay(b.dataset.plan); });
  });
})();
