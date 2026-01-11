// ABQD_AUTH_UI_v2
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function qs(name){
    const p = new URLSearchParams(location.search);
    return p.get(name) || "";
  }

  function toast(msg){
    let t = $("#abqdToast");
    if (!t){
      t = document.createElement("div");
      t.id = "abqdToast";
      t.style.cssText = `
        position:fixed;left:50%;bottom:20px;transform:translateX(-50%);
        max-width:92vw;z-index:9999;
        border:1px solid rgba(255,255,255,.18);
        background:rgba(0,0,0,.55);
        color:#fff;
        padding:10px 14px;border-radius:999px;
        font:700 13px/1.3 Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        backdrop-filter: blur(10px);
        box-shadow: 0 18px 60px rgba(0,0,0,.30);
        opacity:0;transition:opacity .18s ease;
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(window.__abqdToastTimer);
    window.__abqdToastTimer = setTimeout(() => (t.style.opacity="0"), 2600);
  }

  function lock(btn, v){
    btn.disabled = !!v;
    btn.style.opacity = v ? ".72" : "1";
    btn.style.cursor = v ? "not-allowed" : "pointer";
  }

  function show(el, v){ el.style.display = v ? "" : "none"; }

  function setMode(mode){
    $("#mode").value = mode;
    $$(".modeBtn").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
    show($("#phoneRow"), mode === "register");
    $("#submitBtn").textContent = (mode === "register") ? "Получить код" : "Получить код";
    $("#title").textContent = (mode === "register") ? "Регистрация" : "Вход";
    $("#hint").textContent = (mode === "register")
      ? "Регистрация по email + пароль. Телефон обязателен — он попадёт в CRM."
      : "Вход по email + пароль. Затем подтвердите вход кодом из письма.";
  }

  function showStep(step){
    show($("#step1"), step === 1);
    show($("#step2"), step === 2);
  }

  function cleanPhone(raw){
    return (raw || "").replace(/[^\d+]/g, "");
  }

  async function goNextAfterAuth(){
    const next = qs("next");
    if (next) { location.href = next; return; }
    // дальше решает guard: если нет доступа -> /tariffs/, если есть -> /dashboard/
    location.href = "/tariffs/";
  }

  async function tryAuto(){
    const token = window.ABQD.api.getToken();
    if (!token) return;
    const r = await window.ABQD.api.getMe();
    if (r.ok) await goNextAfterAuth();
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const mode = qs("mode") || "login";
    setMode(mode);
    showStep(1);

    $$(".modeBtn").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

    $("#phone").addEventListener("input", (e)=> e.target.value = cleanPhone(e.target.value));

    $("#form1").addEventListener("submit", async (e) => {
      e.preventDefault();
      const mode = $("#mode").value;
      const email = $("#email").value.trim();
      const password = $("#password").value;

      let phone = "";
      if (mode === "register"){
        phone = $("#phone").value.trim();
        if (!phone) { toast("Укажите телефон"); return; }
      }

      lock($("#submitBtn"), true);
      try{
        const r = (mode === "register")
          ? await window.ABQD.api.registerRequest(email, phone, password)
          : await window.ABQD.api.loginRequest(email, password);

        if (!r.ok){
          const d = r.data?.detail || "ошибка";
          if (d === "email_already_registered") toast("Email уже зарегистрирован. Войдите.");
          else if (d === "user_not_found") toast("Пользователь не найден. Зарегистрируйтесь.");
          else if (d === "wrong_password") toast("Неверный пароль.");
          else if (d === "user_not_verified") toast("Аккаунт не подтверждён. Завершите регистрацию.");
          else if (d === "password_too_short") toast("Пароль должен быть минимум 8 символов.");
          else if (d === "phone_invalid") toast("Телефон введён неверно.");
          else toast("Не удалось отправить код. Проверьте данные.");
          return;
        }

        const challenge_id = r.data.challenge_id;
        $("#challenge").value = challenge_id;
        $("#codeEmail").textContent = email;
        $("#code").value = "";
        showStep(2);
        toast("Код отправлен на почту");
      } finally {
        lock($("#submitBtn"), false);
      }
    });

    $("#form2").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("#email").value.trim();
      const challenge_id = $("#challenge").value.trim();
      const code = $("#code").value.trim();

      lock($("#verifyBtn"), true);
      try{
        const r = await window.ABQD.api.verifyCode(email, challenge_id, code);
        if (!r.ok){
          const d = r.data?.detail || "ошибка";
          if (d === "wrong_code") toast("Неверный код");
          else if (d === "code_expired") toast("Код истёк. Запросите новый.");
          else if (d === "too_many_attempts") toast("Слишком много попыток. Запросите новый код.");
          else toast("Не удалось подтвердить код");
          return;
        }
        const token = r.data.token;
        window.ABQD.api.setToken(token);
        toast("Готово. Входим…");
        setTimeout(goNextAfterAuth, 350);
      } finally {
        lock($("#verifyBtn"), false);
      }
    });

    $("#backBtn").addEventListener("click", () => showStep(1));

    await tryAuto();
  });
})();
