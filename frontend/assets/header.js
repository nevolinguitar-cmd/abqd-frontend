/* ABQD_HEADER_v2 */

(() => {

  const CONFIG = {
    API: "https://api.abqd.ru",
    TOKEN_KEY: "abqd_token",
    HEADER_ID: "abqd-header"
  };

  if (location.pathname.startsWith("/auth")) return;
  if (document.getElementById(CONFIG.HEADER_ID)) return;

  const style = document.createElement("style");
  style.textContent = `
    :root { --abqdHdrH: 64px; --abqdAccent: #2a62ff; }

    #${CONFIG.HEADER_ID} {
      position: fixed; left: 0; right: 0; top: 0;
      height: var(--abqdHdrH);
      z-index: 2147483647;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px;
      background: rgba(5,7,10,0.75);
      backdrop-filter: blur(20px) saturate(160%);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      color: #fff;
      font: 500 14px/1.2 Inter, system-ui, -apple-system, sans-serif;
    }

    #${CONFIG.HEADER_ID} a {
      color: inherit;
      text-decoration: none;
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
      gap: 20px;
    }

    #${CONFIG.HEADER_ID} .btn-auth {
      padding: 8px 18px;
      border-radius: 999px;
      background: var(--abqdAccent);
      font-weight: 600;
    }

    body {
      padding-top: var(--abqdHdrH) !important;
    }

    @media (max-width: 900px) {
      #${CONFIG.HEADER_ID} .nav { display: none; }
    }
  `;
  document.head.appendChild(style);

  const token = localStorage.getItem(CONFIG.TOKEN_KEY);
  const currentPath = encodeURIComponent(location.pathname + location.search);

  const header = document.createElement("div");
  header.id = CONFIG.HEADER_ID;
  header.innerHTML = `
    <a href="/" class="brand">
      <img src="https://static.tildacdn.com/tild6464-3131-4736-b938-656238643465/_abqd.png" alt="ABQD">
    </a>

    <nav class="nav">
      <a href="/dashboard/">Кабинет</a>
      <a href="/constructor/">Конструктор</a>
      <a href="/account/">Аккаунт</a>
    </nav>

    ${
      token
        ? `<a href="/dashboard/" class="btn-auth">Личный кабинет</a>`
        : `<a href="/auth/?next=${currentPath}" class="btn-auth">Войти</a>`
    }
  `;

  document.body.prepend(header);

})();
