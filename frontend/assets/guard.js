// ABQD_GUARD_v1
(function () {
  function go(url){ if (location.pathname !== url) location.href = url; }
  function nextParam(){
    const next = encodeURIComponent(location.pathname + location.search);
    return `?next=${next}`;
  }

  // options:
  // requireAuth: redirect to /auth/ if 401
  // requireAccess: redirect to /tariffs/ if plan not allowed
  // allowPlans: ['trial','paid'] by default
  async function guard(options = {}){
    const {
      requireAuth = true,
      requireAccess = true,
      allowPlans = ["trial","paid"],
      onMe = null,
    } = options;

    if (!window.ABQD?.api?.getMe) {
      console.warn("ABQD.guard: api.js missing");
      return;
    }

    const r = await window.ABQD.api.getMe();
    if (!r.ok){
      if (r.status === 401 && requireAuth){
        go("/auth/" + nextParam());
      }
      return;
    }

    const me = r.data;
    window.ABQD.me = me;

    if (typeof onMe === "function") onMe(me);

    if (!requireAccess) return;

    let access = null;
    try {
      const token = window.ABQD?.api?.getToken ? window.ABQD.api.getToken() : "";
      const r2 = await fetch((window.ABQD?.api?.API_BASE || "https://api.abqd.ru") + "/api/v1/access/status", {
        method: "GET",
        headers: token ? { "Authorization": "Bearer " + token } : {}
      });
      if (r2.ok) {
        access = await r2.json();
      }
    } catch (e) {
      console.warn("ABQD.guard: access/status failed, skip redirect", e);
    }

    if (!access) return;

    const accessKinds = [];
    if (access.trial_active) accessKinds.push("trial");
    if (access.paid_active) accessKinds.push("paid");

    const ok = accessKinds.some(v => allowPlans.includes(v));
    if (!ok){
      go("/tariffs/");
    }
  }

  window.ABQD = window.ABQD || {};
  window.ABQD.guard = guard;
})();
