/* * ABQD Header — Technical Specification
 * Версия: ABQD_HEADER_UNIFIED_GLASS_v5_PREMIUM
 * Особенности:
 * - Условный рендер DOM (до вставки)
 * - Mobile Auth inside Burger (Premium Widget Card)
 * - Desktop Minimal Profile (Ghost Logout)
 * - Ultimate Tactile Animations & Glow Effects
 */

(() => {
    try {
        // 1. ПРОВЕРКА ИСКЛЮЧЕНИЙ
        if (location.pathname.startsWith("/auth")) return;

        const ROOT_ID = "abqd-header-root";
        const MENU_ID = `${ROOT_ID}-mobile-menu`;

        // FIX: правильная защита от двойной инициализации
        if (window.__abqd_header_initialized) return;
        window.__abqd_header_initialized = true;

        // 2. КОНФИГУРАЦИЯ
        const CONFIG = {
            API: "https://api.abqd.ru",
            TOKEN_KEY: "abqd_token",
            // фиксируем бренд на эталонный PNG (самый надёжный вариант)
            LOGO: {
                SVG: "https://static.tildacdn.com/tild3532-3636-4132-b064-346663353861/_abqd.png",
                PNG: "https://static.tildacdn.com/tild3532-3636-4132-b064-346663353861/_abqd.png"
            },
            LINKS: [
                { name: "Кабинет", href: "/dashboard/?view=kanban" },
                { name: "Конструктор", href: "/constructor/" },
                { name: "Календарь", href: "/calendar/?theme=light" },
                { name: "Аккаунт", href: "/account/" }
            ]
        };

        // --- ABQD_REMOVE_CALENDAR_v1 ---
        CONFIG.LINKS = (CONFIG.LINKS || []).filter(l => l && l.name !== "Календарь");


        // 3. ИНЪЕКЦИЯ СТИЛЕЙ (CRM SAFE) — обновляем даже если style уже был
        let style = document.getElementById("abqd-header-styles");
        if (!style) {
            style = document.createElement("style");
            style.id = "abqd-header-styles";
            document.head.appendChild(style);
        }

        style.textContent = `
            :root {
                --abqdHdrH: 64px;
                --abqdAccent: rgba(42, 98, 255, 0.15);
                --abqdAccentHover: rgba(42, 98, 255, 0.25);
                --abqdAccentBorder: rgba(42, 98, 255, 0.4);
            }

            html, body { scroll-padding-top: var(--abqdHdrH) !important; }
            body { padding-top: var(--abqdHdrH) !important; }

            /* Корневой контейнер: Глубокое стекло и тень */
            #${ROOT_ID} {
                position: fixed; top: 0; left: 0; right: 0; height: var(--abqdHdrH);
                z-index: 99999; isolation: isolate;
                display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
                background: linear-gradient(135deg, rgba(5,7,12,0.85) 0%, rgba(10,14,24,0.7) 100%);
                backdrop-filter: blur(32px) saturate(180%); -webkit-backdrop-filter: blur(32px) saturate(180%);
                border-bottom: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
                color: #fff;
                font: 500 14px/1.2 "Montserrat", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-feature-settings: "cv11", "ss01";
                box-sizing: border-box;
            }
            #${ROOT_ID} *, #${MENU_ID}, #${MENU_ID} * { box-sizing: border-box; }

            /* Логотип: Фиксация и левитация */
            #${ROOT_ID} .abqd-brand { display: flex; align-items: center; z-index: 100001; outline: none; flex-shrink: 0; }
            #${ROOT_ID} .abqd-brand picture { display: flex; align-items: center; }
            #${ROOT_ID} .abqd-brand img {
                height: 28px; width: auto; object-fit: contain; display: block;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #${ROOT_ID} .abqd-brand:hover img {
                transform: scale(1.04) translateY(-1px);
                filter: drop-shadow(0 8px 20px rgba(255,255,255,0.2)) brightness(1.15);
            }
            #${ROOT_ID} .abqd-brand:active img { transform: scale(0.96); }

            /* Навигация Desktop: Объемные пилюли */
            #${ROOT_ID} .abqd-nav {
                position: absolute; left: 50%; transform: translateX(-50%);
                display: flex; gap: 6px;
                background: rgba(255,255,255,0.02);
                padding: 6px; border-radius: 99px;
                border: 1px solid rgba(255,255,255,0.05);
                box-shadow: inset 0 0 0 1px rgba(255,255,255,0.01), 0 8px 20px -6px rgba(0,0,0,0.3);
            }
            #${ROOT_ID} .abqd-nav a {
                padding: 8px 20px; border-radius: 99px; color: rgba(255,255,255,0.5); font-size: 13.5px;
                text-decoration: none; font-weight: 500; letter-spacing: 0.01em;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #${ROOT_ID} .abqd-nav a:hover {
                color: #fff; background: rgba(255,255,255,0.08);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            #${ROOT_ID} .abqd-nav a:active { transform: scale(0.96); }

            /* Правый блок */
            #${ROOT_ID} .abqd-right { display: flex; align-items: center; gap: 14px; z-index: 100001; }
            #${ROOT_ID} .abqd-desktop-auth { display: flex; align-items: center; gap: 14px; }

            /* Статус и Профиль: Свечение бейджа */
            #${ROOT_ID} .abqd-status {
                font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
                padding: 6px 14px; border-radius: 99px; background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); font-weight: 700;
                transition: opacity 0.4s ease;
            }
            #${ROOT_ID} .abqd-status.active {
                color: #4ade80; background: rgba(74, 222, 128, 0.08);
                border-color: rgba(74, 222, 128, 0.2);
                box-shadow: 0 0 16px rgba(74, 222, 128, 0.15);
            }
            #${ROOT_ID} .abqd-who {
                font-size: 13.5px; color: rgba(255,255,255,0.8); max-width: 150px;
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                transition: opacity 0.3s ease; font-weight: 500;
            }

            /* Кнопки Desktop: Тактильность */
            #${ROOT_ID} .abqd-btn-auth {
                padding: 10px 24px; border-radius: 99px;
                background: linear-gradient(180deg, var(--abqdAccent) 0%, rgba(42,98,255,0.05) 100%);
                color: #fff; text-decoration: none; font-weight: 600; font-size: 13.5px; letter-spacing: 0.01em;
                border: 1px solid var(--abqdAccentBorder);
                box-shadow: 0 4px 20px rgba(42, 98, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #${ROOT_ID} .abqd-btn-auth:hover {
                background: linear-gradient(180deg, var(--abqdAccentHover) 0%, rgba(42,98,255,0.1) 100%);
                box-shadow: 0 6px 24px rgba(42, 98, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.2);
                transform: translateY(-1px) scale(1.02);
            }
            #${ROOT_ID} .abqd-btn-auth:active { transform: scale(0.96); }

            #${ROOT_ID} .abqd-btn-logout {
                font-size: 13px; color: rgba(255,255,255,0.5); text-decoration: none; font-weight: 500;
                padding: 8px 16px; background: transparent; border-radius: 99px;
                border: 1px solid rgba(255,255,255,0.1);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #${ROOT_ID} .abqd-btn-logout:hover {
                color: #fff; background: rgba(255,255,255,0.05);
                border-color: rgba(255,255,255,0.2);
                transform: translateY(-1px);
            }
            #${ROOT_ID} .abqd-btn-logout:active { transform: scale(0.96); }

            /* Бургер: Утонченные линии */
            #${ROOT_ID} .abqd-burger {
                display: none; width: 44px; height: 44px; border-radius: 14px;
                background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
                transition: all 0.3s ease;
            }
            #${ROOT_ID} .abqd-burger:hover { background: rgba(255,255,255,0.08); }
            #${ROOT_ID} .abqd-burger span { width: 22px; height: 1.5px; background: #fff; border-radius: 2px; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

            /* FIX: Мобильное меню через transform (без iOS полосы) */
            #${MENU_ID} {
                position: fixed; top: 0; right: 0; width: 100%; height: 100vh; height: 100dvh;
                background: rgba(5,7,12,0.95); z-index: 99998; display: flex; flex-direction: column;
                padding: 120px 24px 40px; overflow-y: auto;
                font-family: "Montserrat", "Inter", system-ui, -apple-system, sans-serif;
                backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                transform: translateX(110%);
                opacity: 0; visibility: hidden; pointer-events: none;
                transition: transform 0.5s cubic-bezier(0.25, 1, 0.25, 1), opacity 0.25s ease, visibility 0.25s ease;
            }
            #${MENU_ID}.open {
                transform: translateX(0);
                opacity: 1; visibility: visible; pointer-events: auto;
            }

            #${MENU_ID} .abqd-menu-links { display: flex; flex-direction: column; gap: 8px; }
            #${MENU_ID} a.abqd-menu-link {
                font-size: 24px; font-weight: 600; color: rgba(255, 255, 255, 0.6); text-decoration: none;
                padding: 12px 16px; border-radius: 16px;
                opacity: 0; transform: translateX(30px); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #${MENU_ID}.open a.abqd-menu-link { opacity: 1; transform: translateX(0); }
            #${MENU_ID} a.abqd-menu-link:active { background: rgba(255,255,255,0.05); color: #fff; transform: scale(0.98); }

            /* Мобильная карточка профиля */
            #${MENU_ID} .abqd-mob-auth-card {
                display: flex; align-items: center; justify-content: space-between;
                background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
                padding: 16px 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); gap: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
            #${MENU_ID} .abqd-mob-auth-btn {
                font-size: 16px; color: #fff; text-decoration: none; font-weight: 600;
                padding: 16px 24px; border-radius: 18px; display: block; text-align: center;
                background: linear-gradient(180deg, var(--abqdAccent) 0%, rgba(42,98,255,0.05) 100%);
                border: 1px solid var(--abqdAccentBorder);
                box-shadow: 0 4px 20px rgba(42, 98, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1);
                transition: 0.3s;
            }
            #${MENU_ID} .abqd-mob-auth-btn:active { transform: scale(0.97); }

            /* Адаптация */
            @media (max-width: 900px) {
                #${ROOT_ID} { padding: 0 16px; }
                #${ROOT_ID} .abqd-brand img { height: 28px; }
                #${ROOT_ID} .abqd-nav { display: none; }
                #${ROOT_ID} .abqd-desktop-auth { display: none; }
                #${ROOT_ID} .abqd-burger { display: flex; }
                #${ROOT_ID}.menu-open .abqd-burger span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
                #${ROOT_ID}.menu-open .abqd-burger span:nth-child(2) { opacity: 0; transform: scale(0); }
                #${ROOT_ID}.menu-open .abqd-burger span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
            }
        `;

        // 4. ФУНКЦИЯ УСЛОВНОГО РЕНДЕРА
        const renderUI = () => {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            const isAuth = !!token;
            const currentPath = encodeURIComponent(location.pathname + location.search);

            let headerEl = document.getElementById(ROOT_ID);
            let mobileMenuEl = document.getElementById(MENU_ID);

            if (!headerEl) {
                headerEl = document.createElement("div");
                headerEl.id = ROOT_ID;
                document.body.prepend(headerEl);
            }

            if (!mobileMenuEl) {
                mobileMenuEl = document.createElement("div");
                mobileMenuEl.id = MENU_ID;
                document.body.prepend(mobileMenuEl);
            }

            const desktopAuthHTML = isAuth
                ? `
                    <span id="abqd-st" class="abqd-status" style="opacity: 0;"></span>
                    <span id="abqd-who" class="abqd-who"></span>
                    <a id="abqd-desk-lo" class="abqd-btn-logout" href="#">Выйти</a>
                  `
                : `<a href="/auth/?next=${currentPath}" class="abqd-btn-auth">Войти</a>`;

            const mobileAuthHTML = isAuth
                ? `
                    <div class="abqd-mob-auth-card">
                        <div id="abqd-mob-who" style="font-size: 15px; color: rgba(255,255,255,0.9); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;"></div>
                        <a id="abqd-mob-lo" href="#" style="font-size: 14px; color: rgba(255,255,255,0.6); text-decoration: none; font-weight: 500; padding: 8px 16px; background: rgba(255,255,255,0.05); border-radius: 12px; transition: 0.2s; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.05);">Выйти</a>
                    </div>
                  `
                : `<a href="/auth/?next=${currentPath}" class="abqd-mob-auth-btn">Войти в аккаунт</a>`;

            headerEl.innerHTML = `
                <a href="/" class="abqd-brand">
                    <picture>
                        <source srcset="${CONFIG.LOGO.PNG}" media="(max-width: 900px)">
                        <img src="${CONFIG.LOGO.SVG}" alt="ABQD">
                    </picture>
                </a>
                <nav class="abqd-nav">
                    ${CONFIG.LINKS.map(link => `<a href="${link.href}">${link.name}</a>`).join("")}
                </nav>
                <div class="abqd-right">
                    <div class="abqd-desktop-auth">${desktopAuthHTML}</div>
                    <div class="abqd-burger" id="abqd-burger-trigger">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;

            mobileMenuEl.innerHTML = `
                <div class="abqd-menu-links">
                    ${CONFIG.LINKS.map((link, i) => `<a class="abqd-menu-link" href="${link.href}" style="transition-delay: ${0.05 + i * 0.05}s">${link.name}</a>`).join("")}
                </div>
                <div style="margin-top: auto; padding-top: 40px;">
                    ${mobileAuthHTML}
                </div>
            `;

            // 5. ПРИВЯЗКА СОБЫТИЙ
            const burger = document.getElementById("abqd-burger-trigger");

            headerEl.classList.remove("menu-open");
            document.body.style.overflow = "";

            burger.addEventListener("click", () => {
                const isOpen = mobileMenuEl.classList.toggle("open");
                headerEl.classList.toggle("menu-open");
                document.body.style.overflow = isOpen ? "hidden" : "";
            });

            if (isAuth) {
                const handleLogout = (e) => {
                    e.preventDefault();
                    localStorage.removeItem(CONFIG.TOKEN_KEY);
                    renderUI();
                };

                document.getElementById("abqd-desk-lo").addEventListener("click", handleLogout);
                document.getElementById("abqd-mob-lo").addEventListener("click", handleLogout);

                syncAPI(token);
            }
        };

        // 6. ИНТЕГРАЦИЯ С API
        const syncAPI = async (token) => {
            try {
                const headers = { authorization: "Bearer " + token };
                const [rMe, rSt] = await Promise.all([
                    fetch(`${CONFIG.API}/api/v1/auth/me`, { headers }),
                    fetch(`${CONFIG.API}/api/v1/access/status`, { headers })
                ]);

                if (rMe.status === 401 || rSt.status === 401) {
                    localStorage.removeItem(CONFIG.TOKEN_KEY);
                    renderUI();
                    return;
                }

                if (rMe.ok && rSt.ok) {
                    const user = await rMe.json();
                    const status = await rSt.json();
                    const active = !!(status.paid_active || status.trial_active);

                    const stEl = document.getElementById("abqd-st");
                    const whoEl = document.getElementById("abqd-who");
                    const mobWhoEl = document.getElementById("abqd-mob-who");

                    if (stEl) {
                        stEl.textContent = active ? "активно" : "неактивно";
                        if (active) stEl.classList.add("active");
                        stEl.style.opacity = "1";
                    }
                    if (whoEl) whoEl.textContent = user.email;
                    if (mobWhoEl) mobWhoEl.textContent = user.email;
                }
            } catch (e) {
                // не спамим логи в проде
            }
        };

        renderUI();

    } catch (e) {
        // hard fail не должен валить страницу
    }
})();

/* --- ABQD_FONT_MONTSERRAT_BOLD_v1 ---
   Safe override: loads Montserrat 700 and forces it in header only
*/
(() => {
  try {
    const linkId = "abqd-font-montserrat-700";
    if (!document.getElementById(linkId)) {
      const l = document.createElement("link");
      l.id = linkId;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap";
      document.head.appendChild(l);
    }

    const stId = "abqd-header-font-override";
    let st = document.getElementById(stId);
    if (!st) {
      st = document.createElement("style");
      st.id = stId;
      document.head.appendChild(st);
    }

    st.textContent = `
      /* apply only to header + mobile menu */
      #abqd-header-root, #abqd-header-root-mobile-menu{
        font-family: "Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif !important;
        font-weight: 700 !important;
      }
      #abqd-header-root .abqd-nav a,
      #abqd-header-root .abqd-btn-auth,
      #abqd-header-root .abqd-btn-logout,
      #abqd-header-root .abqd-who,
      #abqd-header-root .abqd-status,
      #abqd-header-root-mobile-menu a.abqd-menu-link,
      #abqd-header-root-mobile-menu .abqd-mob-auth-btn{
        font-weight: 700 !important;
      }
    `;
  } catch (_) {}
})();
