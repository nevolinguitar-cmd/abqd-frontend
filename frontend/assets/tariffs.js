(() => {
  const API = "https://api.abqd.ru/api/v1";
  const TOKEN_KEY = "abqd_token";
  const LAST_PAYMENT_KEY = "abqd_last_payment_id";
  const LAST_PLAN_KEY = "abqd_last_plan";

  const mapPlan = (p) => {
    p = (p || "").toLowerCase();
    if (p === "starter") return "probn"; // старое имя => Пробный
    if (p === "probn" || p === "pro" || p === "full" || p === "trial") return p;
    return p;
  };

  const token = () => localStorage.getItem(TOKEN_KEY) || "";
  const authed = () => !!token();

  const goAuth = (plan) => {
    // после регистрации возвращаем на тарифы с выбранным plan
    const next = `/tariffs/?plan=${encodeURIComponent(plan)}`;
    location.href = `/auth/?mode=register&next=${encodeURIComponent(next)}`;
  };

  async function apiPost(path, body) {
    const headers = { "Content-Type": "application/json" };
    const t = token();
    if (t) headers["Authorization"] = `Bearer ${t}`;

    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body || {})
    });

    const text = await res.text();
    let j;
    try { j = text ? JSON.parse(text) : {}; } catch { throw new Error(text.slice(0, 200)); }
    if (!res.ok) throw new Error(j.detail || `HTTP ${res.status}`);
    return j;
  }

  async function activateTrial() {
    try { await apiPost("/trial/activate", {}); } catch (_) {}
  }

  async function createPayment(plan) {
    // ВАЖНО: не доверяем paid=1 как “оплачено”. Это просто триггер на проверку payment_id.
    const return_url = `${location.origin}/tariffs/?paid=1`;
    return apiPost("/payments/create", { plan, return_url });
  }

  async function checkPayment(payment_id) {
    return apiPost("/payments/check", { payment_id });
  }

  async function pay(plan) {
    plan = mapPlan(plan);

    // Trial: 7 дней => активируем на API и ведём в конструктор
    if (plan === "trial") {
      if (!authed()) return goAuth("trial");
      await activateTrial();
      location.href = "/constructor/";
      return;
    }

    // Paid: только через ЮKassa
    if (!authed()) return goAuth(plan);

    try {
      const btn = document.activeElement;
      if (btn && btn.tagName === "BUTTON") {
        btn.disabled = true;
        btn.dataset._txt = btn.textContent;
        btn.textContent = "Переходим к оплате…";
      }

      const j = await createPayment(plan);
      if (!j.confirmation_url) throw new Error("Нет confirmation_url от ЮKassa");

      // Ключевой момент: сохраняем payment_id ДО редиректа
      if (j.payment_id) localStorage.setItem(LAST_PAYMENT_KEY, j.payment_id);
      localStorage.setItem(LAST_PLAN_KEY, plan);

      location.href = j.confirmation_url;

    } catch (e) {
      alert("Ошибка оплаты: " + (e?.message || e));
      const btn = document.activeElement;
      if (btn && btn.tagName === "BUTTON" && btn.dataset._txt) {
        btn.disabled = false;
        btn.textContent = btn.dataset._txt;
      }
    }
  }

  // Если вернулись на /tariffs/?paid=1 — проверяем payment_id через API
  async function maybeFinalizePayment() {
    const qs = new URLSearchParams(location.search);
    if (qs.get("paid") !== "1") return;
    if (!authed()) return;

    const pid = localStorage.getItem(LAST_PAYMENT_KEY) || "";
    if (!pid) return;

    try {
      const j = await checkPayment(pid);
      if (j.status === "succeeded") {
        localStorage.removeItem(LAST_PAYMENT_KEY);
        // дальше ведём в конструктор
        location.href = "/constructor/";
      } else {
        // pending/canceled => просто оставляем на странице тарифов
        console.log("Payment status:", j.status);
      }
    } catch (e) {
      console.warn("Payment check error:", e);
    }
  }

  maybeFinalizePayment();

  const btnTrial = document.getElementById("btnStartTrial");
  if (btnTrial) btnTrial.addEventListener("click", () => pay("trial"));

  document.querySelectorAll(".btnChoosePlan").forEach(b => {
    b.addEventListener("click", () => pay(b.dataset.plan));
  });
})();
