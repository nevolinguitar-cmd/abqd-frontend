// === API paths (same-origin preferred) ===
    const API = {
      login: "/api/v1/auth/login",
      register: "/api/v1/auth/register",
      verify: "/api/v1/auth/verify",
      resetRequest: "/api/v1/auth/reset/request"
    };

    const AFTER_LOGIN = "/tariffs/";
    const TOKEN_KEY = "abqd_token";

    function navigateTo(url){
      try{
        if(window.top && window.top !== window.self) window.top.location.href = url;
        else window.location.href = url;
      }catch(_e){
        window.location.href = url;
      }
    }

    const toast = document.getElementById("toast");
    function safeMsg(x){
      if(x == null) return "";
      if(typeof x === "string") return x;
      if(typeof x === "number" || typeof x === "boolean") return String(x);
      try{ return JSON.stringify(x); }catch(_e){ return String(x); }
    }
    function showToast(msg, kind){
      toast.className = "toast show " + (kind === "ok" ? "ok" : kind === "err" ? "err" : "");
      toast.textContent = safeMsg(msg) || "Ошибка";
    }
    function clearToast(){ toast.className = "toast"; toast.textContent = ""; }

    async function postJSON(url, data){
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
      });
      const text = await r.text();
      let json = null;
      try{ json = text ? JSON.parse(text) : null; } catch(_e){ json = null; }
      if(!r.ok){
        let detail = "HTTP " + r.status;
        if(json && (json.detail != null)) detail = json.detail;
        else if(json && (json.error != null)) detail = json.error;
        else if(text) detail = text;
        throw new Error(safeMsg(detail));
      }
      return json;
    }

    async function getJSON(url, token){
      const r = await fetch(url, {
        method: "GET",
        headers: token ? { "authorization": "Bearer " + token } : {}
      });
      if(!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    }

    function setBusy(btn, busy){
      if(!btn) return;
      btn.disabled = !!busy;
      btn.dataset._t = btn.dataset._t || btn.textContent;
      btn.textContent = busy ? "Подожди…" : btn.dataset._t;
    }

    // ===== Tabs =====
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const paneLogin = document.getElementById("paneLogin");
    const paneRegister = document.getElementById("paneRegister");

    function readInitialTab(){
      try{
        var u = new URL(window.location.href);
        var q = (u.searchParams.get("tab") || u.searchParams.get("mode") || "").toLowerCase();
        var h = (u.hash || "").replace("#", "").toLowerCase();
        var v = q || h;
        if(v === "register" || v === "signup" || v === "reg") return "register";
        return "login";
      }catch(_e){
        var hh = (window.location.hash || "").replace("#", "").toLowerCase();
        if(hh === "register" || hh === "signup" || hh === "reg") return "register";
        return "login";
      }
    }

    function syncTabToUrl(which){
      try{
        var u2 = new URL(window.location.href);
        u2.searchParams.set("tab", (which === "register") ? "register" : "login");
        u2.hash = "";
        window.history.replaceState({}, "", u2.toString());
      }catch(_e){}
    }

    function setTab(which, fromUrl){
      clearToast();
      var isLogin = (which !== "register");
      tabLogin.classList.toggle("active", isLogin);
      tabRegister.classList.toggle("active", !isLogin);
      tabLogin.setAttribute("aria-selected", String(isLogin));
      tabRegister.setAttribute("aria-selected", String(!isLogin));
      paneLogin.classList.toggle("active", isLogin);
      paneRegister.classList.toggle("active", !isLogin);
      if(!fromUrl) syncTabToUrl(isLogin ? "login" : "register");
    }

    tabLogin.addEventListener("click", ()=>setTab("login"));
    tabRegister.addEventListener("click", ()=>setTab("register"));
    setTab(readInitialTab(), true);
    window.addEventListener("popstate", ()=>setTab(readInitialTab(), true));

    // ===== Auto-login by saved token =====
    (async function autoLogin(){
      const t = localStorage.getItem(TOKEN_KEY);
      if(!t) return;
      try{
        await getJSON("/api/v1/auth/me", t);
        navigateTo(AFTER_LOGIN);
      }catch(_e){
        // токен невалиден — чистим
        localStorage.removeItem(TOKEN_KEY);
      }
    })();

    // ===== Login =====
    const formLogin = document.getElementById("formLogin");
    const btnLogin = document.getElementById("btnLogin");

    formLogin.addEventListener("submit", async (ev)=>{
      ev.preventDefault();
      clearToast();
      const email = (document.getElementById("loginEmail").value || "").trim();
      const password = document.getElementById("loginPass").value || "";
      if(!email || !password){ showToast("Заполни email и пароль.", "err"); return; }

      setBusy(btnLogin, true);
      try{
        const res = await postJSON(API.login, { email, password });
        const token = res && (res.access_token || res.token);
        if(token) localStorage.setItem(TOKEN_KEY, token);
        showToast("Вход выполнен. Перенаправляю…", "ok");
        setTimeout(()=>{ navigateTo(AFTER_LOGIN); }, 350);
      }catch(e){
        showToast(e && e.message ? e.message : e, "err");
      }finally{
        setBusy(btnLogin, false);
      }
    });

    // ===== Reset password (optional) =====
    const btnShowReset = document.getElementById("btnShowReset");
    const resetBox = document.getElementById("resetBox");
    const btnReset = document.getElementById("btnReset");

    btnShowReset.addEventListener("click", ()=>{
      clearToast();
      resetBox.style.display = (resetBox.style.display === "none" || !resetBox.style.display) ? "block" : "none";
    });

    btnReset.addEventListener("click", async ()=>{
      clearToast();
      const email1 = (document.getElementById("resetEmail").value || "").trim();
      const email2 = (document.getElementById("loginEmail").value || "").trim();
      const email = email1 || email2;
      if(!email){ showToast("Укажи email для восстановления.", "err"); return; }
      setBusy(btnReset, true);
      try{
        await postJSON(API.resetRequest, { email });
        showToast("Отправили письмо. Проверь входящие/спам.", "ok");
      }catch(e){
        showToast(e && e.message ? e.message : e, "err");
      }finally{
        setBusy(btnReset, false);
      }
    });

    // ===== Register + Verify =====
    const formRegister = document.getElementById("formRegister");
    const btnRegister = document.getElementById("btnRegister");

    const verifyBox = document.getElementById("verifyBox");
    const regCode = document.getElementById("regCode");
    const btnVerify = document.getElementById("btnVerify");
    const btnResend = document.getElementById("btnResend");

    let pendingReg = null; // { email, password, name, phone }

    function normalizePhone(p){
      p = String(p||"").trim();
      var out = "";
      for(var i=0;i<p.length;i++){
        var ch = p.charAt(i);
        if(ch === " " || ch === "(" || ch === ")" || ch === "-") continue;
        out += ch;
      }
      return out;
    }

    function openVerify(){
      verifyBox.style.display = "block";
      setTimeout(()=>{ try{ regCode.focus(); }catch(_e){} }, 50);
    }

    formRegister.addEventListener("submit", async (ev)=>{
      ev.preventDefault();
      clearToast();

      const name = (document.getElementById("regName").value || "").trim();
      const email = (document.getElementById("regEmail").value || "").trim();
      const phone = normalizePhone(document.getElementById("regPhone").value || "");
      const password = document.getElementById("regPass").value || "";
      const password2 = document.getElementById("regPass2").value || "";

      if(!name || !email || !password){ showToast("Имя, email и пароль обязательны.", "err"); return; }
      if(password.length < 8){ showToast("Пароль слишком короткий (минимум 8).", "err"); return; }
      if(password !== password2){ showToast("Пароли не совпадают.", "err"); return; }

      pendingReg = { name, email, phone, password };

      setBusy(btnRegister, true);
      try{
        // отправляем регистрацию
        const payload = { name, email, password };
        if(phone) payload.phone = phone;

        const res = await postJSON(API.register, payload);

        // если вдруг сервер сразу отдал токен — ок, заходим
        const token = res && (res.access_token || res.token);
        if(token){
          localStorage.setItem(TOKEN_KEY, token);
          showToast("Аккаунт создан. Перенаправляю…", "ok");
          setTimeout(()=>{ navigateTo(AFTER_LOGIN); }, 350);
          return;
        }

        // стандартный сценарий: код отправлен на email
        showToast("Мы отправили код на email. Введите 6 цифр для активации.", "ok");
        openVerify();
      }catch(e){
        showToast(e && e.message ? e.message : e, "err");
      }finally{
        setBusy(btnRegister, false);
      }
    });

    btnResend.addEventListener("click", async ()=>{
      clearToast();
      if(!pendingReg || !pendingReg.email){ showToast("Сначала заполни регистрацию.", "err"); return; }
      try{
        // повторяем register как “resend”
        const payload = { name: pendingReg.name, email: pendingReg.email, password: pendingReg.password };
        if(pendingReg.phone) payload.phone = pendingReg.phone;
        await postJSON(API.register, payload);
        showToast("Код отправлен ещё раз. Проверь почту.", "ok");
      }catch(e){
        showToast(e && e.message ? e.message : e, "err");
      }
    });

    btnVerify.addEventListener("click", async ()=>{
      clearToast();
      if(!pendingReg || !pendingReg.email){ showToast("Сначала заполни регистрацию.", "err"); return; }
      const code = String(regCode.value || "").trim();
      if(!code || code.length < 4){ showToast("Введи код из письма.", "err"); return; }

      setBusy(btnVerify, true);
      try{
        // отправляем максимально “совместимо” — сервер возьмёт нужное поле
        const res = await postJSON(API.verify, {
          email: pendingReg.email,
          code: code,
          otp: code,
          verification_code: code
        });

        const token = res && (res.access_token || res.token);
        if(token){
          localStorage.setItem(TOKEN_KEY, token);
          showToast("Готово. Перенаправляю…", "ok");
          setTimeout(()=>{ navigateTo(AFTER_LOGIN); }, 350);
          return;
        }

        // если verify не выдаёт токен — логинимся
        const res2 = await postJSON(API.login, { email: pendingReg.email, password: pendingReg.password });
        const token2 = res2 && (res2.access_token || res2.token);
        if(token2) localStorage.setItem(TOKEN_KEY, token2);

        showToast("Аккаунт активирован. Перенаправляю…", "ok");
        setTimeout(()=>{ navigateTo(AFTER_LOGIN); }, 350);
      }catch(e){
        showToast(e && e.message ? e.message : e, "err");
      }finally{
        setBusy(btnVerify, false);
      }
    });
