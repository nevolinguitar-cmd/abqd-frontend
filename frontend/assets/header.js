/* ABQD_HEADER_v9_PREMIUM_PRODUCTION */

(() => {
  try {

    if (location.pathname.startsWith("/auth")) return;

    const ROOT_ID = "abqd-header-root";
    const MENU_ID = "abqd-header-mobile-menu";

    if (document.getElementById(ROOT_ID)) return;

    const CONFIG = {
      API: "https://api.abqd.ru",
      TOKEN_KEY: "abqd_token",
      LINKS: [
        { name: "Кабинет", href: "/dashboard/" },
        { name: "Конструктор", href: "/constructor/" },
        { name: "Календарь", href: "/calendar/" },
        { name: "Аккаунт", href: "/account/" }
      ],
      LOGO: "https://static.tildacdn.com/tild3437-6438-4735-a331-343834336463/_abqd.svg"
    };

    /* ================= STYLES ================= */

    if (!document.getElementById("abqd-header-style")) {
      const style = document.createElement("style");
      style.id = "abqd-header-style";
      style.textContent = `
        :root { --abqdHdrH: 64px; --abqdAccent: #2a62ff; }

        body { padding-top: var(--abqdHdrH) !important; }

        #${ROOT_ID} {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--abqdHdrH);
          z-index: 2147483646;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: linear-gradient(to bottom, rgba(5,7,10,0.88), rgba(5,7,10,0.78));
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border-bottom: 1px solid rgba(255,255,255,0.14);
          color: #fff;
          font-family: Inter, system-ui, -apple-system, sans-serif;
        }

        #${ROOT_ID} .abqd-logo img {
          height: 28px;
          display: block;
        }

        #${ROOT_ID} .abqd-nav {
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
          gap: 14px;
        }

        #${ROOT_ID} .abqd-email {
          font-size: 13px;
          opacity: .7;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        #${ROOT_ID} .abqd-logout {
          font-size: 13px;
          color: #ff4d4d;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }

        #${ROOT_ID} .abqd-login {
          padding: 9px 20px;
          border-radius: 999px;
          background: var(--abqdAccent);
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          text-decoration: none;
        }

        #${ROOT_ID} .abqd-burger {
          display: none;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        #${ROOT_ID} .abqd-burger span {
          width: 20px;
          height: 2px;
          background: #fff;
          border-radius: 2px;
        }

        #${MENU_ID} {
          position: fixed;
          top: 0;
          right: -100%;
          width: 100%;
          height: 100vh;
          background: #05070a;
          z-index: 2147483645;
          display: flex;
          flex-direction: column;
          padding: 100px 32px;
          transition: .4s;
        }

        #${MENU_ID}.open { right: 0; }

        #${MENU_ID} a {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          text-decoration: none;
          margin-bottom: 24px;
        }

        @media (max-width: 900px) {
          #${ROOT_ID} .abqd-nav { display: none; }
          #${ROOT_ID} .abqd-right-desktop { display: none; }
          #${ROOT_ID} .abqd-burger { display: flex; }
          #${ROOT_ID} .abqd-logo img { height: 24px; }
        }
      `;
      document.head.appendChild(style);
    }

    /* ================= RENDER ================= */

    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    const isAuth = !!token;
    const currentPath = encodeURIComponent(location.pathname + location.search);

    const header = document.createElement("div");
    header.id = ROOT_ID;

    const desktopAuth = isAuth
      ? `<span class="abqd-email" id="abqd-email"></span>
         <a class="abqd-logout" id="abqd-logout">Выйти</a>`
      : `<a href="/auth/?next=${currentPath}" class="abqd-login">Войти</a>`;

    header.innerHTML = `
      <div class="abqd-logo">
        <a href="/"><img src="${CONFIG.LOGO}" alt="ABQD"></a>
      </div>
      <nav class="abqd-nav">
        ${CONFIG.LINKS.map(l => `<a href="${l.href}">${l.name}</a>`).join("")}
      </nav>
      <div class="abqd-right">
        <div class="abqd-right-desktop">${desktopAuth}</div>
        <div class="abqd-burger" id="abqd-burger">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;

    const mobileMenu = document.createElement("div");
    mobileMenu.id = MENU_ID;
    mobileMenu.innerHTML = `
      ${CONFIG.LINKS.map(l => `<a href="${l.href}">${l.name}</a>`).join("")}
      <div style="margin-top:auto;">
        ${isAuth
          ? `<a id="abqd-mobile-logout" style="color:#ff4d4d;">Выйти</a>`
          : `<a href="/auth/?next=${currentPath}" style="color:#2a62ff;">Войти</a>`
        }
      </div>
    `;

    document.body.prepend(mobileMenu);
    document.body.prepend(header);

    /* ================= EVENTS ================= */

    document.getElementById("abqd-burger").onclick = () => {
      mobileMenu.classList.toggle("open");
      document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
    };

    if (isAuth) {
      const logout = () => {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        location.reload();
      };
      document.getElementById("abqd-logout").onclick = logout;
      document.getElementById("abqd-mobile-logout").onclick = logout;

      fetch(CONFIG.API + "/api/v1/auth/me", {
        headers: { authorization: "Bearer " + token }
      })
      .then(r => r.ok ? r.json() : null)
      .then(user => {
        if (user && user.email) {
          const el = document.getElementById("abqd-email");
          if (el) el.textContent = user.email;
        }
      });
    }

  } catch (e) {
    console.error("ABQD header error", e);
  }
})();
