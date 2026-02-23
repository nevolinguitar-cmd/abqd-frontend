/* ABQD Header — STABLE_v6 • desktop no-burger • mobile menu with email+status+logout • 2026-02-23 */
(() => {
  "use strict";
  if (location.pathname.startsWith("/auth")) return;

  // --- cleanup old variants (to avoid double UI / broken padding) ---
  const OLD_IDS = [
    "abqd-header-root", "abqd-header-root-mobile-menu", "abqd-header-styles",
    "abqdHeaderRoot_v2", "abqdMenuWrap_v2", "abqdHeaderCss_v2",
    "abqdHeaderMobileTweaks_v1"
  ];
  OLD_IDS.forEach(id => { try{ document.getElementById(id)?.remove(); }catch(_){ } });

  const ROOT_ID = "abqd_header_v6";
  const MENU_ID = "abqd_header_menu_v6";
  const STYLE_ID = "abqd_header_style_v6";
  const SPACER_ID = "abqd_header_spacer_v6";
  if (document.getElementById(ROOT_ID)) return;

  const API = "https://api.abqd.ru";
  const TOKEN_KEY = "abqd_token";
  const LOGO_PNG = "https://static.tildacdn.com/tild3532-3636-4132-b064-346663353861/_abqd.png";

  const LINKS = [
    { name: "Кабинет", href: "/dashboard/" },
    { name: "Конструктор", href: "/constructor/" },
    { name: "Календарь", href: "/calendar/" },
    { name: "Аккаунт", href: "/account/" },
  ];

  const el = (tag, attrs, html) => {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => {
      if (k === "class") n.className = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  };

  function ensureFont(){
    if (document.getElementById("abqdMontserratFont")) return;
    const l = document.createElement("link");
    l.id = "abqdMontserratFont";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap";
    document.head.appendChild(l);
  }

  const norm = (p) => (p.endsWith("/") ? p : (p + "/"));
  const isActive = (href) => norm(location.pathname).startsWith(norm(new URL(href, location.origin).pathname));

  const getToken = () => { try{ return localStorage.getItem(TOKEN_KEY) || ""; }catch(_){ return ""; } };
  const clearAuth = () => {
    ["abqd_token","abqd_last_order_id","abqd_last_payment_id","abqd_last_payment_status","abqd_access_cache"]
      .forEach(k => { try{ localStorage.removeItem(k); }catch(_){ } });
  };

  async function fetchMe(token){
    try{
      const r = await fetch(`${API}/api/v1/auth/me`, { headers:{ authorization:"Bearer "+token } });
      if (r.status === 401) return { unauthorized:true };
      if (!r.ok) return null;
      return await r.json().catch(()=>null);
    }catch(_){ return null; }
  }
  async function fetchStatus(token){
    try{
      const r = await fetch(`${API}/api/v1/access/status`, { headers:{ authorization:"Bearer "+token } });
      if (r.status === 401) return { unauthorized:true };
      if (!r.ok) return null;
      return await r.json().catch(()=>null);
    }catch(_){ return null; }
  }

  function lockScroll(on){
    document.documentElement.classList.toggle("abqdNoScroll", !!on);
  }

  function injectStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const s = el("style", { id: STYLE_ID }, `
:root{ --abqdH: 64px; }
html.abqdNoScroll{ overflow:hidden !important; }

#${ROOT_ID}, #${ROOT_ID} *{ box-sizing:border-box; }
#${ROOT_ID}{
  position: fixed; top:0; left:0; right:0;
  z-index: 99999; isolation:isolate;
  height: calc(var(--abqdH) + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  display:flex; align-items:center; justify-content:space-between;
  padding-left: 16px; padding-right: 16px;
  background: linear-gradient(to bottom, rgba(5,7,10,.90), rgba(5,7,10,.76));
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border-bottom: 1px solid rgba(255,255,255,.10);
  font: 600 14px/1.2 "Montserrat", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
  color: rgba(255,255,255,.92);
}
#${SPACER_ID}{ height: calc(var(--abqdH) + env(safe-area-inset-top)); }

#${ROOT_ID} .brand{ display:flex; align-items:center; text-decoration:none; color:inherit; }
#${ROOT_ID} .brand img{ height:18px; width:auto; display:block; opacity:.95; }

#${ROOT_ID} .nav{
  position:absolute; left:50%; transform:translateX(-50%);
  display:flex; gap:4px;
  padding:4px; border-radius:999px;
  border:1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.04);
}
#${ROOT_ID} .nav a{
  text-decoration:none;
  padding:8px 16px;
  border-radius:999px;
  color: rgba(255,255,255,.62);
  font-weight:700;
  transition:.18s;
}
#${ROOT_ID} .nav a.active{ color:#fff; background: rgba(255,255,255,.10); }
#${ROOT_ID} .nav a:hover{ color:#fff; background: rgba(255,255,255,.08); }

#${ROOT_ID} .right{ display:flex; align-items:center; gap:10px; }
#${ROOT_ID} .who{ max-width: 180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color: rgba(255,255,255,.70); font-weight:600; }
#${ROOT_ID} .status{
  font-size:10px; letter-spacing:.08em; text-transform:uppercase;
  padding:6px 10px; border-radius:999px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.04);
  color: rgba(255,255,255,.60);
}
#${ROOT_ID} .btn{
  height:36px; padding:0 14px; border-radius:999px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.90);
  text-decoration:none;
  display:inline-flex; align-items:center; justify-content:center;
  font-weight:700;
}
#${ROOT_ID} .btn:hover{ background: rgba(255,255,255,.12); }

#${ROOT_ID} .burger{
  width:44px; height:44px; border-radius:14px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.06);
  display:none; place-items:center;
}
#${ROOT_ID} .burger span{
  width:18px; height:2px; background: rgba(255,255,255,.88);
  border-radius:2px; position:relative; display:block;
}
#${ROOT_ID} .burger span::before, #${ROOT_ID} .burger span::after{
  content:""; position:absolute; left:0; width:18px; height:2px;
  background: rgba(255,255,255,.88); border-radius:2px;
}
#${ROOT_ID} .burger span::before{ top:-6px; }
#${ROOT_ID} .burger span::after{ top:6px; }

/* Mobile menu overlay — no black stripe bug */
#${MENU_ID}{ position:fixed; inset:0; z-index:99998; pointer-events:none; }
#${MENU_ID} .backdrop{ position:absolute; inset:0; background: rgba(0,0,0,.45); opacity:0; transition:opacity .22s ease; }
#${MENU_ID} .panel{
  position:absolute; inset:0;
  padding-top: calc(env(safe-area-inset-top) + 72px);
  padding-left: 20px; padding-right: 20px;
  padding-bottom: calc(env(safe-area-inset-bottom) + 18px);
  background: rgba(5,7,10,.96);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  transform: translateX(110%);
  opacity:0; visibility:hidden;
  transition: transform .22s ease, opacity .18s ease, visibility 0s linear .22s;
  display:flex; flex-direction:column;
}
#${MENU_ID}.open{ pointer-events:auto; }
#${MENU_ID}.open .backdrop{ opacity:1; }
#${MENU_ID}.open .panel{
  transform: translateX(0);
  opacity:1; visibility:visible;
  transition: transform .22s ease, opacity .18s ease, visibility 0s;
}

#${MENU_ID} .top{
  position: fixed; top:0; left:0; right:0;
  height: calc(var(--abqdH) + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  display:flex; align-items:center; justify-content:flex-end;
  padding-right: 16px;
}
#${MENU_ID} .close{
  width:44px; height:44px; border-radius:14px;
  border:1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.06);
  color: rgba(255,255,255,.90);
  font-size: 26px; line-height: 1;
}

#${MENU_ID} a.link{
  display:block;
  font-size: 22px;
  font-weight: 700;
  color: rgba(255,255,255,.92);
  text-decoration:none;
  padding: 14px 12px;
  border-radius: 16px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.12);
  margin-bottom: 10px;
}
#${MENU_ID} a.link.active{
  background: rgba(255,255,255,.08);
  border-color: rgba(255,255,255,.16);
}

#${MENU_ID} .bottom{
  margin-top:auto;
  border-top: 1px solid rgba(255,255,255,.10);
  padding-top: 14px;
}
#${MENU_ID} .email{
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,.55); /* слабые серые */
  word-break: break-all;
  margin-bottom: 6px;
}
#${MENU_ID} .mstatus{
  font-size: 12px;
  color: rgba(255,255,255,.45); /* ещё слабее */
  margin-bottom: 12px;
}
#${MENU_ID} .logout{
  width:100%;
  height:44px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(255,255,255,.05);
  color: rgba(255,255,255,.92);
  font-weight: 800;
}

@media (max-width: 900px){
  #${ROOT_ID} .nav{ display:none; }
  #${ROOT_ID} .desktopAuth{ display:none; }
  #${ROOT_ID} .burger{ display:grid; }
}
@media (min-width: 901px){
  /* на десктопе гамбургер вообще не нужен */
  #${ROOT_ID} .burger{ display:none !important; }
}
    `);
    document.head.appendChild(s);
  }

  function mount(){
    const header = el("div", { id: ROOT_ID });
    const spacer = el("div", { id: SPACER_ID });
    const menu = el("div", { id: MENU_ID, "aria-hidden":"true" });

    document.body.prepend(header);
    header.insertAdjacentElement("afterend", spacer);
    document.body.prepend(menu);
    return { header, menu };
  }

  function render(nodes, state){
    const { header, menu } = nodes;
    const token = state.token;
    const isAuth = !!token;
    const currentPath = encodeURIComponent(location.pathname + location.search);

    const nav = LINKS.map(l => `<a class="${isActive(l.href) ? "active" : ""}" href="${l.href}">${l.name}</a>`).join("");

    const desk = isAuth
      ? `<span class="status">${state.active ? "активно" : "неактивно"}</span>
         <span class="who">${state.email || "—"}</span>
         <a class="btn" id="abqdDeskLo" href="#">Выйти</a>`
      : `<a class="btn" href="/auth/?next=${currentPath}">Войти</a>`;

    header.innerHTML = `
      <a class="brand" href="/account/" aria-label="ABQD"><img src="${LOGO_PNG}" alt="abqd"></a>
      <nav class="nav">${nav}</nav>
      <div class="right">
        <div class="desktopAuth">${desk}</div>
        <button class="burger" id="abqdBurger" type="button" aria-label="Меню"><span></span></button>
      </div>
    `;

    const linksMobile = LINKS.map(l =>
      `<a class="link ${isActive(l.href) ? "active" : ""}" href="${l.href}">${l.name}</a>`
    ).join("");

    menu.innerHTML = `
      <div class="backdrop" data-close="1"></div>
      <div class="top"><button class="close" type="button" data-close="1" aria-label="Закрыть">×</button></div>
      <div class="panel">
        ${linksMobile}
        <div class="bottom">
          <div class="email" id="abqdMobEmail">${isAuth ? (state.email || "—") : "Гость"}</div>
          <div class="mstatus" id="abqdMobStatus">${isAuth ? ("Статус: " + (state.active ? "активно" : "неактивно")) : ""}</div>
          <button class="logout" id="abqdMobBtn" type="button">${isAuth ? "Выйти" : "Войти"}</button>
        </div>
      </div>
    `;

    const openMenu = () => { menu.classList.add("open"); menu.setAttribute("aria-hidden","false"); lockScroll(true); };
    const closeMenu = () => { menu.classList.remove("open"); menu.setAttribute("aria-hidden","true"); lockScroll(false); };

    header.querySelector("#abqdBurger")?.addEventListener("click", openMenu);
    menu.querySelectorAll("[data-close='1']").forEach(x => x.addEventListener("click", closeMenu));
    menu.querySelectorAll("a.link").forEach(a => a.addEventListener("click", () => closeMenu()));

    const doLogout = (e) => { if (e) e.preventDefault(); clearAuth(); location.href = "/auth/"; };

    header.querySelector("#abqdDeskLo")?.addEventListener("click", doLogout);
    menu.querySelector("#abqdMobBtn")?.addEventListener("click", () => {
      if (isAuth) doLogout();
      else location.href = `/auth/?next=${encodeURIComponent(location.pathname + location.search)}`;
    });

    document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") closeMenu(); }, { once:false });
  }

  async function run(){
    ensureFont();
    injectStyles();
    const nodes = mount();

    const token = getToken();
    render(nodes, { token, email:"", active:false });

    if (!token) return;

    const [me, st] = await Promise.all([fetchMe(token), fetchStatus(token)]);
    if ((me && me.unauthorized) || (st && st.unauthorized)){
      clearAuth();
      render(nodes, { token:"", email:"", active:false });
      return;
    }

    const email = me?.email ? String(me.email) : "";
    const active = !!(st && (st.paid_active || st.trial_active));
    render(nodes, { token, email, active });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
