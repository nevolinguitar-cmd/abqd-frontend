(() => {
  const API = "https://api.abqd.ru";
  const NEXT = "/account/";
  const token = localStorage.getItem("abqd_token") || "";

  const $ = (id) => document.getElementById(id);
  const setText = (id, v) => { const el=$(id); if (el) el.textContent = v; };

  if (!token) {
    location.replace("/auth/?next=" + encodeURIComponent(NEXT));
    return;
  }

  // who
  fetch(API + "/api/v1/auth/me", { headers: { authorization: "Bearer " + token } })
    .then(r => {
      if (r.status === 401) {
        localStorage.removeItem("abqd_token");
        location.replace("/auth/?next=" + encodeURIComponent(NEXT));
        return null;
      }
      return r.ok ? r.json() : null;
    })
    .then(user => {
      if (user) setText("who", user.email || "user");
    })
    .catch(() => {});

  // subscription status (не ломает, если элементов нет)
  const fmt = (ts) => {
    if (!ts) return "—";
    try { return new Date(ts * 1000).toLocaleString("ru-RU"); } catch(e) { return String(ts); }
  };

  fetch(API + "/api/v1/access/status", { headers: { authorization: "Bearer " + token } })
    .then(r => {
      if (r.status === 401) {
        localStorage.removeItem("abqd_token");
        location.replace("/auth/?next=" + encodeURIComponent(NEXT));
        return null;
      }
      return r.ok ? r.json() : null;
    })
    .then(st => {
      if (!st) return;
      const active = !!(st.paid_active || st.trial_active);

      setText("accessState", active ? "Активно" : "Неактивно");
      setText("paidUntil", fmt(st.paid_until));
      setText("trialUntil", fmt(st.trial_until));
      setText("plan", (st.paid_plan || "—"));

      const btn = $("renewBtn");
      if (btn) {
        if (active) btn.style.display = "none";
        else {
          btn.style.display = "inline-flex";
          btn.href = "/tariffs/?reason=expired&next=" + encodeURIComponent("/dashboard/");
        }
      }
    })
    .catch(() => {});
})();
