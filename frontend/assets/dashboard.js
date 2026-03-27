// ABQD_DASHBOARD_v1
(function () {
  const $ = (s, root=document) => root.querySelector(s);

  function fmtDate(iso){
    if (!iso) return "—";
    try{
      const d = new Date(iso);
      return d.toLocaleString("ru-RU", { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    }catch(e){
      return String(iso);
    }
  }

  function go(url){ if (location.pathname !== url) location.href = url; }

  function setTopButtons(){
    const logoutBtn = $("#btnLogout");
    if (logoutBtn){
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(window.ABQD.api.TOKEN_KEY);
        go("/auth/");
      });
    }
  }

  function render(me, access){
    $("#meEmail").textContent = me.email || "—";

    let planLabel = "none";
    let expValue = "—";
    if (access) {
      if (access.paid_active) {
        planLabel = access.paid_plan || "paid";
        expValue = access.paid_until ? fmtDate(new Date(Number(access.paid_until) * 1000).toISOString()) : "—";
      } else if (access.trial_active) {
        planLabel = "trial";
        expValue = access.trial_until ? fmtDate(new Date(Number(access.trial_until) * 1000).toISOString()) : "—";
      }
    }

    $("#mePlan").textContent = planLabel;
    $("#meRole").textContent = me.role || "user";
    $("#meExp").textContent = expValue;

    const admin = (me.role === "admin" || me.role === "team");
    const adminCard = $("#adminCard");
    if (adminCard) adminCard.style.display = admin ? "block" : "none";
  }

  window.addEventListener("DOMContentLoaded", async () => {
    window.ABQD.theme?.initThemeSeg();
    setTopButtons();

    async function getAccess(){
      try{
        const token = window.ABQD?.api?.getToken ? window.ABQD.api.getToken() : "";
        const res = await fetch((window.ABQD?.api?.API_BASE || "https://api.abqd.ru") + "/api/v1/access/status", {
          method: "GET",
          headers: token ? { "Authorization": "Bearer " + token } : {}
        });
        if (!res.ok) return null;
        return await res.json();
      }catch(_e){
        return null;
      }
    }

    // guard already put ABQD.me, but we keep safe
    if (window.ABQD?.me) {
      render(window.ABQD.me, await getAccess());
      return;
    }

    const r = await window.ABQD.api.getMe();
    if (r.ok) render(r.data, await getAccess());
  });
})();
