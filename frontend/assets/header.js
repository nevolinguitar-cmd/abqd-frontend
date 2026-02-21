/* ABQD_HEADER_v50_CLEAN_STABLE */

(() => {
  try {
    if (location.pathname.startsWith("/auth")) return;

    const ROOT_ID = "abqd-header-root";
    const TOKEN_KEY = "abqd_token";
    const API = "https://api.abqd.ru";

    const old = document.getElementById(ROOT_ID);
    if (old) old.remove();

    const header = document.createElement("div");
    header.id = ROOT_ID;
    document.body.prepend(header);

    const style = document.createElement("style");
    style.textContent = `
      :root { --hdrH:64px; --accent:#2a62ff; }

      body { padding-top:var(--hdrH)!important; }

      #${ROOT_ID}{
        position:fixed;
        top:0; left:0; right:0;
        height:var(--hdrH);
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 40px;
        background:linear-gradient(to bottom, rgba(5,7,10,.92), rgba(5,7,10,.82));
        backdrop-filter:blur(24px);
        border-bottom:1px solid rgba(255,255,255,.12);
        font:500 14px Inter,system-ui;
        z-index:99999;
      }

      .hdr-left,.hdr-center,.hdr-right{
        display:flex;
        align-items:center;
      }

      .hdr-center{
        flex:1;
        justify-content:center;
      }

      .hdr-center nav{
        display:flex;
        gap:6px;
        background:rgba(255,255,255,.04);
        padding:4px;
        border-radius:99px;
      }

      .hdr-center nav a{
        padding:8px 18px;
        border-radius:99px;
        text-decoration:none;
        color:rgba(255,255,255,.65);
        font-weight:600;
      }

      .hdr-center nav a:hover{
        background:rgba(255,255,255,.08);
        color:#fff;
      }

      .hdr-right{
        gap:14px;
      }

      .abqd-email{
        font-size:13px;
        color:rgba(255,255,255,.65);
        max-width:180px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }

      .abqd-logout{
        padding:6px 14px;
        border-radius:99px;
        background:rgba(255,255,255,.05);
        color:rgba(255,255,255,.75);
        text-decoration:none;
        font-weight:600;
      }

      .abqd-logout:hover{
        background:rgba(255,255,255,.15);
        color:#fff;
      }

      .abqd-login{
        padding:10px 22px;
        border-radius:99px;
        background:var(--accent);
        color:#fff;
        text-decoration:none;
        font-weight:700;
      }

      .abqd-logo{
        height:28px;
        display:block;
      }

      /* ===== MOBILE ===== */

      .burger{
        display:none;
        width:40px;
        height:40px;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        gap:5px;
        cursor:pointer;
      }

      .burger span{
        width:22px;
        height:2px;
        background:#fff;
        transition:.3s;
      }

      .mobile-menu{
        position:fixed;
        top:0;
        right:-100%;
        width:100%;
        height:100vh;
        background:#05070a;
        padding:90px 28px 40px;
        display:flex;
        flex-direction:column;
        transition:.35s ease;
        z-index:99998;
      }

      .mobile-menu.open{
        right:0;
      }

      .mobile-menu a{
        font-size:22px;
        font-weight:700;
        color:#fff;
        text-decoration:none;
        margin-bottom:28px;
      }

      .mobile-auth{
        margin-top:auto;
        padding-top:30px;
        border-top:1px solid rgba(255,255,255,.1);
        display:flex;
        flex-direction:column;
        gap:16px;
      }

      .mobile-email{
        font-size:14px;
        opacity:.6;
        word-break:break-all;
      }

      @media(max-width:900px){
        #${ROOT_ID}{
          height:56px;
          padding:0 18px;
        }

        .hdr-center{display:none;}
        .hdr-right{display:none;}
        .burger{display:flex;}
        .abqd-logo{height:22px;}
      }
    `;
    document.head.appendChild(style);

    const token = localStorage.getItem(TOKEN_KEY);

    const mobileMenu = document.createElement("div");
    mobileMenu.className="mobile-menu";
    document.body.appendChild(mobileMenu);

    header.innerHTML=`
      <div class="hdr-left">
        <a href="/">
          <picture>
            <source srcset="https://static.tildacdn.com/tild3437-6438-4735-a331-343834336463/_abqd.svg" media="(min-width:901px)">
            <source srcset="https://static.tildacdn.com/tild6464-3131-4736-b938-656238643465/_abqd.png" media="(max-width:900px)">
            <img src="https://static.tildacdn.com/tild3437-6438-4735-a331-343834336463/_abqd.svg" class="abqd-logo">
          </picture>
        </a>
      </div>

      <div class="hdr-center">
        <nav>
          <a href="/dashboard/">Кабинет</a>
          <a href="/constructor/">Конструктор</a>
          <a href="/calendar/">Календарь</a>
          <a href="/account/">Аккаунт</a>
        </nav>
      </div>

      <div class="hdr-right">
        ${
          token
            ? `<span class="abqd-email">загрузка...</span>
               <a href="#" class="abqd-logout">Выйти</a>`
            : `<a class="abqd-login" href="/auth/">Войти</a>`
        }
      </div>

      <div class="burger" id="burger">
        <span></span><span></span><span></span>
      </div>
    `;

    mobileMenu.innerHTML=`
      <a href="/dashboard/">Кабинет</a>
      <a href="/constructor/">Конструктор</a>
      <a href="/calendar/">Календарь</a>
      <a href="/account/">Аккаунт</a>
      <div class="mobile-auth">
        ${
          token
            ? `<div class="mobile-email">загрузка...</div>
               <a href="#" class="abqd-logout">Выйти</a>`
            : `<a class="abqd-login" href="/auth/">Войти</a>`
        }
      </div>
    `;

    const burger=document.getElementById("burger");
    burger.onclick=()=>{
      mobileMenu.classList.toggle("open");
      document.body.style.overflow=
        mobileMenu.classList.contains("open")?"hidden":"";
    };

    if(!token)return;

    document.querySelectorAll(".abqd-logout").forEach(btn=>{
      btn.onclick=e=>{
        e.preventDefault();
        localStorage.removeItem(TOKEN_KEY);
        location.reload();
      };
    });

    fetch(API+"/api/v1/auth/me",{headers:{authorization:"Bearer "+token}})
      .then(r=>r.ok?r.json():null)
      .then(user=>{
        if(!user)return;
        document.querySelectorAll(".abqd-email,.mobile-email")
          .forEach(el=>el.textContent=user.email);
      });

  } catch(e){ console.error(e); }
})();
