/* ABQD • profile-render.js • v1 • 2026-01-08
   Один рендер для constructor и /u
   ES5 compatible
*/
(function (w) {
  function $(id){ return document.getElementById(id); }
  function clean(s){ return String(s == null ? '' : s).replace(/^\s+|\s+$/g,''); }

  function normUrl(u){
    u = clean(u);
    if (!u) return '';
    var low = u.toLowerCase();
    if (low.indexOf('http://') === 0 || low.indexOf('https://') === 0) return u;
    if (low.indexOf('mailto:') === 0 || low.indexOf('tel:') === 0 || low.indexOf('tg://') === 0) return u;
    return 'https://' + u;
  }

  function contactUrl(u){
    u = clean(u);
    if (!u) return '';
    var low = u.toLowerCase();
    if (low.indexOf('http://') === 0 || low.indexOf('https://') === 0 || low.indexOf('mailto:') === 0 || low.indexOf('tel:') === 0 || low.indexOf('tg://') === 0) return u;
    if (u.indexOf('@') !== -1 && u.indexOf(' ') === -1) return 'mailto:' + u;

    if (u && (u[0] === '+' || (u[0] >= '0' && u[0] <= '9')) && u.length >= 6) {
      if (/^[0-9\s()\-\.+]+$/.test(u)) {
        var digits = u.replace(/[\s\-().]/g, '');
        return 'tel:' + digits;
      }
    }
    return 'https://' + u;
  }

  function phoneToTel(s){
    s = clean(s);
    if (!s) return '';
    var out = '';
    for (var i=0;i<s.length;i++){
      var ch = s.charAt(i);
      if (ch >= '0' && ch <= '9') out += ch;
      else if (ch === '+' && out.length === 0) out += ch;
    }
    var digits = (out.charAt(0) === '+') ? out.slice(1) : out;
    if (digits.length < 6) return '';
    return 'tel:' + out;
  }

  function wrapFixedChars(text, n){
    text = String(text == null ? '' : text);
    n = (typeof n === 'number' && n > 0) ? n : 17;
    if (!text) return text;
    var lines = text.split(/\r?\n/);
    var out = [];
    for (var li=0; li<lines.length; li++){
      var line = lines[li];
      if (line.length <= n) { out.push(line); continue; }
      for (var i=0;i<line.length;i+=n) out.push(line.slice(i, i+n));
    }
    return out.join('\n');
  }

  function applyTheme(theme){
    if (theme !== 'dark' && theme !== 'soft') theme = 'soft';
    document.documentElement.setAttribute('data-theme', theme);
  }

  // ===== adapter: API payload -> constructor-like state =====
  function pick(){
    for (var i=0;i<arguments.length;i++){
      var v = arguments[i];
      if (v == null) continue;
      if (typeof v === 'string' && clean(v)) return clean(v);
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    }
    return '';
  }

  function normalizeBtnStyle(s){
    s = (s || '').toString().toLowerCase();
    if (s === 'primary' || s === 'accent') return 'primary';
    return 'ghost';
  }

  function apiToConstructorState(payload){
    // payload can be:
    //  A) {slug, state: <constructor-state>}  (мы так сохраняем сейчас)
    //  B) {slug, state: {profile:{name,...}, buttons...}}  (state-based)
    //  C) {slug, profile:{...}} (старое / не используем, но терпим)
    var st = payload && payload.state ? payload.state : (payload || {});
    if (!st || typeof st !== 'object') st = {};

    // looks-like old constructor
    var looksOld = (typeof st.fullName === 'string') || (typeof st.avatarDataUrl === 'string') || Array.isArray(st.points) || Array.isArray(st.gallery);
    if (looksOld) return st;

    // state-based -> build old-like to reuse renderer
    var p = (st && st.profile) ? st.profile : {};
    var out = {};
    out.theme = pick(st.theme, 'soft');

    out.fullName = pick(p.name, p.fullName, payload && payload.title, 'Профиль');
    out.role     = pick(p.role, p.subtitle, p.tagline, '');
    out.about    = pick(p.about, p.bio, payload && payload.description, '');

    out.phone    = pick(p.phone, p.tel, p.mobile, '');
    out.callStyle = normalizeBtnStyle(p.callStyle || st.callStyle || 'ghost');

    out.avatarDataUrl = pick(p.avatarUrl, p.avatar, p.avatarDataUrl, '');
    out.bannerDataUrl = pick(p.bannerUrl, p.bannerDataUrl, '');
    out.logoDataUrl   = pick(p.logoUrl, p.logoDataUrl, '');
    out.logoLink      = pick(p.logoLink, '');

    out.buttons = Array.isArray(st.buttons) ? st.buttons : [];
    for (var i=0;i<out.buttons.length;i++){
      if (out.buttons[i]) out.buttons[i].style = normalizeBtnStyle(out.buttons[i].style);
    }

    out.pointsTitle = pick(st.pointsTitle, 'Ссылки');
    out.points      = Array.isArray(st.points) ? st.points : [];

    out.galleryTitle = pick(st.galleryTitle, 'Работы');
    out.gallery      = Array.isArray(st.gallery) ? st.gallery : [];

    out.chips = Array.isArray(st.chips) ? st.chips : [];
    return out;
  }

  // ===== renderer: uses IDs from constructor preview =====
  function render(state){
    state = state || {};
    applyTheme(state.theme || 'soft');

    var nameRaw = clean(state.fullName);
    var nameEmpty = !nameRaw;
    var showName = nameEmpty ? 'Профиль' : nameRaw;

    var nameEl = $('nameEl');
    if (nameEl){
      nameEl.textContent = showName;
      if (nameEl.classList) nameEl.classList.toggle('ph', nameEmpty);
    }

    var roleRaw = clean(state.role);
    var roleEl = $('roleEl');
    if (roleEl){
      roleEl.textContent = roleRaw || '';
      if (roleEl.classList) roleEl.classList.toggle('ph', !roleRaw);
    }

    var aboutEl = $('aboutEl');
    if (aboutEl) aboutEl.textContent = state.about || '';

    // banner + logo
    var banner = $('bannerBox');
    var plh = $('bannerPlh');
    var hasBanner = !!clean(state.bannerDataUrl);
    if (plh) plh.style.display = hasBanner ? 'none' : 'flex';

    if (banner){
      banner.innerHTML = '';
      if (plh) banner.appendChild(plh);

      if (hasBanner){
        var imgB = document.createElement('img');
        imgB.src = state.bannerDataUrl;
        imgB.alt = 'banner';
        banner.insertBefore(imgB, banner.firstChild);

        if (clean(state.logoDataUrl)){
          var link = clean(state.logoLink) ? normUrl(state.logoLink) : '';
          var a = document.createElement('a');
          a.className = 'bannerLogo';
          a.href = link || '#';
          a.target = '_blank';
          a.rel = 'noopener';
          if (!link) a.style.pointerEvents = 'none';

          var li = document.createElement('img');
          li.src = state.logoDataUrl;
          li.alt = 'logo';
          a.appendChild(li);
          banner.appendChild(a);
        }
      }
    }

    // avatar
    var av = $('avatarBox');
    if (av){
      av.innerHTML = '';
      if (clean(state.avatarDataUrl)){
        var imgA = document.createElement('img');
        imgA.src = state.avatarDataUrl;
        imgA.alt = 'avatar';
        av.appendChild(imgA);
      } else {
        var letter = (nameRaw || 'A').slice(0,1).toUpperCase();
        var span = document.createElement('span');
        span.className = 'fallback';
        span.textContent = letter;
        av.appendChild(span);
      }
    }

    // CTA + call button
    var cta = $('ctaRow');
    if (cta){
      cta.innerHTML = '';
      var phoneRaw = clean(state.phone);
      var hasPhone = !!phoneRaw;

      if (hasPhone){
        var tel = phoneToTel(phoneRaw);
        var callBtn = document.createElement('a');
        callBtn.textContent = 'Позвонить';
        callBtn.className = (state.callStyle === 'primary') ? 'primary' : '';
        callBtn.href = tel || '#';
        callBtn.target = '_self';
        callBtn.rel = 'nofollow';
        if (!tel){ callBtn.style.opacity='.55'; callBtn.style.pointerEvents='none'; }
        cta.appendChild(callBtn);
      }

      var maxButtons = hasPhone ? 5 : 6;
      var btns = Array.isArray(state.buttons) ? state.buttons : [];
      for (var bi=0; bi<btns.length && bi<maxButtons; bi++){
        var btn = btns[bi];
        if (!btn || !clean(btn.label)) continue;
        var a2 = document.createElement('a');
        a2.textContent = btn.label;
        a2.className = (btn.style === 'primary') ? 'primary' : '';
        a2.href = normUrl(btn.url) || '#';
        a2.target = '_blank';
        a2.rel = 'noopener';
        if (!clean(btn.url)) a2.style.opacity = '.55';
        cta.appendChild(a2);
      }
    }

    // Contacts
    var contactsSection = $('contactsSection');
    var contactsPreview = $('contactsPreview');
    var hasContacts = false;

    var chips = Array.isArray(state.chips) ? state.chips : [];
    if (contactsPreview){
      contactsPreview.innerHTML = '';
      for (var ci=0; ci<chips.length && ci<20; ci++){
        var c = chips[ci] || {};
        var label = clean(c.label);
        var rawUrl = clean(c.url);
        var iconValue = clean(c.icon);

        if (!label && !rawUrl) continue;
        hasContacts = true;

        var a3 = document.createElement('a');
        a3.className = 'chipA';

        if (iconValue){
          var icon = document.createElement('span');
          icon.className = 'chipI';
          icon.textContent = iconValue;
          a3.appendChild(icon);
        }

        var text = document.createElement('span');
        text.textContent = label || rawUrl;
        a3.appendChild(text);

        var href = contactUrl(rawUrl);
        a3.href = href || '#';
        a3.target = '_blank';
        a3.rel = 'noopener';
        if (!href){ a3.style.opacity='.55'; a3.style.pointerEvents='none'; }

        contactsPreview.appendChild(a3);
      }
    }
    if (contactsSection && contactsSection.classList) contactsSection.classList.toggle('hide', !hasContacts);

    // Points
    var pointsTitleEl = $('pointsTitleEl');
    if (pointsTitleEl) pointsTitleEl.textContent = state.pointsTitle || 'Ссылки';

    var pl2 = $('pointsPreview');
    var pts = Array.isArray(state.points) ? state.points : [];
    if (pl2){
      pl2.innerHTML = '';
      for (var pi=0; pi<pts.length && pi<12; pi++){
        var p = pts[pi];
        if (!p || !clean(p.title)) continue;

        var el = document.createElement('div');
        el.className = 'item';

        var chk = document.createElement('div');
        chk.className = 'check';
        chk.textContent = '✓';

        var box = document.createElement('div');
        box.style.minWidth = '0';

        var t2 = document.createElement('p');
        t2.className = 'itT';
        t2.textContent = p.title;
        box.appendChild(t2);

        if (clean(p.text)){
          var d = document.createElement('div');
          d.className = 'itD';
          d.textContent = p.text;
          box.appendChild(d);
        }

        if (clean(p.url)){
          var link2 = document.createElement('a');
          link2.className = 'mini';
          link2.href = normUrl(p.url);
          link2.target = '_blank';
          link2.rel = 'noopener';
          link2.textContent = 'Открыть ссылку';
          box.appendChild(link2);
        }

        el.appendChild(chk);
        el.appendChild(box);
        pl2.appendChild(el);
      }
    }

    var pointsSection = $('pointsSection');
    if (pointsSection && pointsSection.classList) pointsSection.classList.toggle('hide', !(pts && pts.length));

    // Gallery
    var galleryTitleEl = $('galleryTitleEl');
    if (galleryTitleEl) galleryTitleEl.textContent = state.galleryTitle || 'Работы';

    var gg = $('galleryPreview');
    var gal = Array.isArray(state.gallery) ? state.gallery : [];
    if (gg){
      gg.innerHTML = '';
      for (var gi=0; gi<gal.length && gi<12; gi++){
        (function(g){
          if(!g) return;
          var card = document.createElement('div');
          card.className = 'work';

          var imgWrap = document.createElement('div');
          imgWrap.className = 'workImg';
          if (clean(g.img)){
            var img = document.createElement('img');
            img.src = g.img;
            img.alt = '';
            imgWrap.appendChild(img);
          }

          var body = document.createElement('div');
          body.className = 'workBody';

          var title = document.createElement('p');
          title.className = 'workT';
          title.textContent = wrapFixedChars(clean(g.title || ''), 17);
          body.appendChild(title);

          if (clean(g.text)){
            var desc = document.createElement('div');
            desc.className = 'workM';
            desc.textContent = g.text;
            body.appendChild(desc);
          }

          card.appendChild(imgWrap);
          card.appendChild(body);

          card.addEventListener('click', function(){
            if (clean(g.url)) window.open(normUrl(g.url), '_blank', 'noopener');
          });

          gg.appendChild(card);
        })(gal[gi]);
      }
    }

    var gallerySection = $('gallerySection');
    if (gallerySection && gallerySection.classList) gallerySection.classList.toggle('hide', !(gal && gal.length));

    // optional footer (если элемент есть)
    var footer = $('profileFooter');
    if (footer){
      var year = new Date().getFullYear();
      footer.innerHTML = ''; try{ footer.style.display='none'; }catch(_e){}
    }
  }

  w.ABQDProfileRender = {
    applyTheme: applyTheme,
    render: render,
    apiToConstructorState: apiToConstructorState,
    normUrl: normUrl,
    contactUrl: contactUrl,
    phoneToTel: phoneToTel,
    wrapFixedChars: wrapFixedChars
  };
})(window);

