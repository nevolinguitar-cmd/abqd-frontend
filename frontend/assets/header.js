/* ABQD_HEADER_v3_GLASS_PRODUCTION */

(() => {
  try {

    const CONFIG = {
      API: "https://api.abqd.ru",
      TOKEN_KEY: "abqd_token",
      HEADER_ID: "abqd-header",
      LOGO_SVG: "https://static.tildacdn.com/tild3437-6438-4735-a331-343834336463/_abqd.svg",
      LOGO_PNG: "https://static.tildacdn.com/tild6464-3131-4736-b938-656238643465/_abqd.png"
    };

    if (location.pathname.startsWith("/auth")) return;
    if (document.getElementById(CONFIG.HEADER_ID)) return;

    const style = document.createElement("style");
    style.textContent = `
      :root { --abqdHdrH: 64px; --abqdAccent: #2a62ff; }

      #${CONFIG.HEADER_ID} {
        position: fixed;
        left: 0; right: 0; top: 0;
        height: var(--abqdHdrH);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
        background: rgba(5,7,10,0.65);
        backdrop-filter: blur(22px) saturate(160%);
        border-bottom: 1px solid rgba(255,255,255,.08);
        font: 500 14px/1.2 Inter, system-ui, -apple-system, sans-serif;
        color: #fff;
      }

      #${CONFIG.HEADER_ID} a {
        color: inherit;
        text-decoration: none;
        transition: .2s ease;
      }

      #${CONFIG.HEADER_ID} .brand img {
        height: 26px;
        display: block;
      }

      #${CONFIG.HEADER_ID} .nav {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 6px;
        background: rgba(255,255,255,0.04);
        padding: 4px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.06);
      }

      #${CONFIG.HEADER_ID} .nav a {
        padding: 8px 16px;
        border-radius: 999px;
        font-weight: 600;
        font-size: 13px;
        color: rgba(255,255,255,0.6);
      }

      #${CONFIG.HEADER_ID} .nav a:hover {
        color: #fff;
        background: rgba(255,255,255,0.08);
      }

      #${CONFIG.HEADER_ID} .right {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      #${CONFIG.HEADER_ID} .status-pill {
        font-size: 10px;
        text-transform: uppercase;
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.4);
      }

      #${CONFIG.HEADER_ID} .status-pill.active {
        color: #4ade80;
        background: rgba(74, 222, 128, 0.1);
        border-color: rgba(74, 222, 128, 0.2);
      }

      #${CONFIG.HEADER_ID} .btn-auth {
        padding: 9px 22px;
        border-radius: 999px;
        background: var(--abqdAccent);
        font-weight: 700;
        box-shadow: 0 4px 18px rgba(42, 98, 255, 0.25);
      }

      #${CONFIG.HEADER_ID} .user-email {
        font-size: 13px;
        opacity: 0.5;
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${CONFIG.HEADER_ID} .btn-logout {
        opacity: 0.4;
        font-size: 12px;
        cursor: pointer;
      }

      body { padding-top: var(--abqdHdrH) !important; }

      @media (max-width: 1024px) {
        #${CONFIG.HEADER_ID} .nav { display: none; }
      }

      @media (max-width: 520px) {
        #${CONFIG.HEADER_ID} .brand img { height: 22px; }
        #${CONFIG.HEADER_ID} .status-pill { display: none; }
      }
    `;
    document.head.appendChild(style);

    const currentPath = encodeURIComponent(location.pathname + location.search);

    const header = document.createElement("div");
    header.id = CONFIG.HEADER_ID;
    header.innerHTML = `
      <div class="left">
        <a href="/" class="brand">
          <picture>
            <source srcset="${CONFIG.LOGO_PNG}" media="(max-width:520px)">
            <img src="${CONFIG.LOGO_SVG}" alt="ABQD">
          </picture>
        </a>
      </div>

      <nav class="nav">
        <a href="/dashboard/">Кабинет</a>
        <a href="/constructor/">Конструктор</a>
        <a href="/account/">Аккаунт</a>
      </nav>

      <div class="right">
        <span id="abqd-st" class="status-pill">гость</span>
        <span id="abqd-who" class="user-email"></span>
        <a id="abqd-auth" class="btn-auth" href="/auth/?next=${currentPath}">Войти</a>
        <a id="abqd-lo" class="btn-logout" style="display:none">Выйти</a>
      </div>
    `;

    document.body.prepend(header);

    const updateUI = (user = null, status = null) => {
      const stEl = document.getElementById("abqd-st");
      const whoEl = document.getElementById("abqd-who");
      const authEl = document.getElementById("abqd-auth");
      const loEl = document.getElementById("abqd-lo");

      if (user && status) {
        const active = !!(status.paid_active || status.trial_active);
        if (stEl) {
          stEl.textContent = active ? "активно" : "неактивно";
          stEl.className = active ? "status-pill active" : "status-pill";
        }
        if (whoEl) whoEl.textContent = user.email;
        if (authEl) authEl.style.display = "none";
        if (loEl) loEl.style.display = "inline-flex";
      } else {
        if (stEl) { stEl.textContent = "гость"; stEl.className = "status-pill"; }
        if (whoEl) whoEl.textContent = "";
        if (authEl) authEl.style.display = "inline-flex";
        if (loEl) loEl.style.display = "none";
      }
    };

    const refresh = async () => {
      const t = localStorage.getItem(CONFIG.TOKEN_KEY);
      if (!t) return updateUI();

      try {
        const headers = { authorization: "Bearer " + t };
        const [rMe, rSt] = await Promise.all([
          fetch(CONFIG.API + "/api/v1/auth/me", { headers }),
          fetch(CONFIG.API + "/api/v1/access/status", { headers })
        ]);

        if (rMe.status === 401 || rSt.status === 401) throw "unauthorized";
        updateUI(await rMe.json(), await rSt.json());
      } catch (e) {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        updateUI();
      }
    };

    document.getElementById("abqd-lo").onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      location.href = "/auth/?next=" + encodeURIComponent("/dashboard/");
    };

    refresh();

  } catch (e) {
    console.error("ABQD Header Error:", e);
  }
})();
