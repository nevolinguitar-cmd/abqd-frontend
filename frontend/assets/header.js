/* ABQD_HEADER_UNIFIED_GLASS_v4_CRM_SAFE */

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
                { name: "Календарь", href: "/calendar/" },
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
                    position: fixed; top: 0; left: 0; right: 0; height: var(--abqdHdrH);
                    z-index: 99999; display: flex; align-items: center;
                    justify-content: space-between; padding: 0 24px;
                    background: linear-gradient(to bottom, rgba(5,7,10,0.88), rgba(5,7,10,0.78));
                    backdrop-filter: blur(24px) saturate(150%);
                    border-bottom: 1px solid rgba(255,255,255,0.14);
                    color: #fff; font: 500 14px Inter, system-ui;
                }

                #${ROOT_ID} .abqd-brand img { height: 28px; }

                #${ROOT_ID} .abqd-nav {
                    position: absolute; left: 50%; transform: translateX(-50%);
                    display: flex; gap: 4px; background: rgba(255,255,255,0.04);
                    padding: 4px; border-radius: 99px;
                    border: 1px solid rgba(255,255,255,0.06);
                }

                #${ROOT_ID} .abqd-nav a {
                    padding: 8px 18px; border-radius: 99px;
                    color: rgba(255,255,255,0.6);
                    text-decoration: none; font-weight: 600;
                }

                #${ROOT_ID} .abqd-nav a:hover {
                    color: #fff; background: rgba(255,255,255,0.08);
                }

                #${ROOT_ID} .abqd-btn-auth {
                    padding: 10px 22px; border-radius: 99px;
                    background: var(--abqdAccent); color: #fff;
                    text-decoration: none; font-weight: 700;
                }

                #${ROOT_ID} .abqd-btn-logout {
                    font-size: 13px;
                    color: rgba(255,255,255,0.6);
                    text-decoration: none;
                    font-weight: 600;
                    padding: 6px 12px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 99px;
                }

                #${ROOT_ID} .abqd-btn-logout:hover {
                    color: #fff;
                    background: rgba(255,255,255,0.15);
                }

                @media (max-width: 900px) {
                    #${ROOT_ID} .abqd-nav { display: none; }
                }
            `;
            document.head.appendChild(style);
        }

        const renderUI = () => {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            const isAuth = !!token;
            const currentPath = encodeURIComponent(location.pathname + location.search);

            let headerEl = document.getElementById(ROOT_ID);
            if (!headerEl) {
                headerEl = document.createElement("div");
                headerEl.id = ROOT_ID;
                document.body.prepend(headerEl);
            }

            const desktopAuthHTML = isAuth
                ? `<a id="abqd-desk-lo" class="abqd-btn-logout" href="#">Выйти</a>`
                : `<a href="/auth/?next=${currentPath}" class="abqd-btn-auth">Войти</a>`;

            headerEl.innerHTML = `
                <div>
                    <a href="/" class="abqd-brand">
                        <img src="${CONFIG.LOGO.SVG}" alt="ABQD">
                    </a>
                </div>
                <nav class="abqd-nav">
                    ${CONFIG.LINKS.map(link => `<a href="${link.href}">${link.name}</a>`).join('')}
                </nav>
                <div>${desktopAuthHTML}</div>
            `;

            if (isAuth) {
                document.getElementById("abqd-desk-lo").onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem(CONFIG.TOKEN_KEY);
                    location.reload();
                };
            }
        };

        renderUI();

    } catch (e) { console.error("Header error", e); }
})();
