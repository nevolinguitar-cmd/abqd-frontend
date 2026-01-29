(() => {
  const API = "https://api.abqd.ru/api/v1";
  const TOKEN_KEY = "abqd_token";

  const mapPlan = (p) => {
    p = (p || "").toLowerCase();
    if (p === "starter") return "probn";     // если в HTML осталось starter — это Пробный
    if (p === "probn" || p === "pro" || p === "full" || p === "trial") return p;
    return p;
  };

  const token = () => localStorage.getItem(TOKEN_KEY) || "";
  const authed = () => !!token();

  const goAuth = (plan) => {
    const next = `/tariffs/?plan=${encodeURIComponent(plan)}`;
    location.href = `/auth/?mode=register&next=${encodeURIComponent(next)}`;
  };

  async function createPayment(plan){
    const return_url = `${location.origin}/tariffs/?plan=${encodeURIComponent(plan)}&paid=1`;
    const res = await fetch(`${API}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, return_url })
    });
    const text = await res.text();
    let j; try { j = JSON.parse(text); } catch { throw new Error(text.slice(0,200)); }
    if (!res.ok) throw new Error(j.detail || `HTTP ${res.status}`);
    return j;
  }

  async function pay(plan){
    plan = mapPlan(plan);

    // Trial = 0₽ => без ЮKassa (ЮKassa не принимает 0₽)
    if (plan === "trial"){
      if (!authed()) return goAuth("trial");
      location.href = "/dashboard/";
      return;
    }

    if (!authed()) return goAuth(plan);

    try{
      const btn = document.activeElement;
      if (btn && btn.tagName === "BUTTON") { btn.disabled = true; btn.dataset._txt = btn.textContent; btn.textContent = "Переходим к оплате…"; }

      const j = await createPayment(plan);
      if (!j.confirmation_url) throw new Error("Нет confirmation_url от ЮKassa");
      location.href = j.confirmation_url;

    }catch(e){
      alert("Ошибка оплаты: " + (e?.message || e));
      const btn = document.activeElement;
      if (btn && btn.tagName === "BUTTON" && btn.dataset._txt){ btn.disabled = false; btn.textContent = btn.dataset._txt; }
    }
  }

  const btnTrial = document.getElementById("btnStartTrial");
  if (btnTrial) btnTrial.addEventListener("click", () => pay("trial"));

  document.querySelectorAll(".btnChoosePlan").forEach(b => {
    b.addEventListener("click", () => pay(b.dataset.plan));
  });
})();
