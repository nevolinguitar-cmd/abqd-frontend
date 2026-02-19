/* ABQD_TARIFFS_PAYFLOW_v3 */
/* ABQD_TARIFFS_YOOKASSA_REDIRECT_v4 */
/* ABQD_STORE_LAST_PAYMENT_IDS_v3 */
(() => {
  "use strict";

  const API = "https://api.abqd.ru/api/v1";
  const ORIGIN = "https://app.abqd.ru";

  const TOKEN_KEY = "abqd_token";
  const KEY_O = "abqd_last_order_id";
  const KEY_P = "abqd_last_payment_id";
  const KEY_PLAN = "abqd_last_plan";

  const qs = () => new URLSearchParams(location.search);

  const safePath = (p) => {
    if (!p || typeof p !== "string") return "/dashboard/";
    if (!p.startsWith("/")) return "/dashboard/";
    if (p.startsWith("//")) return "/dashboard/";
    return p;
  };

  const mapPlan = (p) => {
    p = String(p || "").toLowerCase().trim();
    if (p === "starter") return "probn";
    if (p === "pro") return "pro";
    if (p === "full") return "full";
    if (p === "probn") return "probn";
    return p || "probn";
  };

  const token = () => localStorage.getItem(TOKEN_KEY) || "";

  const setBusy = (btn, text) => {
    if (!btn) return;
    btn.disabled = true;
    btn.dataset._abqdTxt = btn.textContent || "";
    if (text) btn.textContent = text;
  };

  const restoreBtn = (btn) => {
    if (!btn) return;
    btn.disabled = false;
    if (btn.dataset._abqdTxt) btn.textContent = btn.dataset._abqdTxt;
  };

  const go = (url) => { try { location.replace(url); } catch(e) { location.href = url; } };

  const goAuth = (nextPath, mode = "login") => {
    const n = safePath(nextPath);
    location.href = `${ORIGIN}/auth/?mode=${encodeURIComponent(mode)}&next=${encodeURIComponent(n)}`;
  };

  async function fetchStatus(t) {
    const r = await fetch(`${API}/access/status`, { headers: { authorization: "Bearer " + t } });
    if (r.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      return { _unauth: true };
    }
    if (!r.ok) return null;
    return await r.json();
  }

  async function redirectIfActive() {
    const t = token();
    if (!t) return;

    try {
      const st = await fetchStatus(t);
      if (!st || st._unauth) return;

      const active = !!(st.paid_active || st.trial_active);
      if (!active) return;

      const next = safePath(qs().get("next") || "/dashboard/");
      // если кто-то пришёл на тарифы с next=/tariffs — не зацикливаем
      if (next.startsWith("/tariffs") || next.startsWith("/auth")) {
        go("/dashboard/");
      } else {
        go(next);
      }
    } catch (e) {}
  }

  async function startTrial(btn) {
    const t = token();
    const next = safePath(qs().get("next") || "/dashboard/");

    if (!t) return goAuth(`/tariffs/?next=${encodeURIComponent(next)}`, "login");

    setBusy(btn, "Запускаю…");
    try {
      const r = await fetch(`${API}/trial/activate`, {
        method: "POST",
        headers: { authorization: "Bearer " + t }
      });

      if (r.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        return goAuth(`/tariffs/?next=${encodeURIComponent(next)}`, "login");
      }

      if (!r.ok) throw new Error("trial activate failed");

      go(next);
    } catch (e) {
      alert("Не удалось активировать trial. Попробуй ещё раз.");
    } finally {
      restoreBtn(btn);
    }
  }

  async function createPayment(btn, planRaw) {
    const t = token();
    const next = safePath(qs().get("next") || "/dashboard/");

    if (!t) return goAuth(`/tariffs/?next=${encodeURIComponent(next)}`, "login");

    const plan = mapPlan(planRaw);

    // всегда возвращаемся на /pay/return/ — он сделает payments/check и отправит дальше
    const return_url = `${ORIGIN}/pay/return/?next=${encodeURIComponent(next)}&plan=${encodeURIComponent(plan)}`;

    setBusy(btn, "Переход к оплате…");
    try {
      const r = await fetch(`${API}/payments/create`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + t
        },
        body: JSON.stringify({ plan, return_url })
      });

      if (r.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        return goAuth(`/tariffs/?next=${encodeURIComponent(next)}`, "login");
      }

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j && j.detail ? j.detail : "payments/create failed");

      // сохраняем IDs, чтобы /pay/return/ мог восстановиться даже если query потеряется
      if (j.order_id) localStorage.setItem(KEY_O, String(j.order_id));
      if (j.payment_id) localStorage.setItem(KEY_P, String(j.payment_id));
      localStorage.setItem(KEY_PLAN, String(plan));

      if (!j.confirmation_url) throw new Error("No confirmation_url");

      location.href = j.confirmation_url; // YooMoney/ЮKassa checkout
    } catch (e) {
      console.error(e);
      alert("Не удалось открыть оплату. Проверь, что ты залогинен, и попробуй ещё раз.");
      restoreBtn(btn);
    }
  }

  function bindUI() {
    const trialBtn = document.getElementById("btnStartTrial");
    if (trialBtn) trialBtn.addEventListener("click", () => startTrial(trialBtn));

    document.querySelectorAll(".btnChoosePlan").forEach((b) => {
      b.addEventListener("click", () => createPayment(b, b.getAttribute("data-plan")));
    });
  }

  async function init() {
    // если доступ уже активен — не пускаем на тарифы, сразу кидаем в next/dashboard
    redirectIfActive();
    bindUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
