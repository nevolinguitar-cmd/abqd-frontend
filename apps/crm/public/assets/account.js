(() => {
  const API = "https://api.abqd.ru/api/v1";
  const TOKEN_KEY = "abqd_token";

  const el = (id) => document.getElementById(id);
  const toast = el("toast");

  const showToast = (type, msg) => {
    toast.className = "toast show " + (type || "");
    toast.textContent = msg;
  };

  const token = () => localStorage.getItem(TOKEN_KEY) || "";
  const authed = () => !!token();

  const redirectToAuth = () => {
    const next = encodeURIComponent(location.href);
    location.href = `/auth/?mode=login&next=${next}`;
  };

  async function apiFetch(path, opts = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    if (authed()) headers["Authorization"] = `Bearer ${token()}`;
    const res = await fetch(`${API}${path}`, Object.assign({}, opts, { headers }));
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) {
      const msg = (json && (json.detail || json.message)) || text || `HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return json;
  }

  // Пытаемся максимально надёжно определить slug
  function resolveSlug(me) {
    const urlSlug = new URL(location.href).searchParams.get("slug");
    if (urlSlug) return urlSlug;

    if (me && (me.slug || me.profile_slug)) return (me.slug || me.profile_slug);

    // Конструктор обычно хранит state в localStorage
    const keys = ["abqd_constructor_demo_v2", "abqd_constructor_demo", "abqd_profile_state", "abqd_slug", "abqd_last_slug"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;

      // если это просто slug строкой
      if (k === "abqd_slug" || k === "abqd_last_slug") return raw;

      try {
        const j = JSON.parse(raw);
        if (j && typeof j === "object") {
          if (j.slug) return j.slug;
          if (j.state && j.state.slug) return j.state.slug;
        }
      } catch {}
    }
    return "";
  }

  let ME = null;
  let SLUG = "";
  let PROFILE = null;

  async function load() {
    if (!authed()) return redirectToAuth();

    try {
      // У вас есть /api/v1/auth/me и /api/v1/me — берём auth/me
      ME = await apiFetch("/auth/me", { method: "GET" });
    } catch (e) {
      // если токен битый/просроченный
      if (e.status === 401 || /bad token/i.test(e.message)) return redirectToAuth();
      showToast("err", "Не удалось загрузить пользователя: " + e.message);
      return;
    }

    el("meEmail").value = ME.email || ME.username || "—";
    SLUG = resolveSlug(ME);
    el("meSlug").value = SLUG || "—";

    if (!SLUG) {
      el("kvHint").innerHTML =
        'Slug не найден. Открой <a href="/constructor/">Конструктор</a>, сохрани профиль, затем вернись сюда.';
      showToast("err", "Slug не найден. Сначала сохрани профиль в Конструкторе.");
      return;
    }

    // Ссылка на публичный профиль
    const btnOpen = el("btnOpenProfile");
    btnOpen.style.display = "";
    btnOpen.href = `/u/${encodeURIComponent(SLUG)}`;

    try {
      // GET профиля (лучше с токеном, но можно и публично)
      PROFILE = await apiFetch(`/profile/${encodeURIComponent(SLUG)}`, { method: "GET" });
      const state = (PROFILE && PROFILE.state) ? PROFILE.state : PROFILE;

      el("fullName").value = state.fullName || "";
      el("role").value = state.role || "";
      el("phone").value = state.phone || "";
      el("logoLink").value = state.logoLink || "";
      el("about").value = state.about || "";

      showToast("ok", "Данные загружены.");
    } catch (e) {
      showToast("err", "Не удалось загрузить профиль: " + e.message);
    }
  }

  async function save() {
    if (!SLUG) return;

    const btn = el("btnSave");
    btn.disabled = true;

    try {
      // Берём текущий state, если был, чтобы не затереть поля
      const baseState = (PROFILE && PROFILE.state) ? PROFILE.state : (PROFILE || {});
      const nextState = Object.assign({}, baseState, {
        slug: SLUG,
        fullName: el("fullName").value.trim(),
        role: el("role").value.trim(),
        phone: el("phone").value.trim(),
        logoLink: el("logoLink").value.trim(),
        about: el("about").value.trim(),
      });

      // В вашем проекте constructor шлёт PUT /profile/{slug} {state} (без обёртки)
      await apiFetch(`/profile/${encodeURIComponent(SLUG)}`, {
        method: "PUT",
        body: JSON.stringify(nextState),
      });

      showToast("ok", "Сохранено.");
    } catch (e) {
      showToast("err", "Ошибка сохранения: " + e.message);
    } finally {
      btn.disabled = false;
    }
  }

  // logout — просто чистим токен
  el("btnLogout").addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    redirectToAuth();
  });

  el("btnSave").addEventListener("click", save);

  load();
})();
