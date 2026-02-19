/* ABQD_HEADER_v2 (nav: dashboard/constructor/account; no tariffs in main) */
(() => {
  try {
    const API = "https://api.abqd.ru";
    const KEY = "abqd_token";
    const ID  = "abqd-header";

    const path = String(location.pathname || "");
    if (path === "/auth" || path.startsWith("/auth/")) return;
    if (document.getElementById(ID)) return;

    const safePath = (p) => {
      if (!p || typeof p !== "string") return "/dashboard/";
      if (!p.startsWith("/")) return "/dashboard/";
      if (p.startsWith("//")) return "/dashboard/";
      return p;
    };

    const getToken = () => { try { return localStorage.getItem(KEY) || ""; } catch(e){ return ""; } };

    const html = `
<style>
:root{ --abqdHdrH: 0px; }
#abqd-header{
  position:fixed; left:0; right:0; top:0;
  z-index:2147483647;
  height:56px;
  display:flex; align-items:center; justify-content:center;
  background: rgba(10,14,22,.70);
  border-bottom: 1px solid rgba(255,255,255,.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
#abqd-header .in{
  width:min(1200px, calc(100vw - 24px));
  display:flex; align-items:center; justify-content:space-between;
  gap:12px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
  color: rgba(255,255,255,.92);
}
#abqd-header a{
  color: rgba(255,255,255,.92);
  text-decoration:none;
}
#abqd-header .brand{
  font-weight:900; letter-spacing:.5px;
  display:flex; align-items:center; gap:10px;
}
#abqd-header .nav{
  display:flex; gap:10px; align-items:center; flex-wrap:wrap;
}
#abqd-header .pill{
  display:inline-flex; align-items:center; gap:8px;
  padding:8px 12px; border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  font-weight:800; font-size:13px;
}
#abqd-header .pill:hover{ background: rgba(255,255,255,.10); }
#abqd-header .right{ display:flex; gap:10px; align-items:center; }
#abqd-header .status{
  font-size:12px; font-weight:900;
  padding:7px 10px; border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.88);
}
#abqd-header .status.bad{ border-color: rgba(255,90,90,.35); background: rgba(255,90,90,.10); }
#abqd-header .btn{
  display:inline-flex; align-items:center; justify-content:center;
  padding:8px 12px; border-radius:999px;
  border:1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.10);
  font-weight:900; font-size:13px;
}
#abqd-header .btn.primary{
  background:#2a62ff; border-color: rgba(42,98,255,.45);
}
body{ padding-top: var(--abqdHdrH) !important; }
html,body{ scroll-padding-top: var(--abqdHdrH) !important; }
</style>

<div class="in">
  <a class="brand" href="/dashboard/">ABQD</a>

  <div class="nav">
    <a class="pill" href="/dashboard/">Кабинет</a>
    <a class="pill" href="/constructor/">Конструктор</a>
    <a class="pill" href="/account/">Аккаунт</a>
  </div>

  <div class="right">
    <span id="abqdStatus" class="status" style="display:none">…</span>
    <a id="abqdPayBtn" class="btn" href="/tariffs/" style="display:none">Оплатить</a>
    <a id="abqdLoginBtn" class="btn primary" href="/auth/" style="display:none">Войти</a>
    <button id="abqdLogoutBtn" class="btn" type="button" style="display:none">Выйти</button>
  </div>
</div>
`;

    function mount(){
      if (document.getElementById(ID)) return;
      const el = document.createElement("div");
      el.id = ID;
      el.innerHTML = html;
      document.body.prepend(el);
      document.documentElement.style.setProperty("--abqdHdrH", "56px");

      const st = document.getElementById("abqdStatus");
      const pay = document.getElementById("abqdPayBtn");
      const login = document.getElementById("abqdLoginBtn");
      const logout = document.getElementById("abqdLogoutBtn");

      const next = safePath(location.pathname + location.search);
      login.href = "/auth/?next=" + encodeURIComponent(next);

      const token = getToken();
      if (!token) {
        login.style.display = "inline-flex";
        st.style.display = "none";
        pay.style.display = "none";
        logout.style.display = "none";
        return;
      }

      logout.style.display = "inline-flex";
      logout.addEventListener("click", () => {
        try { localStorage.removeItem(KEY); } catch(e){}
        try { document.cookie = "abqd_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax; secure"; } catch(e){}
        location.replace("/auth/?next=" + encodeURIComponent("/dashboard/"));
      });

      // show status
      st.style.display = "inline-flex";
      st.textContent = "проверяем…";

      fetch(API + "/api/v1/access/status", { headers: { authorization: "Bearer " + token } })
        .then(r => {
          if (r.status === 401) {
            try { localStorage.removeItem(KEY); } catch(e){}
            login.style.display = "inline-flex";
            logout.style.display = "none";
            st.style.display = "none";
            pay.style.display = "none";
            return null;
          }
          return r.ok ? r.json() : null;
        })
        .then(s => {
          if (!s) return;
          const active = !!(s.paid_active || s.trial_active);
          if (active) {
            st.classList.remove("bad");
            st.textContent = "активно";
            pay.style.display = "none";
          } else {
            st.classList.add("bad");
            st.textContent = "неактивно";
            pay.style.display = "inline-flex"; // но тарифы не в навигации — только как действие
            pay.href = "/tariffs/?reason=inactive&next=" + encodeURIComponent("/dashboard/");
          }
        })
        .catch(() => {
          // fail-open
          st.textContent = "…";
        });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once:true });
    } else {
      mount();
    }
  } catch(e) {}
})();
