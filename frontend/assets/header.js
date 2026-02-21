/* ABQD_HEADER_UNIFIED_GLASS_v5_OVERLAY_SAFE */

(() => {
  try {

    if (location.pathname.startsWith("/auth")) return;
    const ROOT_ID = "abqd-header-root";
    if (document.getElementById(ROOT_ID)) return;

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

    const style = document.createElement("style");
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
        background: linear-gradient(to bottom, rgba(5,7,10,0.95), rgba(5,7,10,0.90));
        backdrop-filter: blur(28px) saturate(130%);
        -webkit-backdrop-filter: blur(28px) saturate(130%);
        border-bottom: 1px solid rgba(255,255,255,0.14);
        color: #fff;
        font: 500 14px/1.2 Inter, system-ui, -apple-system, sans-serif;
      }

      #${ROOT_ID} * { box-sizing: border-box; }

      #${ROOT_ID} .brand img { height: 26px; }

      #${ROOT_ID} .nav {
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

      #${ROOT_ID} .nav a {
        padding: 8px 16px;
        border-radius: 999px;
        color: rgba(255,255,255,0.6);
        text-decoration: none;
        font-weight: 600;
        font-size: 13px;
        transition: .2s;
      }

      #${ROOT_ID} .nav a:hover {
        color: #fff;
        background: rgba(255,255,255,0.08);
      }

      #${ROOT_ID} .right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      #${ROOT_ID} .btn-auth {
        padding: 9px 20px;
        border-radius: 999px;
        background: var(--abqdAccent);
        font-weight: 700;
        font-size: 13px;
        text-decoration: none;
        color: #fff;
      }

      #${ROOT_ID} .burger {
        display: none;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        cursor: pointer;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
      }

      #${ROOT_ID} .burger span {
        width: 18px;
        height: 2px;
        background: #fff;
        border-radius: 2px;
        transition: .3s;
      }

      #${ROOT_ID}.menu-open .burger span:nth-child(1) {
        transform: translateY(5px) rotate(45deg);
      }

      #${ROOT_ID}.menu-open .burger span:nth-child(2) {
        opacity: 0;
      }

      #${ROOT_ID}.menu-open .burger span:nth-child(3) {
        transform: translateY(-5px) rotate(-45deg);
      }

      #${ROOT_ID}-mobile {
        position: fixed;
        top: 0;
        right: -100%;
        width: 100%;
        height: 100vh;
        background: #05070a;
        padding: 100px 30px 40px;
        display: flex;
        flex-direction: column;
        gap: 30px;
        transition: .4s ease;
        z-index: 2147483645;
      }

      #${ROOT_ID}-mobile.open { right: 0; }

      #${ROOT_ID}-mobile a {
        font-size: 24px;
        font-weight: 800;
        color: #fff;
        text-decoration: none;
      }

      @media (max-width: 900px) {
        #${ROOT_ID} .nav { display: none; }
        #${ROOT_ID} .burger { display: flex; }
      }
    `;
    document.head.appendChild(style);

    const currentPath = encodeURIComponent(location.pathname + location.search);

    const header = document.createElement("div");
    header.id = ROOT_ID;
    header.innerHTML = `
      <a href="/" class="brand">
        <img src="${CONFIG.LOGO.SVG}" alt="ABQD">
      </a>

      <nav class="nav">
        ${CONFIG.LINKS.map(l => `<a href="${l.href}">${l.name}</a>`).join("")}
      </nav>

      <div class="right">
        <a href="/auth/?next=${currentPath}" class="btn-auth">Войти</a>
        <div class="burger" id="abqd-burger">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;

    const mobile = document.createElement("div");
    mobile.id = ROOT_ID + "-mobile";
    mobile.innerHTML = CONFIG.LINKS.map(l => `<a href="${l.href}">${l.name}</a>`).join("");

    document.body.prepend(mobile);
    document.body.prepend(header);

    const burger = document.getElementById("abqd-burger");
    burger.addEventListener("click", () => {
      header.classList.toggle("menu-open");
      mobile.classList.toggle("open");
      document.body.style.overflow = mobile.classList.contains("open") ? "hidden" : "";
    });

  } catch (e) {
    console.error("Header error", e);
  }
})();
