(() => {
  const API = "https://api.abqd.ru/api/v1";
  const ORIGIN = "https://app.abqd.ru";
  const TOKEN_KEY = "abqd_token";

  const mapPlan = (p) => {
    p = (p || "").toLowerCase();
    if (p === "starter") return "probn";
    if (["probn", "pro", "full", "trial"].includes(p)) return p;
    return p;
  };

  const token = () => localStorage.getItem(TOKEN_KEY) || "";
  const authed = () => !!token();
  const qs = () => new URLSearchParams(location.search);

  const setBtnBusy = (btn, text) => {
    if (!btn || btn.tagName !== "BUTTON") return;
    btn.disabled = true;
    btn.dataset._txt = btn.textContent;
    btn.textContent = text;
  };
  const restoreBtn = (btn) => {
    if (!btn || btn.tagName !== "BUTTON") return;
    if (btn.dataset._txt) btn.textContent = btn.dataset._txt;
    btn.disabled = false;
  };

  const goAuth = (nextUrl, mode = "register") => {
    location.href = `${ORIGIN}/auth/?mode=${encodeURIComponent(mode)}&next=${encodeURIComponent(nextUrl)}`;
  };

  async function createPayment(plan) {
    // максимально надежно: после оплаты вернуться на tariffs, а уже tariffs решит куда дальше
    const return_url = `${ORIGIN}/tariffs/?paid=1&plan=${encodeURIComponent(plan)}`;

    const headers = { "Content-Type": "application/json" };
    const t = token();
    if (t) headers["Authorization"] = `Bearer ${t}`;

    const res = await fetch(`${API}/payments/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({ plan, return_url }),
    });

    const text = await res.text();
    let j;
    try { j = JSON.parse(text); } catch { j = { detail: text.slice(0, 200) }; }

    if (!res.ok) {
      const err = new Error(j.detail || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = j;
      throw err;
    }
    return j;
  }

  function afterPaid(plan) {
    const nextCrm = `${ORIGIN}/dashboard/crm?paid=1&plan=${encodeURIComponent(plan)}`;
    if (authed()) location.replace(nextCrm);
    else goAuth(nextCrm, "login");
  }

  async function pay(plan) {
    plan = mapPlan(plan);

    // TRIAL -> constructor, no activation
    if (plan === "trial") {
      location.href = `${ORIGIN}/constructor/`;
      return;
    }

    // PAID -> YooKassa via API
    const btn = document.activeElement;
    try {
      setBtnBusy(btn, "Переходим к оплате…");
      const j = await createPayment(plan);
      if (!j.confirmation_url) throw new Error("No confirmation_url");
      location.href = j.confirmation_url;
    } catch (e) {
      // если API требует токен — попросим регистрацию и автозапустим оплату
      if (e && (e.status === 401 || e.status === 403)) {
        const back = `${ORIGIN}/tariffs/?plan=${encodeURIComponent(plan)}&autostart=1`;
        return goAuth(back, "register");
      }
      alert("Ошибка оплаты");
      restoreBtn(btn);
      console.error(e);
    }
  }

  // If returned from payment
  try {
    const paid = qs().get("paid") === "1";
    const plan = mapPlan(qs().get("plan"));
    if (paid && plan && plan !== "trial") {
      afterPaid(plan);
      return;
    }
  } catch (e) {}

  // Autostart after auth: /tariffs/?plan=pro&autostart=1
  try {
    const plan = mapPlan(qs().get("plan"));
    const autostart = qs().get("autostart") === "1";
    if (autostart && plan) {
      const u = new URL(location.href);
      u.searchParams.delete("autostart");
      history.replaceState(null, "", u.toString());
      pay(plan);
    }
  } catch (e) {}

  // Bind buttons
  const btnTrial = document.getElementById("btnStartTrial");
  if (btnTrial) btnTrial.addEventListener("click", () => pay("trial"));

  document.querySelectorAll(".btnChoosePlan").forEach((b) => {
    b.addEventListener("click", () => pay(b.dataset.plan));
  });
})();
