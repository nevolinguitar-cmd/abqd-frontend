(function(){
  function clean(s){ return String(s == null ? '' : s).replace(/^\s+|\s+$/g,''); }
  function normalizeSlug(s){
    s = clean(s).toLowerCase();
    if (!s) return '';
    var allowed = 'abcdefghijklmnopqrstuvwxyz0123456789-_.';
    var out = '';
    var prevDash = false;
    for (var i=0;i<s.length;i++){
      var ch = s.charAt(i);
      if (ch === ' ') { if(!prevDash){ out+='-'; prevDash=true; } continue; }
      if (allowed.indexOf(ch) !== -1){ out += ch; prevDash = (ch==='-'); }
      else { if(!prevDash){ out+='-'; prevDash=true; } }
    }
    while(out.indexOf('--')!==-1) out = out.replace(/--/g,'-');
    while(out.charAt(0)==='-'||out.charAt(0)==='.') out = out.slice(1);
    while(out.charAt(out.length-1)==='-'||out.charAt(out.length-1)==='.') out = out.slice(0,-1);
    return out;
  }

  function getSlug(){
    // /u/<slug> or /u/?slug=
    var path = (location.pathname || '/').replace(/\/+$/,'');
    var parts = path.split('/').filter(Boolean);
    var idx = parts.indexOf('u');
    if (idx >= 0 && parts[idx+1] && parts[idx+1] !== 'index.html') return normalizeSlug(parts[idx+1]);
    try{
      var u = new URL(location.href);
      return normalizeSlug(u.searchParams.get('slug') || u.searchParams.get('s') || '');
    }catch(_e){ return ''; }
  }

  function apiOrigin(){
    try{
      var u = new URL(location.href);
      var api = clean(u.searchParams.get('api') || '');
      if (api && /^https?:\/\//i.test(api)) return api.replace(/\/+$/,'');
    }catch(_e){}
    return 'https://api.abqd.ru';
  }

  function setErr(msg){
    var el = document.getElementById('err');
    if (el) el.textContent = msg || '';
  }

  var slug = getSlug();
  if (!slug){
    setErr('Нет slug в URL');
    ABQDProfileRender.render({ theme:'soft', fullName:'Профиль', role:'', about:'Открой ссылку вида /u/<slug>.' });
    return;
  }

  var url = apiOrigin() + '/api/v1/profile/' + encodeURIComponent(slug);

  fetch(url, { method:'GET' })
    .then(function(r){ return r.text().then(function(t){ return { ok:r.ok, status:r.status, text:t }; }); })
    .then(function(x){
      if (!x.ok) throw new Error('HTTP ' + x.status);
      var json = {};
      try{ json = x.text ? JSON.parse(x.text) : {}; }catch(_e){ json = {}; }
      var st = ABQDProfileRender.apiToConstructorState(json);
      ABQDProfileRender.render(st);
      document.title = (st.fullName || slug) || 'ABQD';
    })
    .catch(function(err){
      setErr('Ошибка загрузки профиля');
      ABQDProfileRender.render({ theme:'soft', fullName:slug, role:'', about:'Не удалось загрузить данные профиля.\n' + (err && err.message ? err.message : '') });
    });
})();
