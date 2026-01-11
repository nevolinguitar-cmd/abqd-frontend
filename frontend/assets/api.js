// ABQD_API_v4 (auth email+password+otp)
(function () {
  const API_BASE = "https://api.abqd.ru";
  const TOKEN_KEY = "abqd_token";

  async function jfetch(path, opts = {}) {
    const url = API_BASE + path;
    const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    const res = await fetch(url, { ...opts, headers });
    let data = null;
    try { data = await res.json(); } catch (_) {}
    return { ok: res.ok, status: res.status, data };
  }

  function getToken(){ return localStorage.getItem(TOKEN_KEY) || ""; }
  function setToken(t){ localStorage.setItem(TOKEN_KEY, t); }
  function clearToken(){ localStorage.removeItem(TOKEN_KEY); }

  // Auth
  const registerRequest = (email, phone, password) =>
    jfetch("/api/v1/auth/register/request", { method:"POST", body: JSON.stringify({ email, phone, password }) });

  const loginRequest = (email, password) =>
    jfetch("/api/v1/auth/login/request", { method:"POST", body: JSON.stringify({ email, password }) });

  const verifyCode = (email, challenge_id, code) =>
    jfetch("/api/v1/auth/verify", { method:"POST", body: JSON.stringify({ email, challenge_id, code }) });

  const getMe = () => jfetch("/api/v1/auth/me", { method:"GET" });

  const startTrial = () => jfetch("/api/v1/auth/start-trial", { method:"POST", body: JSON.stringify({}) });

  window.ABQD = window.ABQD || {};
  window.ABQD.api = {
    API_BASE, TOKEN_KEY,
    getToken, setToken, clearToken,
    registerRequest, loginRequest, verifyCode,
    getMe, startTrial
  };
})();
