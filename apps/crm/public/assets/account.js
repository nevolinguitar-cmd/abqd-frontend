const API = "https://api.abqd.ru/api/v1";
const TOKEN_KEY = "abqd_token";
const SLUG_FALLBACK_KEY = "abqd_account_slug";

const $ = (id) => document.getElementById(id);

function toast(type, msg) {
  const el = $("toast");
  el.className = "toast show " + (type === "ok" ? "ok" : "err");
  el.textContent = msg;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function goLogin() {
  const next = encodeURIComponent(location.pathname + location.search);
  location.href = `/auth/?mode=login&next=${next}`;
}

function readConstructorSlug() {
  try {
    const raw = localStorage.getItem("abqd_constructor_demo_v2");
    if (!raw) return "";
    const j = JSON.parse(raw);
    return (j?.slug || j?.state?.slug || "").trim();
  } catch {
    return "";
  }
}

async function apiGet(path) {
  const t = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  const text = await res.text();
  let j;
  try { j = JSON.parse(text); } catch { j = { detail: text.slice(0, 300) }; }
  if (!res.ok) throw new Error(j.detail || `HTTP ${res.status}`);
  return j;
}

async function apiPutProfile(slug, state) {
  const t = getToken();
  const res = await fetch(`${API}/profile/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`,
    },
    body: JSON.stringify(state),
  });
  const text = await res.text();
  let j;
  try { j = JSON.parse(text); } catch { j = { detail: text.slice(0, 300) }; }
  if (!res.ok) throw new Error(j.detail || `HTTP ${res.status}`);
  return j;
}

let currentState = null;

async function load() {
  const t = getToken();
  if (!t) return goLogin();

  // 1) me
  const me = await apiGet("/auth/me");
  $("email").value = (me?.email || me?.user?.email || "").toString();
  $("meDump").textContent = JSON.stringify(me, null, 2);

  // 2) slug
  const saved = (localStorage.getItem(SLUG_FALLBACK_KEY) || "").trim();
  const fromConstructor = readConstructorSlug();
  const slug = (saved || fromConstructor || "").trim();
  if (slug) $("slug").value = slug;

  // 3) profile (если slug есть)
  if (slug) {
    const prof = await apiGet(`/profile/${encodeURIComponent(slug)}`);
    // API может возвращать либо {slug,state}, либо сразу state — страхуемся
    currentState = (prof && prof.state) ? prof.state : prof;

    $("fullName").value = (currentState?.fullName || "").toString();
    $("phone").value = (currentState?.phone || "").toString();
    $("role").value = (currentState?.role || "").toString();
    $("about").value = (currentState?.about || "").toString();
    $("logoLink").value = (currentState?.logoLink || "").toString();
  } else {
    currentState = { theme: "dark" };
  }
}

async function save() {
  const slug = $("slug").value.trim();
  if (!slug) return toast("err", "Укажи slug (или открой конструктор один раз, чтобы он появился в localStorage).");

  localStorage.setItem(SLUG_FALLBACK_KEY, slug);

  const next = {
    ...(currentState || {}),
    slug,
    fullName: $("fullName").value.trim(),
    phone: $("phone").value.trim(),
    role: $("role").value.trim(),
    about: $("about").value.trim(),
    logoLink: $("logoLink").value.trim(),
  };

  $("btnSave").disabled = true;
  try {
    await apiPutProfile(slug, next);
    currentState = next;
    toast("ok", "Сохранено ✅");
  } catch (e) {
    toast("err", "Ошибка сохранения: " + (e?.message || e));
  } finally {
    $("btnSave").disabled = false;
  }
}

$("btnSave").addEventListener("click", save);
$("btnLogout").addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  location.href = "/auth/";
});

load().catch((e) => {
  const msg = e?.message || String(e);
  if (msg.toLowerCase().includes("token") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("bad token")) {
    goLogin();
  } else {
    toast("err", msg);
  }
});
