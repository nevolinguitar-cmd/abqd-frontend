(() => {
  const $ = (id) => document.getElementById(id);

  const TOKEN_KEY = "abqd_token";
  const PENDING_KEY = "abqd_pending_reg_v1";

  const apiBase = (() => {
    try {
      if (typeof window.apiOrigin === "function") return window.apiOrigin();
    } catch(_) {}
    // fallback
    return "https://api.abqd.ru";
  })();

  const statusEl = $("status");
  function setStatus(kind, msg) {
    statusEl.classList.remove("hidden", "ok", "err");
    statusEl.classList.add(kind === "ok" ? "ok" : "err");
    statusEl.textContent = msg;
  }
  function clearStatus(){ statusEl.classList.add("hidden"); statusEl.textContent=""; statusEl.classList.remove("ok","err"); }

  function show(which){
    $("formLogin").classList.toggle("hidden", which !== "login");
    $("formRegister").classList.toggle("hidden", which !== "register");
    $("formVerify").classList.toggle("hidden", which !== "verify");

    $("tabLogin").classList.toggle("isActive", which === "login");
    $("tabRegister").classList.toggle("isActive", which === "register");
  }

  async function req(method, path, body, token) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    const res = await fetch(apiBase + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch(_) {}

    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) ? (data.detail || data.message) : (text || ("HTTP " + res.status));
      throw new Error(msg);
    }
    return data;
  }

  function extractToken(data){
    if (!data) return null;
    return data.token || data.access_token || data.accessToken || data.jwt || null;
  }

  function normalizePhone(s){
    return String(s||"").trim();
  }

  // Tabs
  $("tabLogin").addEventListener("click", () => { clearStatus(); show("login"); });
  $("tabRegister").addEventListener("click", () => { clearStatus(); show("register"); });

  // Login: ONLY email+password (no OTP)
  $("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const email = $("loginEmail").value.trim();
    const password = $("loginPass").value;

    if (!email || !password) return setStatus("err", "Укажи email и пароль.");

    $("btnLogin").disabled = true;
    try {
      const data = await req("POST", "/api/v1/auth/login", { email, password });
      const token = extractToken(data);
      if (!token) throw new Error("API не вернул токен (login).");

      localStorage.setItem(TOKEN_KEY, token);
      setStatus("ok", "Вход выполнен.");
      location.href = "/dashboard/";
    } catch (err) {
      setStatus("err", err.message || "Ошибка входа.");
    } finally {
      $("btnLogin").disabled = false;
    }
  });

  // Register: send OTP code once
  $("formRegister").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const email = $("regEmail").value.trim();
    const phone = normalizePhone($("regPhone").value);
    const password = $("regPass").value;
    const password2 = $("regPass2").value;

    if (!email) return setStatus("err", "Укажи email.");
    if (!phone) return setStatus("err", "Телефон обязателен.");
    if (!password || password.length < 8) return setStatus("err", "Пароль минимум 8 символов.");
    if (password !== password2) return setStatus("err", "Пароли не совпадают.");

    $("btnRegister").disabled = true;
    try {
      await req("POST", "/api/v1/auth/register", { email, password, phone });

      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ email, password }));
      $("verEmailText").textContent = email;
      show("verify");
      setStatus("ok", "Код отправлен на почту. Введи 6 цифр для активации.");
      $("verCode").focus();
    } catch (err) {
      setStatus("err", err.message || "Ошибка регистрации.");
    } finally {
      $("btnRegister").disabled = false;
    }
  });

  // Verify: confirm code and then login once (store token)
  $("formVerify").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    const code = $("verCode").value.replace(/\D/g,"").slice(0,6);
    if (code.length !== 6) return setStatus("err", "Нужны 6 цифр кода.");

    const pendingRaw = sessionStorage.getItem(PENDING_KEY);
    if (!pendingRaw) return setStatus("err", "Нет данных регистрации. Вернись назад и повтори.");
    const pending = JSON.parse(pendingRaw);
    const email = String(pending.email || "").trim();
    const password = String(pending.password || "");

    $("btnVerify").disabled = true;
    try {
      const data = await req("POST", "/api/v1/auth/verify", { email, code });

      // если verify уже возвращает токен — ок
      let token = extractToken(data);

      // если verify токен не вернул — делаем обычный login (один раз)
      if (!token) {
        const login = await req("POST", "/api/v1/auth/login", { email, password });
        token = extractToken(login);
      }
      if (!token) throw new Error("API не вернул токен (verify/login).");

      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(PENDING_KEY);

      setStatus("ok", "Аккаунт активирован. Заходим в кабинет…");
      location.href = "/dashboard/";
    } catch (err) {
      setStatus("err", err.message || "Ошибка подтверждения кода.");
    } finally {
      $("btnVerify").disabled = false;
    }
  });

  $("linkBack").addEventListener("click", (e) => {
    e.preventDefault();
    clearStatus();
    show("register");
  });

  // Default view
  show("login");
})();
