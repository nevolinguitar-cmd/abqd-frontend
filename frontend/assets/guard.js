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

    const plan = (me && me.plan) ? String(me.plan) : "none";
    const ok = allowPlans.includes(plan);
    if (!ok){
      go("/tariffs/");
    }
  }

  window.ABQD = window.ABQD || {};
  window.ABQD.guard = guard;
})();
