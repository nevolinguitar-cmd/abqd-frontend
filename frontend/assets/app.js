/* ABQD Frontend Core (UI-guards + trial + publish + public profile) */
(() => {
  const ABQD = (window.ABQD = window.ABQD || {});

  // ---- Config
  ABQD.API_BASE = "/api/v1";
  ABQD.TOKEN_KEY = "abqd_token";
  ABQD.TRIAL_UNTIL_KEY = "abqd_trial_until";      // ms epoch
  ABQD.PLAN_KEY = "abqd_plan";                    // e.g. "paid"
  ABQD.PROFILE_SLUG_KEY = "abqd_profile_slug";    // last published slug
  ABQD.CONSTRUCTOR_STATE_KEY = "abqd_constructor_demo_v2";

  // Base prefix for previews (/__stage or /__prod) so links work there too
  ABQD.base = (() => {
    const p = location.pathname;
    if (p.startsWith("/__stage/")) return "/__stage";
    if (p.startsWith("/__prod/")) return "/__prod";
    return "";
  })();

  ABQD.path = (p) => ABQD.base + p; // p must start with "/"
  ABQD.go = (p) => (location.href = ABQD.path(p));

  ABQD.getToken = () => localStorage.getItem(ABQD.TOKEN_KEY) || "";
  ABQD.isLoggedIn = () => !!ABQD.getToken();
  ABQD.setToken = (t) => localStorage.setItem(ABQD.TOKEN_KEY, t);
  ABQD.logout = () => {
    localStorage.removeItem(ABQD.TOKEN_KEY);
    ABQD.go("/auth/");
  };

  ABQD.startTrialIfMissing = () => {
    const until = Number(localStorage.getItem(ABQD.TRIAL_UNTIL_KEY) || "0");
    if (!until) {
      const ms7d = 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(ABQD.TRIAL_UNTIL_KEY, String(Date.now() + ms7d));
    }
  };

  ABQD.getTrialUntil = () => Number(localStorage.getItem(ABQD.TRIAL_UNTIL_KEY) || "0");
  ABQD.isTrialActive = () => Date.now() < ABQD.getTrialUntil();
  ABQD.getPlan = () => localStorage.getItem(ABQD.PLAN_KEY) || "";
  ABQD.hasPaidPlan = () => ABQD.getPlan() === "paid";

  // For demo/testing from UI (until payment integration)
  ABQD.devSetPaidPlan = () => localStorage.setItem(ABQD.PLAN_KEY, "paid");
  ABQD.devClearPlan = () => localStorage.removeItem(ABQD.PLAN_KEY);

  ABQD.canUseConstructor = () => ABQD.isTrialActive() || ABQD.hasPaidPlan();
  ABQD.canUseCRM = () => ABQD.hasPaidPlan();

  ABQD.fetchJSON = async (url, opts = {}) => {
    const headers = new Headers(opts.headers || {});
    headers.set("Accept", "application/json");
    if (!headers.has("Content-Type") && opts.method && opts.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }
    const token = ABQD.getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(url, { ...opts, headers });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json().catch(() => null) : await res.text();
    if (!res.ok) {
      const msg = (data && data.message) || (typeof data === "string" ? data : "") || `${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
    return data;
  };

  // ---- Guards (UI-only; server must enforce later)
  ABQD.guard = (page) => {
    // public pages
    if (page === "home" || page === "auth" || page === "u") return;

    // 1) no token -> auth
    if (!ABQD.isLoggedIn()) return ABQD.go("/auth/");

    // 2) tariffs only for logged in
    if (page === "tariffs") return;

    // 3) constructor: logged + (trial OR paid)
    if (page === "constructor") {
      if (!ABQD.canUseConstructor()) return ABQD.go("/tariffs/");
      return;
    }

    // 4) crm: logged + paid
    if (page === "crm") {
      if (!ABQD.canUseCRM()) return ABQD.go("/tariffs/");
      return;
    }
  };

  // ---- Publish profile from constructor state
  ABQD.publishFromLocalState = async ({ slug }) => {
    if (!slug) throw new Error("Нет slug. Укажи slug (например alex_nevolin)");
    const raw = localStorage.getItem(ABQD.CONSTRUCTOR_STATE_KEY);
    if (!raw) throw new Error(`Нет state в localStorage по ключу ${ABQD.CONSTRUCTOR_STATE_KEY}`);

    let state = null;
    try { state = JSON.parse(raw); } catch { throw new Error("State конструктора не JSON"); }

    // minimal payload: state + meta
    const payload = { slug, state, updated_at: new Date().toISOString() };

    await ABQD.fetchJSON(`${ABQD.API_BASE}/profile/${encodeURIComponent(slug)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    localStorage.setItem(ABQD.PROFILE_SLUG_KEY, slug);
    return slug;
  };

  ABQD.getSlugFromPath = () => {
    // supports: /u/slug , /u/slug/ , /__stage/u/slug/
    const p = location.pathname.startsWith(ABQD.base) ? location.pathname.slice(ABQD.base.length) : location.pathname;
    const m = p.match(/^\/u\/([^\/\?#]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  };

  // ---- Public profile render (simple; you can replace markup later)
  ABQD.renderPublicProfile = async (rootEl) => {
    const slug = ABQD.getSlugFromPath();
    if (!slug) {
      rootEl.innerHTML = `<div class="card"><h2>Нет slug</h2><p>Открой ссылку вида <b>/u/&lt;slug&gt;</b></p></div>`;
      return;
    }

    rootEl.innerHTML = `<div class="card"><h2>Загрузка профиля…</h2><p class="muted">${slug}</p></div>`;

    try {
      const data = await ABQD.fetchJSON(`${ABQD.API_BASE}/profile/${encodeURIComponent(slug)}`, { method: "GET" });

      // if backend returns {state:{...}} – show basic fields
      const state = data?.state || data?.profile || data || {};
      const name = state?.profile?.name || state?.name || slug;
      const bio = state?.profile?.bio || state?.bio || "";
      const avatar = state?.profile?.avatar || state?.avatar || "";

      const btnEdit = ABQD.isLoggedIn() && ABQD.canUseConstructor()
        ? `<a class="btn" href="${ABQD.path(`/constructor/?slug=${encodeURIComponent(slug)}`)}">Редактировать</a>`
        : `<a class="btn ghost" href="${ABQD.path(`/tariffs/`)}">Оплатить / открыть доступ</a>`;

      rootEl.innerHTML = `
        <div class="card">
          <div class="row">
            <div class="ava">${avatar ? `<img src="${avatar}" alt="">` : `<span>${String(name).slice(0,1).toUpperCase()}</span>`}</div>
            <div style="flex:1">
              <h2 style="margin:0 0 6px">${escapeHtml(name)}</h2>
              ${bio ? `<p class="muted" style="margin:0">${escapeHtml(bio)}</p>` : `<p class="muted" style="margin:0">Публичный профиль</p>`}
            </div>
          </div>
          <div class="actions">
            ${btnEdit}
            <button class="btn ghost" id="copyLink">Скопировать ссылку</button>
          </div>
        </div>
      `;

      const copyBtn = rootEl.querySelector("#copyLink");
      copyBtn?.addEventListener("click", async () => {
        await navigator.clipboard.writeText(location.origin + ABQD.path(`/u/${encodeURIComponent(slug)}`));
        copyBtn.textContent = "Скопировано";
        setTimeout(() => (copyBtn.textContent = "Скопировать ссылку"), 1200);
      });

    } catch (e) {
      rootEl.innerHTML = `
        <div class="card">
          <h2>Профиль не найден</h2>
          <p class="muted">${escapeHtml(String(e?.message || e))}</p>
          <p>Опубликуй профиль из конструктора.</p>
          <a class="btn" href="${ABQD.path(`/constructor/`)}">Перейти в конструктор</a>
        </div>
      `;
    }
  };

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  // signal ready
  ABQD.ready = (fn) => fn && fn();
})();
