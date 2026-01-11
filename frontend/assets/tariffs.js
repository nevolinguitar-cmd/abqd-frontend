// ABQD_TARIFFS_v2 (YuKassa-ready wording)
(function () {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  function toast(msg){
    let t = document.getElementById("abqdToast");
    if (!t){
      t = document.createElement("div");
      t.id = "abqdToast";
      t.style.cssText = `
        position:fixed;left:50%;bottom:20px;transform:translateX(-50%);
        max-width:92vw;z-index:9999;
        border:1px solid rgba(255,255,255,.18);
        background:rgba(0,0,0,.55);
        color:#fff;
        padding:10px 14px;border-radius:999px;
        font:700 13px/1.3 Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        backdrop-filter: blur(10px);
        box-shadow: 0 18px 60px rgba(0,0,0,.30);
        opacity:0;transition:opacity .18s ease;
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(window.__abqdToastTimer);
    window.__abqdToastTimer = setTimeout(() => (t.style.opacity="0"), 2600);
  }

  function go(url){ if (location.pathname !== url) location.href = url; }
  function nextParam(){
    const next = encodeURIComponent(location.pathname + location.search);
    return `?next=${next}`;
  }

  function initFaq(){
    $$(".faqItem").forEach(item => item.addEventListener("click", () => item.classList.toggle("active")));
  }

  function setTopButtonsState(){
    const token = window.ABQD.api.getToken();
    const authBtn = $("#btnAuth");
    const dashBtn = $("#btnDash");
    const logoutBtn = $("#btnLogout");
    if (!authBtn || !dashBtn || !logoutBtn) return;

    if (token){
      authBtn.style.display="none";
      dashBtn.style.display="inline-flex";
      logoutBtn.style.display="inline-flex";
    } else {
      authBtn.style.display="inline-flex";
      dashBtn.style.display="none";
      logoutBtn.style.display="none";
    }

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(window.ABQD.api.TOKEN_KEY);
      toast("Вы вышли из аккаунта");
      setTimeout(() => go("/auth/"), 350);
    });
  }

  function lockButton(btn, locked){
    btn.disabled = !!locked;
    btn.style.opacity = locked ? ".72" : "1";
    btn.style.cursor = locked ? "not-allowed" : "pointer";
  }

  async function redirectIfAlreadyHasAccess(){
    const r = await window.ABQD.api.getMe();
    if (!r.ok) return;
    const me = r.data;
    const hasAccess = (me.plan === "trial" || me.plan === "paid");
    if (hasAccess) go("/dashboard/");
  }

  async function onStartTrial(btn){
    lockButton(btn, true);
    try{
      const token = window.ABQD.api.getToken();
      if (!token){
        go("/auth/" + nextParam());
        return;
      }

      const r = await window.ABQD.api.startTrial();
      if (!r.ok){
        if (r.status === 401){
          go("/auth/" + nextParam());
          return;
        }
        toast("Trial сейчас недоступен. Напишите в поддержку.");
        return;
      }

      toast("Trial активирован");
      setTimeout(() => go("/dashboard/"), 400);
    } finally {
      lockButton(btn, false);
    }
  }

  function onChoosePlan(planCode){
    const token = window.ABQD.api.getToken();
    if (!token){
      go("/auth/" + nextParam());
      return;
    }
    toast(`Тариф "${planCode}" оформляется из личного кабинета. Оплата — картой через ЮKassa.`);
    setTimeout(() => go("/dashboard/"), 650);
  }

  function initCtas(){
    const trialBtn = $("#btnStartTrial");
    if (trialBtn) trialBtn.addEventListener("click", () => onStartTrial(trialBtn));

    $$(".btnChoosePlan").forEach(btn => {
      btn.addEventListener("click", () => onChoosePlan(btn.getAttribute("data-plan") || "plan"));
    });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    window.ABQD.theme?.initThemeSeg();
    initFaq();
    initCtas();
    setTopButtonsState();
    await redirectIfAlreadyHasAccess();
  });
})();
