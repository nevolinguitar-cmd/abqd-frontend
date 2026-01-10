// ABQD_API_v1
(function () {
  const API_BASE = "https://api.abqd.ru";
  const TOKEN_KEY = "abqd_token";

  function getToken(){ return localStorage.getItem(TOKEN_KEY) || ""; }
  function authHeaders(){
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async function apiFetch(path, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: opts.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(opts.headers || {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    return res;
  }

  async function getMe(){
    const res = await apiFetch("/api/v1/me");
    if (res.status === 401) return { ok:false, status:401 };
    if (!res.ok) return { ok:false, status:res.status };
    const data = await res.json();
    return { ok:true, data };
  }

  async function startTrial(){
    const res = await apiFetch("/api/v1/subscription/start-trial", { method:"POST" });
    if (res.status === 401) return { ok:false, status:401 };
    if (!res.ok) return { ok:false, status:res.status, text: await res.text().catch(()=>"") };
    const data = await res.json().catch(()=> ({}));
    return { ok:true, data };
  }

  window.ABQD = window.ABQD || {};
  window.ABQD.api = { API_BASE, TOKEN_KEY, getToken, apiFetch, getMe, startTrial };
})();
