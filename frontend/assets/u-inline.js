(function(){
  function clean(s){ return String(s == null ? '' : s).replace(/^\s+|\s+$/g,''); }

  function exactSlug(s){
    return clean(s).replace(/^\/+|\/+$/g,'');
  }

  function setErr(msg){
    var el = document.getElementById('abqdError');
    if (el) el.textContent = msg || '';
  }

  function getSlug(){
    // /u/<slug> or /u/?slug=
    var path = (location.pathname || '/').replace(/\/+$/,'');
    var parts = path.split('/').filter(Boolean);
    var idx = parts.indexOf('u');
    if (idx >= 0 && parts[idx+1] && parts[idx+1] !== 'index.html') return exactSlug(parts[idx+1]);

    try {
      var u = new URL(location.href);
      return exactSlug(u.searchParams.get('slug') || u.searchParams.get('s') || '');
    } catch(e) {
      return '';
    }
  }

  function apiOrigin(){
    try {
      var api = document.documentElement.getAttribute('data-api-origin') || '';
      if (api && /^https?:\/\//i.test(api)) return api.replace(/\/+$/,'');
    } catch(e) {}
    return location.origin;
  }

  var slug = getSlug();
  if (!slug){
    setErr('Нет slug в URL');
    if (window.ABQDProfileRender) {
      ABQDProfileRender.render({ theme:'soft', fullName:'Профиль', role:'', about:'Открой ссылку вида /u/<slug>.' });
    }
    return;
  }

  var url = apiOrigin() + '/api/v1/profile/' + encodeURIComponent(slug);

  fetch(url, { credentials: 'omit' })
    .then(function(r){
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(payload){
      var st = (window.ABQDProfileRender && ABQDProfileRender.normalize)
        ? ABQDProfileRender.normalize(payload)
        : (payload && payload.state ? payload.state : payload);

      document.title = ((st && st.fullName) || slug) || 'ABQD';

      if (window.ABQDProfileRender) {
        ABQDProfileRender.render(st || {});
      }
    })
    .catch(function(err){
      setErr('Не удалось загрузить профиль');
      if (window.ABQDProfileRender) {
        ABQDProfileRender.render({
          theme:'soft',
          fullName: slug,
          role:'',
          about:'Не удалось загрузить данные профиля.\n' + (err && err.message ? err.message : '')
        });
      }
    });
})();
