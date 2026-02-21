/* ABQD_HEADER_v23_CENTERED */

(() => {
    try {
        if (location.pathname.startsWith("/auth")) return;

        const ROOT_ID = "abqd-header-root";
        const TOKEN_KEY = "abqd_token";
        const API = "https://api.abqd.ru";

        if (document.getElementById(ROOT_ID)) return;

        const header = document.createElement("div");
        header.id = ROOT_ID;
        document.body.prepend(header);

        const style = document.createElement("style");
        style.textContent = `
            :root { --abqdHdrH:64px; --abqdAccent:#2a62ff; }
            body { padding-top: var(--abqdHdrH) !important; }

            #${ROOT_ID} {
                position: fixed;
                top:0; left:0; right:0;
                height: var(--abqdHdrH);
                background: linear-gradient(to bottom, rgba(5,7,10,.92), rgba(5,7,10,.82));
                backdrop-filter: blur(24px);
                border-bottom:1px solid rgba(255,255,255,.12);
                z-index:99999;
            }

            #${ROOT_ID} .abqd-wrap {
                max-width: 1240px;
                height:100%;
                margin:0 auto;
                padding:0 24px;
                display:flex;
                align-items:center;
                justify-content:space-between;
                color:#fff;
                font:500 14px Inter,system-ui;
            }

            #${ROOT_ID} nav {
                display:flex;
                gap:8px;
                background:rgba(255,255,255,.04);
                padding:4px;
                border-radius:99px;
            }

            #${ROOT_ID} nav a {
                padding:8px 18px;
                border-radius:99px;
                color:rgba(255,255,255,.65);
                text-decoration:none;
                font-weight:600;
            }

            #${ROOT_ID} nav a:hover {
                background:rgba(255,255,255,.08);
                color:#fff;
            }

            .abqd-auth {
                display:flex;
                align-items:center;
                gap:14px;
            }

            .abqd-email {
                font-size:13px;
                color:rgba(255,255,255,.65);
                max-width:180px;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            }

            .abqd-logout {
                padding:6px 14px;
                border-radius:99px;
                background:rgba(255,255,255,.05);
                color:rgba(255,255,255,.75);
                text-decoration:none;
                font-weight:600;
                transition:.2s;
            }

            .abqd-logout:hover {
                background:rgba(255,255,255,.15);
                color:#fff;
            }

            .abqd-login {
                padding:10px 22px;
                border-radius:99px;
                background:var(--abqdAccent);
                color:#fff;
                text-decoration:none;
                font-weight:700;
            }

            @media(max-width:900px){
                #${ROOT_ID} nav { display:none; }
            }
        `;
        document.head.appendChild(style);

        const token = localStorage.getItem(TOKEN_KEY);

        const brand = `
            <div>
                <a href="/">
                    <img src="https://static.tildacdn.com/tild3437-6438-4735-a331-343834336463/_abqd.svg" height="28">
                </a>
            </div>
        `;

        const links = `
            <nav>
                <a href="/dashboard/">Кабинет</a>
                <a href="/constructor/">Конструктор</a>
                <a href="/calendar/">Календарь</a>
                <a href="/account/">Аккаунт</a>
            </nav>
        `;

        let authHTML;

        if (!token) {
            authHTML = `<a class="abqd-login" href="/auth/">Войти</a>`;
        } else {
            authHTML = `
                <span class="abqd-email">загрузка...</span>
                <a href="#" class="abqd-logout">Выйти</a>
            `;
        }

        header.innerHTML = `
            <div class="abqd-wrap">
                ${brand}
                ${links}
                <div class="abqd-auth">${authHTML}</div>
            </div>
        `;

        if (!token) return;

        document.querySelector(".abqd-logout").onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem(TOKEN_KEY);
            location.reload();
        };

        fetch(API + "/api/v1/auth/me", {
            headers: { authorization: "Bearer " + token }
        })
        .then(r => r.ok ? r.json() : null)
        .then(user => {
            if (!user) return;
            document.querySelector(".abqd-email").textContent = user.email;
        });

    } catch (e) {
        console.error("HEADER ERROR", e);
    }
})();
