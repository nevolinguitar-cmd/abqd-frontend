/* ABQD_HEADER_UNIFIED_GLASS_v6_LIGHT_FROST */

(() => {
  try {

    if (location.pathname.startsWith("/auth")) return;
    const ROOT_ID = "abqd-header-root";
    const MENU_ID = `${ROOT_ID}-mobile-menu`;

    if (document.getElementById(ROOT_ID) && !window.__abqd_header_initialized) return;
    window.__abqd_header_initialized = true;

    const CONFIG = {
      API: "https://api.abqd.ru",
      TOKEN_KEY: "abqd_token",
      LOGO: {
        SVG: "https://static.tildacdn.com/tild3437-6438-4735-a331-343834336463/_abqd.svg",
        PNG: "https://static.tildacdn.com/tild6464-3131-4736-b938-656238643465/_abqd.png"
      },
      LINKS: [
        { name: "Кабинет", href: "/dashboard/" },
        { name: "Конструктор", href: "/constructor/" },
        { name: "Аккаунт", href: "/account/" }
      ]
    };

    if (!document.getElementById("abqd-header-styles")) {
      const style = document.createElement("style");
      style.id = "abqd-header-styles";
      style.textContent = `
        :root { --abqdHdrH: 64px; --abqdAccent: #2a62ff; }

        body { padding-top: var(--abqdHdrH) !important; }

        #${ROOT_ID} {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--abqdHdrH);
          z-index: 2147483646;
          isolation: isolate;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: linear-gradient(to bottom, rgba(20,24,30,0.55), rgba(20,24,30,0.45));
          backdrop-filter: blur(32px) saturate(140%);
          -webkit-backdrop-filter: blur(32px) saturate(140%);
          border-bottom: 1px solid rgba(255,255,255,0.18);
          color: #fff;
          font: 500 14px/1.2 Inter, system-ui, -apple-system, sans-serif;
        }

        #${ROOT_ID} .abqd-nav {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          background: rgba(255,255,255,0.05);
          padding: 4px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        #${ROOT_ID} .abqd-nav a {
          padding: 8px 16px;
          border-radius: 999px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          transition: .2s;
        }

        #${ROOT_ID} .abqd-nav a:hover {
          color: #fff;
          background: rgba(255,255,255,0.12);
        }

        #${ROOT_ID} .abqd-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        #${ROOT_ID} .abqd-btn-auth {
          padding: 9px 20px;
          border-radius: 999px;
          background: var(--abqdAccent);
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
          color: #fff;
        }

        #${ROOT_ID} .abqd-burger {
          display: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4px;
        }

        #${ROOT_ID} .abqd-burger span {
          width: 18px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
          transition: .3s;
        }

        @media (max-width: 900px) {
          #${ROOT_ID} .abqd-nav { display: none; }
          #${ROOT_ID} .abqd-desktop-auth { display: none; }
          #${ROOT_ID} .abqd-burger { display: flex; }
        }
      `;
      document.head.appendChild(style);
    }

    const renderUI = () => {
      const token = localStorage.getItem(CONFIG.TOKEN_KEY);
      const isAuth = !!token;
      const currentPath = encodeURIComponent(location.pathname + location.search);

      const desktopAuthHTML = isAuth
        ? `<span style="opacity:.7;font-size:13px;">Вы в системе</span>
           <a href="#" id="abqd-logout" style="color:#ff4d4d;font-weight:600;">Выйти</a>`
        : `<a href="/auth/?next=${currentPath}" class="abqd-btn-auth">Войти</a>`;

      const header = document.createElement("div");
      header.id = ROOT_ID;
      header.innerHTML = `
        <a href="/"><img src="${CONFIG.LOGO.SVG}" height="26"></a>
        <nav class="abqd-nav">
          ${CONFIG.LINKS.map(l => `<a href="${l.href}">${l.name}</a>`).join("")}
        </nav>
        <div class="abqd-right abqd-desktop-auth">
          ${desktopAuthHTML}
          <div class="abqd-burger"><span></span><span></span><span></span></div>
        </div>
      `;

      document.body.prepend(header);

      if (isAuth) {
        document.getElementById("abqd-logout").onclick = (e) => {
          e.preventDefault();
          localStorage.removeItem(CONFIG.TOKEN_KEY);
          location.reload();
        };
      }
    };

    renderUI();

  } catch (e) {
    console.error("Header error", e);
  }
})();
