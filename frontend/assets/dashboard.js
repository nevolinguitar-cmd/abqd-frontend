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

  function render(me){
    $("#meEmail").textContent = me.email || "—";
    $("#mePlan").textContent = me.plan || "none";
    $("#meRole").textContent = me.role || "user";
    $("#meExp").textContent = fmtDate(me.expires_at);

    const admin = (me.role === "admin" || me.role === "team");
    const adminCard = $("#adminCard");
    if (adminCard) adminCard.style.display = admin ? "block" : "none";
  }

  window.addEventListener("DOMContentLoaded", async () => {
    window.ABQD.theme?.initThemeSeg();
    setTopButtons();

    // guard already put ABQD.me, but we keep safe
    if (window.ABQD?.me) {
      render(window.ABQD.me);
      return;
    }

    const r = await window.ABQD.api.getMe();
    if (r.ok) render(r.data);
  });
})();
