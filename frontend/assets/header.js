/* ABQD_HEADER_v2 */
(() => {
  try {
    if (location.pathname.startsWith("/auth")) return;

    const API = "https://api.abqd.ru";
    const KEY = "abqd_token";
    const ID = "abqd-header";
    if (document.getElementById(ID)) return;

    const safePath = (p) => {
      if (!p || typeof p !== "string") return "/dashboard/";
      if (!p.startsWith("/")) return "/dashboard/";
      if (p.startsWith("//")) return "/dashboard/";
      return p;
    };
    const currentPath = safePath(location.pathname + location.search);

    const style = document.createElement("style");
    style.textContent = `
:root{ --abqdHdrH: 56px; }
#${ID}{position:fixed;left:0;right:0;top:0;height:var(--abqdHdrH);z-index:2147483647;
  display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 14px;
  background:rgba(10,14,22,.72);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  border-bottom:1px solid rgba(255,255,255,.10);color:#eef2ff;font:600 14px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Arial;
}
#${ID} a{color:inherit;text-decoration:none;opacity:.92}
#${ID} a:hover{opacity:1}
#${ID} .left{display:flex;align-items:center;gap:14px;min-width:0}
#${ID} .brand{font-weight:900;letter-spacing:.12em;opacity:.92}
#${ID} .nav{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
#${ID} .right{display:flex;align-items:center;gap:10px}
#${ID} .pill{padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);font-weight:700}
#${ID} .muted{opacity:.75;font-weight:600;max-width:40vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
body{ padding-top: var(--abqdHdrH) !important; }
html,body{ scroll-padding-top: var(--abqdHdrH) !important; }
@media (max-width:520px){ :root{--abqdHdrH: 52px;} #${ID} .brand{display:none} #${ID} .muted{max-width:46vw} }
`;
    document.head.appendChild(style);

    const el = document.createElement("div");
    el.id = ID;
    el.innerHTML = `
      <div class="left">
        <div class="brand">ABQD</div>
        <div class="nav">
          <a class="pill" href="/dashboard/">Кабинет</a>
          <a class="pill" href="/constructor/">Конструктор</a>
          <a class="pill" href="/account/">Аккаунт</a>
        </div>
      </div>
      <div class="right">
        <span id="abqd-hdr-status" class="pill">…</span>
        <span id="abqd-hdr-who" class="muted"></span>
        <a id="abqd-hdr-auth" class="pill" href="/auth/?next=${encodeURIComponent(currentPath)}">Войти</a>
        <a id="abqd-hdr-logout" class="pill" href="#" style="display:none">Выйти</a>
      </div>
    `;

    const mount = () => document.body.prepend(el);

    const $st = () => document.getElementById("abqd-hdr-status");
    const $who = () => document.getElementById("abqd-hdr-who");
    const $auth = () => document.getElementById("abqd-hdr-auth");
    const $lo = () => document.getElementById("abqd-hdr-logout");

    const token = () => localStorage.getItem(KEY) || "";

    const setLoggedOut = () => {
      if ($st()) $st().textContent = "гость";
      if ($who()) $who().textContent = "";
      if ($auth()) $auth().style.display = "inline-flex";
      if ($lo()) $lo().style.display = "none";
    };

    const setLoggedIn = (active) => {
      if ($st()) $st().textContent = active ? "активно" : "неактивно";
      if ($auth()) $auth().style.display = "none";
      if ($lo()) $lo().style.display = "inline-flex";
    };

    const refresh = async () => {
      const t = token();
      if (!t) { setLoggedOut(); return; }

      fetch(API + "/api/v1/auth/me", { headers: { authorization: "Bearer " + t }})
        .then(r => (r.status===401 ? null : (r.ok ? r.json(): null)))
        .then(u => { if (u && $who()) $who().textContent = u.email || ""; })
        .catch(() => {});

      fetch(API + "/api/v1/access/status", { headers: { authorization: "Bearer " + t }})
        .then(r => {
          if (r.status===401){ localStorage.removeItem(KEY); setLoggedOut(); return null; }
          return r.ok ? r.json() : null;
        })
        .then(st => {
          if (!st) return;
          setLoggedIn(!!(st.paid_active || st.trial_active));
        })
        .catch(() => {});
    };

    const onLogout = (e) => {
      e.preventDefault();
      try { localStorage.removeItem(KEY); } catch(_) {}
      location.replace("/auth/?next=" + encodeURIComponent("/dashboard/"));
    };

    const start = () => {
      mount();
      if ($lo()) $lo().addEventListener("click", onLogout);
      refresh();
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once:true });
    else start();

  } catch (e) {}
})();
