(function(){
  // ES5‑совместимая версия (убрали const/let/=>/template strings), чтобы не ловить SyntaxError на старых движках.

  var KEY = 'abqd_constructor_demo_v2';
  var BUILD = 'Конструктор NFC 1.1';
  try { window.__ABQD_CONSTRUCTOR_BUILD = BUILD; } catch(e) {}
  function $(id){ return document.getElementById(id); }

  function clone(obj){
    try { return JSON.parse(JSON.stringify(obj)); }
    catch(e){ return {}; }
  }

  var defaultState = {
    slug: 'ivan-ivanov',
    theme: 'soft',
    fullName: 'Иванов Иван Иванович',
    role: 'АРХИТЕКТОР & ДИЗАЙНЕР',
    about: 'Профессиональный архитектор с опытом разработки жилых и коммерческих проектов. Специализируюсь на создании функциональных и эстетичных пространств, где каждый элемент работает в гармонии.',
    avatarDataUrl: '',
    bannerDataUrl: '',
    logoDataUrl: '',
    logoLink: 'https://abqd.ru',
    phone: '',
    callStyle: 'ghost',
    buttons: [
      { label: 'Написать', url: 'https://t.me/', style: 'primary' }
    ],
    pointsTitle: 'Ссылки',
    points: [
      { title: 'Архитектурное проектирование', text: '', url: '' },
      { title: 'Дизайн интерьера', text: '', url: '' },
      { title: '3D визуализация проектов', text: '', url: '' },
      { title: 'Консультации и аудит', text: '', url: '' }
    ],
    galleryTitle: 'Работы',
    gallery: [
      { title: 'Проект 1', text: 'Короткое описание', img: '', url: '' },
      { title: 'Проект 2', text: 'Короткое описание', img: '', url: '' },
      { title: 'Проект 3', text: 'Короткое описание', img: '', url: '' }
    ],
    chips: [
      { label: 'Telegram', url: 'https://t.me/', icon: '' },
      { label: 'WhatsApp', url: 'https://wa.me/', icon: '' },
      { label: 'Сайт', url: 'https://', icon: '' }
    ]
  };

  function escapeHtml(s){
    s = String(s == null ? '' : s);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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

    var s = u;
    if (s && (s[0] === '+' || (s[0] >= '0' && s[0] <= '9')) && s.length >= 6) {
      if (/^[0-9\s()\-\.+]+$/.test(s)) {
        var digits = s.replace(/[\s\-().]/g, '');
        return 'tel:' + digits;
      }
    }

    return 'https://' + u;
  }

  function phoneToTel(s){
    s = clean(s);
    if (!s) return '';

    // собираем только цифры, плюс допускаем только в начале
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch >= '0' && ch <= '9') out += ch;
      else if (ch === '+' && out.length === 0) out += ch;
    }

    var digits = (out.charAt(0) === '+') ? out.slice(1) : out;
    if (digits.length < 6) return '';

    return 'tel:' + out;
  }

  function contactIcon(icon){ return clean(icon); }

  function wrapFixedChars(text, n){
    text = String(text == null ? '' : text);
    n = (typeof n === 'number' && n > 0) ? n : 17;
    if (!text) return text;

    var lines = text.split(/\r?\n/);
    var out = [];
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      if (line.length <= n) { out.push(line); continue; }
      for (var i = 0; i < line.length; i += n) out.push(line.slice(i, i + n));
    }
    return out.join('\n');
  }

  function normalizeSlug(s){
    s = clean(s).toLowerCase();
    if (!s) return '';

    var allowed = 'abcdefghijklmnopqrstuvwxyz0123456789-_.';
    var out = '';
    var prevDash = false;

    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === ' ') {
        if (!prevDash) { out += '-'; prevDash = true; }
        continue;
      }
      if (allowed.indexOf(ch) !== -1) {
        out += ch;
        prevDash = (ch === '-');
      } else {
        if (!prevDash) { out += '-'; prevDash = true; }
      }
    }

    while (out.indexOf('--') !== -1) out = out.replace(/--/g, '-');
    while (out.charAt(0) === '-' || out.charAt(0) === '.') out = out.slice(1);
    while (out.charAt(out.length - 1) === '-' || out.charAt(out.length - 1) === '.') out = out.slice(0, -1);

    return out;
  }

  function load(){
    var st = clone(defaultState);
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return st;
      var parsed = JSON.parse(raw);
      for (var k in parsed) if (Object.prototype.hasOwnProperty.call(parsed, k)) st[k] = parsed[k];
      return st;
    } catch(e) {
      return st;
    }
  }

  var state = load();

  // оставляем только 2 темы
  if (state.theme !== 'dark' && state.theme !== 'soft') state.theme = 'soft';

  // стиль «Позвонить» (миграция)
  if (state.callStyle !== 'primary' && state.callStyle !== 'ghost') state.callStyle = 'ghost';

  // Миграция: если у кого-то в сохранении была кнопка «Портфолио» — убираем
  if (state.buttons && state.buttons.length) {
    var bb = [];
    for (var bi = 0; bi < state.buttons.length; bi++) {
      var b = state.buttons[bi];
      var lbl = clean(b && b.label).toLowerCase();
      if (lbl === 'портфолио') continue;
      bb.push(b);
    }
    state.buttons = bb;
  }

  // Миграция: LinkedIn -> MAX (русский аналог)
  if (state.chips && state.chips.length) {
    for (var li = 0; li < state.chips.length; li++) {
      var c = state.chips[li] || {};
      var l = clean(c.label).toLowerCase();
      if (l === 'linkedin' || l === 'linked in' || l === 'линкедин' || l === 'линкед ин') {
        c.label = 'MAX';
        state.chips[li] = c;
      }
    }
  }

  // ===== Autosave =====
  var dirty = false;
  var saveTimer = null;
  var AUTOSAVE_MS = 900;

  function setSaveStatus(mode, note){
    var box = $('saveStatus');
    var tx = $('saveStatusText');
    if (!box || !tx) return;
    box.setAttribute('data-state', mode);
    if (mode === 'dirty') tx.textContent = note || 'Есть изменения (автосохранение…)';
    else if (mode === 'saving') tx.textContent = note || 'Автосохранение…';
    else tx.textContent = note || 'Сохранено';
  }

  function persistNow(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) {}
    dirty = false;
    setSaveStatus('saved');
  }

  function persist(){
    dirty = true;
    setSaveStatus('dirty');
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function(){
      setSaveStatus('saving');
      window.setTimeout(function(){ persistNow(); }, 80);
    }, AUTOSAVE_MS);
  }

  window.addEventListener('beforeunload', function(){
    if (dirty) persistNow();
  });

  function toast(title, subtitle){
    subtitle = subtitle || '';
    var wrap = $('toastWrap');
    if (!wrap) return;
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<div>' + escapeHtml(title) + '</div>' + (subtitle ? '<small>' + escapeHtml(subtitle) + '</small>' : '');
    wrap.appendChild(t);
    t.getBoundingClientRect();
    t.classList.add('show');
    window.setTimeout(function(){
      t.classList.remove('show');
      window.setTimeout(function(){ if (t && t.parentNode) t.parentNode.removeChild(t); }, 260);
    }, 1600);
  }

  function safeOn(id, evt, handler){
    var el = $(id);
    if (!el) return;
    el.addEventListener(evt, handler);
  }

  function setTheme(t){
    state.theme = t;
    document.documentElement.setAttribute('data-theme', t);
    var seg = $('themeSeg');
    if (seg) {
      var btns = seg.querySelectorAll('button');
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        b.classList.toggle('active', b.getAttribute('data-theme') === t);
      }
    }
  }

  function fetchBlob(url){
    if (window.fetch) {
      return window.fetch(url, { mode: 'cors' }).then(function(res){ return res.blob(); });
    }
    return new Promise(function(resolve, reject){
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function(){ resolve(xhr.response); };
      xhr.onerror = function(){ reject(new Error('XHR error')); };
      xhr.send();
    });
  }

  function fileToCoverDataUrl(file, w, h, quality){
    quality = (typeof quality === 'number') ? quality : 0.86;
    return new Promise(function(resolve, reject){
      var blobUrl = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function(){
        try {
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          var ctx = c.getContext('2d');

          var scale = Math.max(w / img.width, h / img.height);
          var sw = w / scale;
          var sh = h / scale;
          var sx = (img.width - sw) / 2;
          var sy = (img.height - sh) / 2;
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

          var out = c.toDataURL('image/jpeg', quality);
          resolve(out);
        } catch(e) {
          reject(e);
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      };
      img.onerror = function(){
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Не удалось прочитать изображение'));
      };
      img.src = blobUrl;
    });
  }

  function urlToDataUrl(url, w, h, quality){
    quality = (typeof quality === 'number') ? quality : 0.86;
    url = normUrl(url);
    if (!url) return Promise.resolve('');
    return fetchBlob(url).then(function(blob){
      var file = new File([blob], 'img', { type: blob.type || 'image/jpeg' });
      return fileToCoverDataUrl(file, w, h, quality);
    });
  }

  // ===== MODAL =====
  var previewHomeParent = null;
  var previewHomeNext = null;

  function openModal(){
    var modal = $('modal');
    var panelBody = $('modalBody');
    var card = $('previewCard');
    if (!modal || !panelBody || !card) return;
    if (modal.classList.contains('show')) return;

    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.setProperty('--sbw', sbw + 'px');

    previewHomeParent = card.parentNode;
    previewHomeNext = card.nextSibling;
    panelBody.appendChild(card);

    modal.classList.add('show');
    document.body.classList.add('modalOpen');
  }

  function closeModal(){
    var modal = $('modal');
    var card = $('previewCard');
    if (!modal || !card) return;
    if (!modal.classList.contains('show')) return;

    if (previewHomeParent) previewHomeParent.insertBefore(card, previewHomeNext);

    modal.classList.remove('show');
    document.body.classList.remove('modalOpen');
    document.body.style.removeProperty('--sbw');
  }

  // ===== RENDER PREVIEW =====
  function renderPreview(){
    var nameRaw = clean(state.fullName);
    var nameEmpty = !nameRaw;
    var showName = nameEmpty ? 'Иванов Иван Иванович' : nameRaw;

    var nameEl = $('nameEl');
    if (nameEl) {
      nameEl.textContent = showName;
      nameEl.classList.toggle('ph', nameEmpty);
    }

    var roleRaw = clean(state.role);
    var roleEmpty = !roleRaw;
    var showRole = roleEmpty ? 'АРХИТЕКТОР & ДИЗАЙНЕР' : roleRaw;

    var roleEl = $('roleEl');
    if (roleEl) {
      roleEl.textContent = showRole;
      roleEl.classList.toggle('ph', roleEmpty);
    }

    var aboutEl = $('aboutEl');
    if (aboutEl) aboutEl.textContent = state.about || '';

    // slug
    state.slug = normalizeSlug(state.slug || '');
    var slugInput = $('slug');
    if (slugInput) slugInput.value = state.slug;
    var slugFullEl = $("slugPublicUrl");
    if (slugFullEl) slugFullEl.textContent = 'app.abqd.ru/u/' + (state.slug || '...');

    // banner + logo
    var banner = $('bannerBox');
    var plh = $('bannerPlh');
    var hasBanner = !!state.bannerDataUrl;
    if (plh) plh.style.display = hasBanner ? 'none' : 'flex';

    if (banner) {
      banner.innerHTML = '';
      if (plh) banner.appendChild(plh);

      if (hasBanner) {
        var imgB = document.createElement('img');
        imgB.src = state.bannerDataUrl;
        imgB.alt = 'banner';
        banner.insertBefore(imgB, banner.firstChild);

        if (state.logoDataUrl) {
          var link = state.logoLink ? normUrl(state.logoLink) : '';
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
    if (av) {
      av.innerHTML = '';
      if (state.avatarDataUrl) {
        var imgA = document.createElement('img');
        imgA.src = state.avatarDataUrl;
        imgA.alt = 'avatar';
        av.appendChild(imgA);
      } else {
        var letter = (nameRaw || 'A').slice(0, 1).toUpperCase();
        var span = document.createElement('span');
        span.className = 'fallback';
        span.textContent = letter;
        av.appendChild(span);
      }
    }

    // CTA (включая кнопку «Позвонить» при наличии телефона)
    var cta = $('ctaRow');
    if (cta) {
      cta.innerHTML = '';

      var phoneRaw = clean(state.phone);
      var hasPhone = !!phoneRaw;

      // если указан телефон — «Позвонить» всегда идёт ПЕРВОЙ (слева)
      // и по умолчанию становится акцентной (пользователь может сменить стиль в редакторе)
      if (hasPhone) {
        var tel = phoneToTel(phoneRaw);
        var callBtn = document.createElement('a');
        callBtn.textContent = 'Позвонить';
        callBtn.className = (state.callStyle === 'primary') ? 'primary' : '';
        callBtn.href = tel || '#';
        callBtn.target = '_self';
        callBtn.rel = 'nofollow';
        if (!tel) {
          callBtn.style.opacity = '.55';
          callBtn.style.pointerEvents = 'none';
        }
        cta.appendChild(callBtn);
      }

      // остальным кнопкам оставляем место справа
      var maxButtons = hasPhone ? 5 : 6;
      var btns = state.buttons || [];
      for (var bi = 0; bi < btns.length && bi < maxButtons; bi++) {
        var btn = btns[bi];
        if (!btn || !btn.label) continue;
        var a2 = document.createElement('a');
        a2.textContent = btn.label;
        a2.className = (btn.style === 'primary') ? 'primary' : '';
        a2.href = normUrl(btn.url) || '#';
        a2.target = '_blank';
        a2.rel = 'noopener';
        if (!btn.url) a2.style.opacity = '.55';
        cta.appendChild(a2);
      }
    }

    // Контакты
    var contactsSection = $('contactsSection');
    var contactsPreview = $('contactsPreview');
    if (contactsPreview) {
      contactsPreview.innerHTML = '';
      var chips = state.chips || [];
      for (var ci = 0; ci < chips.length && ci < 20; ci++) {
        var c = chips[ci];
        var label = clean(c && c.label);
        var rawUrl = clean(c && c.url);
        var iconValue = contactIcon(c && c.icon);
        if (!label && !rawUrl) continue;

        var a3 = document.createElement('a');
        a3.className = 'chipA';

        if (iconValue) {
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
        if (!href) {
          a3.style.opacity = '.55';
          a3.style.pointerEvents = 'none';
        }

        contactsPreview.appendChild(a3);
      }
    }

    var hasContacts = false;
    var chips2 = state.chips || [];
    for (var ci2 = 0; ci2 < chips2.length; ci2++) {
      if (clean(chips2[ci2] && chips2[ci2].label) || clean(chips2[ci2] && chips2[ci2].url)) { hasContacts = true; break; }
    }
    if (contactsSection) contactsSection.classList.toggle('hide', !hasContacts);

    // Ссылки (points)
    var pointsTitleEl = $('pointsTitleEl');
    if (pointsTitleEl) pointsTitleEl.textContent = state.pointsTitle || 'Ссылки';

    var pl2 = $('pointsPreview');
    if (pl2) {
      pl2.innerHTML = '';
      var pts = state.points || [];
      for (var pi = 0; pi < pts.length && pi < 12; pi++) {
        var p = pts[pi];
        if (!p || !p.title) continue;

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

        if (p.text) {
          var d = document.createElement('div');
          d.className = 'itD';
          d.textContent = p.text;
          box.appendChild(d);
        }

        if (p.url) {
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
    var hasPoints = (state.points && state.points.length);
    if (pointsSection) pointsSection.classList.toggle('hide', !hasPoints);

    // Галерея
    var galleryTitleEl = $('galleryTitleEl');
    if (galleryTitleEl) galleryTitleEl.textContent = state.galleryTitle || 'Работы';

    var gg = $('galleryPreview');
    if (gg) {
      gg.innerHTML = '';
      var gal = state.gallery || [];
      for (var gi = 0; gi < gal.length && gi < 12; gi++) {
        (function(g){
          var card = document.createElement('div');
          card.className = 'work';

          var imgWrap = document.createElement('div');
          imgWrap.className = 'workImg';
          if (g && g.img) {
            var img = document.createElement('img');
            img.src = g.img;
            img.alt = '';
            imgWrap.appendChild(img);
          }

          var body = document.createElement('div');
          body.className = 'workBody';

          var title = document.createElement('p');
          title.className = 'workT';
          title.textContent = wrapFixedChars((g && g.title) || '', 17);
          body.appendChild(title);

          if (g && g.text) {
            var desc = document.createElement('div');
            desc.className = 'workM';
            desc.textContent = g.text;
            body.appendChild(desc);
          }

          card.appendChild(imgWrap);
          card.appendChild(body);

          card.addEventListener('click', function(){
            if (g && g.url) window.open(normUrl(g.url), '_blank', 'noopener');
          });

          gg.appendChild(card);
        })(gal[gi]);
      }
    }

    var gallerySection = $('gallerySection');
    var hasGallery = (state.gallery && state.gallery.length);
    if (gallerySection) gallerySection.classList.toggle('hide', !hasGallery);

    // Footer
    var footer = $('profileFooter');
    if (footer) {
      var year = new Date().getFullYear();
      footer.innerHTML = '<span class="copy">© ' + year + ' ' + escapeHtml(showName) + '</span>';
    }
  }

  // ===== RENDER EDITOR LISTS =====
  function renderLists(){
    // Buttons
    var bl = $('buttonsList');
    if (bl) {
      bl.innerHTML = '';
      var btns = state.buttons || [];
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i] || {};
        var wrap = document.createElement('div');
        wrap.className = 'card';
        wrap.style.marginBottom = '10px';
        wrap.innerHTML =
          '<div class="pad">' +
          '  <div class="row">' +
          '    <div><label>Текст</label><input data-b="label" data-i="' + i + '" value="' + escapeHtml(b.label || '') + '" /></div>' +
          '    <div><label>URL</label><input data-b="url" data-i="' + i + '" value="' + escapeHtml(b.url || '') + '" placeholder="https://..." /></div>' +
          '  </div>' +
          '  <div class="row" style="margin-top:10px">' +
          '    <div><label>Стиль</label>' +
          '      <select data-b="style" data-i="' + i + '">' +
          '        <option value="ghost" ' + (((b.style || 'ghost') === 'ghost') ? 'selected' : '') + '>Обычная</option>' +
          '        <option value="primary" ' + (((b.style || 'ghost') === 'primary') ? 'selected' : '') + '>Акцент</option>' +
          '      </select>' +
          '    </div>' +
          '    <div></div>' +
          '  </div>' +
          '  <div class="btnRow">' +
          '    <button class="btn danger" type="button" data-act="delBtn" data-i="' + i + '">Удалить</button>' +
          '    <button class="btn" type="button" data-act="upBtn" data-i="' + i + '">↑</button>' +
          '    <button class="btn" type="button" data-act="downBtn" data-i="' + i + '">↓</button>' +
          '  </div>' +
          '</div>';
        bl.appendChild(wrap);
      }
    }

    // Points
    var pl = $('pointsList');
    if (pl) {
      pl.innerHTML = '';
      var pts = state.points || [];
      for (var j = 0; j < pts.length; j++) {
        var p = pts[j] || {};
        var wrap2 = document.createElement('div');
        wrap2.className = 'card';
        wrap2.style.marginBottom = '10px';
        wrap2.innerHTML =
          '<div class="pad">' +
          '  <div class="row">' +
          '    <div><label>Заголовок</label><input data-p="title" data-i="' + j + '" value="' + escapeHtml(p.title || '') + '" /></div>' +
          '    <div><label>URL (опц.)</label><input data-p="url" data-i="' + j + '" value="' + escapeHtml(p.url || '') + '" placeholder="https://..." /></div>' +
          '  </div>' +
          '  <div style="margin-top:10px"><label>Описание (опц.)</label><textarea data-p="text" data-i="' + j + '">' + escapeHtml(p.text || '') + '</textarea></div>' +
          '  <div class="btnRow">' +
          '    <button class="btn danger" type="button" data-act="delPoint" data-i="' + j + '">Удалить</button>' +
          '    <button class="btn" type="button" data-act="upPoint" data-i="' + j + '">↑</button>' +
          '    <button class="btn" type="button" data-act="downPoint" data-i="' + j + '">↓</button>' +
          '  </div>' +
          '</div>';
        pl.appendChild(wrap2);
      }
    }

    // Gallery
    var gl = $('galleryList');
    if (gl) {
      gl.innerHTML = '';
      var gal = state.gallery || [];
      for (var k = 0; k < gal.length; k++) {
        var g = gal[k] || {};
        var wrap3 = document.createElement('div');
        wrap3.className = 'card';
        wrap3.style.marginBottom = '10px';
        wrap3.innerHTML =
          '<div class="pad">' +
          '  <div class="row">' +
          '    <div><label>Подпись (17 символов в строке)</label><input data-g="title" data-i="' + k + '" value="' + escapeHtml(g.title || '') + '" placeholder="Проект" /></div>' +
          '    <div><label>Ссылка (опц.)</label><input data-g="url" data-i="' + k + '" value="' + escapeHtml(g.url || '') + '" placeholder="https://..." /></div>' +
          '  </div>' +
          '  <div style="margin-top:10px"><label>Описание (опц.)</label><textarea data-g="text" data-i="' + k + '">' + escapeHtml(g.text || '') + '</textarea></div>' +
          '  <div class="row" style="margin-top:10px">' +
          '    <div><label>Фото (файл)</label><input type="file" accept="image/*" data-g="imgfile" data-i="' + k + '" /></div>' +
          '    <div><label>Фото (ссылка)</label><input data-g="imgurl" data-i="' + k + '" value="" placeholder="https://..." /></div>' +
          '  </div>' +
          '  <div class="btnRow">' +
          '    <button class="btn danger" type="button" data-act="delGallery" data-i="' + k + '">Удалить</button>' +
          '    <button class="btn" type="button" data-act="upGallery" data-i="' + k + '">↑</button>' +
          '    <button class="btn" type="button" data-act="downGallery" data-i="' + k + '">↓</button>' +
          '  </div>' +
          '</div>';
        gl.appendChild(wrap3);
      }
    }

    // Contacts
    var cl = $('chipsList');
    if (cl) {
      cl.innerHTML = '';
      var chips = state.chips || [];
      for (var m = 0; m < chips.length; m++) {
        var c = chips[m] || {};
        var wrap4 = document.createElement('div');
        wrap4.className = 'card';
        wrap4.style.marginBottom = '10px';
        wrap4.innerHTML =
          '<div class="pad">' +
          '  <div class="row">' +
          '    <div><label>Текст</label><input data-c="label" data-i="' + m + '" value="' + escapeHtml(c.label || '') + '" placeholder="Напр. Телефон" /></div>' +
          '    <div><label>URL / Email / Телефон</label><input data-c="url" data-i="' + m + '" value="' + escapeHtml(c.url || '') + '" placeholder="+7..., name@mail.com, https://..." /></div>' +
          '  </div>' +
          '  <div style="margin-top:10px"><label>Иконка (опционально)</label><input data-c="icon" data-i="' + m + '" value="' + escapeHtml(c.icon || '') + '" placeholder="Если нужно: ☎️ ✉️ ????" /></div>' +
          '  <div class="btnRow">' +
          '    <button class="btn danger" type="button" data-act="delChip" data-i="' + m + '">Удалить</button>' +
          '    <button class="btn" type="button" data-act="upChip" data-i="' + m + '">↑</button>' +
          '    <button class="btn" type="button" data-act="downChip" data-i="' + m + '">↓</button>' +
          '  </div>' +
          '</div>';
        cl.appendChild(wrap4);
      }
    }
  }

  function syncFieldsFromState(){
    var fullName = $('fullName'); if (fullName) fullName.value = state.fullName || '';
    var role = $('role'); if (role) role.value = state.role || '';
    var logoLink = $('logoLink'); if (logoLink) logoLink.value = state.logoLink || '';

    var phone = $('phone'); if (phone) phone.value = state.phone || '';

    var callStyle = $('callStyle'); if (callStyle) callStyle.value = state.callStyle || 'ghost';

    var about = $('about');
    if (about) {
      about.value = state.about || '';
      var cnt = $('aboutCount');
      if (cnt) cnt.textContent = String((state.about || '').length);
    }

    var pointsTitle = $('pointsTitle'); if (pointsTitle) pointsTitle.value = state.pointsTitle || 'Ссылки';
    var galleryTitle = $('galleryTitle'); if (galleryTitle) galleryTitle.value = state.galleryTitle || 'Работы';
    var slug = $('slug'); if (slug) slug.value = state.slug || '';
  }

  function swap(arr, i, j){ var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }

  // ===== EVENTS =====
  safeOn('themeSeg', 'click', function(e){
    var b = e.target.closest('button[data-theme]');
    if (!b) return;
    setTheme(b.getAttribute('data-theme'));
    persistNow();
    renderPreview();
  });

  safeOn('tabs', 'click', function(e){
    var t = e.target.closest('.tab');
    if (!t) return;
    var all = document.querySelectorAll('.tab');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
    t.classList.add('active');

    var name = t.getAttribute('data-tab');
    var tabs = ['profile', 'buttons', 'points', 'gallery', 'links'];
    for (var j = 0; j < tabs.length; j++) {
      var n = tabs[j];
      var el = $('tab-' + n);
      if (el) el.classList.toggle('hide', n !== name);
    }
  });

  safeOn('fullName', 'input', function(){ state.fullName = $('fullName').value; persist(); renderPreview(); });
  safeOn('role', 'input', function(){ state.role = $('role').value; persist(); renderPreview(); });
  safeOn('logoLink', 'input', function(){ state.logoLink = $('logoLink').value; persist(); renderPreview(); });
  safeOn('phone', 'input', function(){
    var val = $('phone').value;
    state.phone = val;

    // UX: если человек впервые добавил телефон — сразу делаем «Позвонить» акцентной
    if (clean(val) && state.callStyle !== 'primary') {
      state.callStyle = 'primary';
      var cs = $('callStyle');
      if (cs) cs.value = 'primary';
    }

    persist();
    renderPreview();
  });
  safeOn('callStyle', 'change', function(){ state.callStyle = $('callStyle').value; persist(); renderPreview(); });

  safeOn('about', 'input', function(){
    state.about = $('about').value;
    var cnt = $('aboutCount');
    if (cnt) cnt.textContent = String(state.about.length);
    persist();
    renderPreview();
  });

  safeOn('pointsTitle', 'input', function(){ state.pointsTitle = $('pointsTitle').value; persist(); renderPreview(); });
  safeOn('galleryTitle', 'input', function(){ state.galleryTitle = $('galleryTitle').value; persist(); renderPreview(); });
  safeOn('slug', 'input', function(){ state.slug = $('slug').value; persist(); renderPreview(); });

  safeOn('avatarFile', 'change', function(e){
    var f = e.target.files && e.target.files[0]; if (!f) return;
    fileToCoverDataUrl(f, 800, 800, 0.86)
      .then(function(u){ state.avatarDataUrl = u; persist(); renderPreview(); })
      .catch(function(){ alert('Не удалось загрузить аватар. Попробуй ссылку или другой файл.'); });
  });

  safeOn('bannerFile', 'change', function(e){
    var f = e.target.files && e.target.files[0]; if (!f) return;
    fileToCoverDataUrl(f, 1600, 800, 0.86)
      .then(function(u){ state.bannerDataUrl = u; persist(); renderPreview(); })
      .catch(function(){ alert('Не удалось загрузить баннер. Попробуй ссылку или другой файл.'); });
  });

  safeOn('logoFile', 'change', function(e){
    var f = e.target.files && e.target.files[0]; if (!f) return;
    fileToCoverDataUrl(f, 500, 500, 0.90)
      .then(function(u){ state.logoDataUrl = u; persist(); renderPreview(); })
      .catch(function(){ alert('Не удалось загрузить логотип. Попробуй ссылку или другой файл.'); });
  });

  safeOn('avatarUrl', 'change', function(){
    var el = $('avatarUrl');
    if (!el || !el.value) return;
    urlToDataUrl(el.value, 800, 800, 0.86)
      .then(function(u){ state.avatarDataUrl = u; persist(); renderPreview(); })
      .catch(function(){ alert('Ссылка не загрузилась (часто из-за CORS). В проде решается прокси/хранилищем.'); });
  });

  safeOn('bannerUrl', 'change', function(){
    var el = $('bannerUrl');
    if (!el || !el.value) return;
    urlToDataUrl(el.value, 1600, 800, 0.86)
      .then(function(u){ state.bannerDataUrl = u; persist(); renderPreview(); })
      .catch(function(){ alert('Ссылка не загрузилась (часто из-за CORS). В проде решается прокси/хранилищем.'); });
  });

  safeOn('logoUrl', 'change', function(){
    var el = $('logoUrl');
    if (!el || !el.value) return;
    urlToDataUrl(el.value, 500, 500, 0.90)
      .then(function(u){ state.logoDataUrl = u; persist(); renderPreview(); })
      .catch(function(){ alert('Ссылка не загрузилась (часто из-за CORS). В проде решается прокси/хранилищем.'); });
  });

  document.body.addEventListener('input', function(e){
    var t = e.target;
    if (!t || !t.dataset) return;

    var i = Number(t.dataset.i);
    if (!isFinite(i)) return;

    if (t.dataset.b) { state.buttons[i][t.dataset.b] = t.value; persist(); renderPreview(); }
    if (t.dataset.p) { state.points[i][t.dataset.p] = t.value; persist(); renderPreview(); }
    if (t.dataset.g && t.dataset.g !== 'imgfile' && t.dataset.g !== 'imgurl') { state.gallery[i][t.dataset.g] = t.value; persist(); renderPreview(); }
    if (t.dataset.c) { state.chips[i][t.dataset.c] = t.value; persist(); renderPreview(); }
  });

  document.body.addEventListener('change', function(e){
    var t = e.target;
    if (!t || !t.dataset) return;

    if (t.dataset.g === 'imgfile') {
      var i = Number(t.dataset.i);
      var f = t.files && t.files[0]; if (!f) return;
      fileToCoverDataUrl(f, 1600, 1000, 0.86)
        .then(function(u){ state.gallery[i].img = u; persist(); renderLists(); renderPreview(); })
        .catch(function(){ alert('Не удалось загрузить фото.'); });
    }

    if (t.dataset.g === 'imgurl') {
      var j = Number(t.dataset.i);
      var url = t.value; if (!url) return;
      urlToDataUrl(url, 1600, 1000, 0.86)
        .then(function(u){ state.gallery[j].img = u; persist(); renderLists(); renderPreview(); })
        .catch(function(){ alert('Ссылка не загрузилась (часто из-за CORS).'); });
    }
  });

  document.body.addEventListener('click', function(e){
    var act = e.target && e.target.dataset ? e.target.dataset.act : '';
    var i = Number(e.target && e.target.dataset ? e.target.dataset.i : NaN);
    if (!act || !isFinite(i)) return;

    if (act === 'delBtn') { state.buttons.splice(i, 1); }
    if (act === 'upBtn' && i > 0) { swap(state.buttons, i, i - 1); }
    if (act === 'downBtn' && i < state.buttons.length - 1) { swap(state.buttons, i, i + 1); }

    if (act === 'delPoint') { state.points.splice(i, 1); }
    if (act === 'upPoint' && i > 0) { swap(state.points, i, i - 1); }
    if (act === 'downPoint' && i < state.points.length - 1) { swap(state.points, i, i + 1); }

    if (act === 'delGallery') { state.gallery.splice(i, 1); }
    if (act === 'upGallery' && i > 0) { swap(state.gallery, i, i - 1); }
    if (act === 'downGallery' && i < state.gallery.length - 1) { swap(state.gallery, i, i + 1); }

    if (act === 'delChip') { state.chips.splice(i, 1); }
    if (act === 'upChip' && i > 0) { swap(state.chips, i, i - 1); }
    if (act === 'downChip' && i < state.chips.length - 1) { swap(state.chips, i, i + 1); }

    persist();
    renderLists();
    renderPreview();
  });

  safeOn('addButton', 'click', function(){
    var phoneRaw = clean(state.phone);
    var max = phoneRaw ? 5 : 6;
    if ((state.buttons || []).length >= max) return alert('Максимум ' + max + ' кнопок' + (phoneRaw ? ' (т.к. добавится «Позвонить»)' : ''));
    state.buttons.push({ label: 'Новая кнопка', url: '', style: 'ghost' });
    persist(); renderLists(); renderPreview();
  });

  safeOn('addPoint', 'click', function(){
    if ((state.points || []).length >= 12) return alert('Максимум 12 пунктов');
    state.points.push({ title: 'Новый пункт', text: '', url: '' });
    persist(); renderLists(); renderPreview();
  });

  safeOn('addGallery', 'click', function(){
    if ((state.gallery || []).length >= 12) return alert('Максимум 12 фото');
    state.gallery.push({ title: 'Новая работа', text: '', img: '', url: '' });
    persist(); renderLists(); renderPreview();
  });

  safeOn('addChip', 'click', function(){
    if ((state.chips || []).length >= 20) return alert('Максимум 20 контактов');
    state.chips.push({ label: 'Новый контакт', url: '', icon: '' });
    persist(); renderLists(); renderPreview();
  });

  // action buttons: active только у одной
  var actionBtnIds = ['save','preview','profileLink'];
  function setActiveActionButton(id){
    for (var i = 0; i < actionBtnIds.length; i++) {
      var x = actionBtnIds[i];
      var el = $(x);
      if (el) el.classList.toggle('active', x === id);
    }
  }
  function blurActionButtons(){
    for (var i = 0; i < actionBtnIds.length; i++) {
      var el = $(actionBtnIds[i]);
      if (el) el.blur();
    }
  }

  safeOn('save', 'click', function(){
    setActiveActionButton('save');
    blurActionButtons();
    if (saveTimer) window.clearTimeout(saveTimer);
    persistNow();
    toast('Сохранено', 'Кнопка — принудительное сохранение');
  });

  safeOn('preview', 'click', function(){
    setActiveActionButton('preview');
    blurActionButtons();
    openModal();
  });

  safeOn('profileLink', 'click', function(){
    setActiveActionButton('profileLink');
    blurActionButtons();
    var s = normalizeSlug(state.slug || '');
    var url = s ? ('https://app.abqd.ru/u/' + s) : '';
    if (!url) {
      toast('Нет slug', 'Сначала задай адрес страницы');
      return;
    }
    window.open(url, '_blank', 'noopener');
    toast('Открываю профиль', url);
  });

  safeOn('reset', 'click', function(){
    if (!confirm('Сбросить все данные?')) return;
    blurActionButtons();

    state = clone(defaultState);
    setTheme(state.theme);

    if (saveTimer) window.clearTimeout(saveTimer);
    persistNow();

    syncFieldsFromState();
    renderLists();
    renderPreview();

    setSaveStatus('saved', 'Сброшено');
    toast('Сброшено', 'Вернули настройки по умолчанию');
  });

  safeOn('modalClose', 'click', closeModal);
  safeOn('modalBackdrop', 'click', closeModal);
  window.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeModal(); });

  // ===== minimal tests (console) =====

  /* =========================
     ABQD_UPLOAD_VIA_API_ALL_MEDIA_v1 • 2026-01-09
     Upload avatar/banner/gallery via API /api/v1/media/upload (jpeg/png/webp, <=5MB).
     Store URLs into state.*DataUrl and gallery[i].img. Strip base64 before publish.
     ========================= */
  (function(){
    function apiOrigin(){
      try{
        var u=new URL(location.href);
        var api=clean(u.searchParams.get('api')||'');
        if(api && /^https?:\/\//i.test(api)) return api.replace(/\/+$/,'');
      }catch(_e){}
      return 'https://api.abqd.ru';
    }

    function requireSlug(){
      var slug = normalizeSlug(state.slug || '');
      if (!slug){
        toast('Нет slug', 'Сначала задай адрес страницы (slug)');
        throw new Error('no-slug');
      }
      state.slug = slug;
      return slug;
    }

    function uploadViaApi(slug, kind, file){
      var fd=new FormData();
      fd.append('slug', slug);
      fd.append('kind', kind);
      fd.append('file', file, file.name || kind);
      return fetch(apiOrigin() + '/api/v1/media/upload', { method:'POST', body: fd })
        .then(function(r){ return r.text().then(function(t){
          var j={}; try{ j=t?JSON.parse(t):{} }catch(_e){}
          if(!r.ok) throw new Error(j.detail || ('HTTP '+r.status));
          if(!j.public_url) throw new Error('no public_url');
          return j.public_url;
        });});
    }

    function stripBase64(){
      function isData(x){ return x && String(x).indexOf('data:') === 0; }
      if (isData(state.avatarDataUrl)) state.avatarDataUrl = '';
      if (isData(state.bannerDataUrl)) state.bannerDataUrl = '';
      if (isData(state.logoDataUrl)) state.logoDataUrl = '';
      if (state.gallery && state.gallery.length){
        for (var i=0;i<state.gallery.length;i++){
          if (state.gallery[i] && isData(state.gallery[i].img)) state.gallery[i].img = '';
        }
      }
    }

    // AVATAR
    var av = document.getElementById('avatarFile');
    if (av){
      av.addEventListener('change', function(e){
        var f = e.target.files && e.target.files[0]; if(!f) return;

        // preview instantly
        fileToCoverDataUrl(f,800,800,0.86).then(function(preview){
          state.avatarDataUrl = preview;
          try{ renderPreview(); }catch(_e){}
          // ABQD_NO_PERSIST_BASE64_PREVIEW_v1
          }).catch(function(){});

        var slug; try{ slug=requireSlug(); }catch(_e){ return; }
        setSaveStatus('saving','Загрузка аватара…');

        uploadViaApi(slug,'avatar',f).then(function(url){
          state.avatarDataUrl = url;
          state.avatarUrl = url;
          persistNow(); renderPreview();
          setSaveStatus('saved','Аватар загружен');
          toast('Аватар загружен','Сохранить → опубликует профиль');
        }).catch(function(err){
          setSaveStatus('saved','Сохранено локально');
          toast('Аватар не загружен', err && err.message ? err.message : 'upload failed');
        });
      }, true);
    }

    // BANNER
    var bn = document.getElementById('bannerFile');
    if (bn){
      bn.addEventListener('change', function(e){
        var f = e.target.files && e.target.files[0]; if(!f) return;

        fileToCoverDataUrl(f,1600,800,0.86).then(function(preview){
          state.bannerDataUrl = preview;
          try{ renderPreview(); }catch(_e){}
          // ABQD_NO_PERSIST_BASE64_PREVIEW_v1
          }).catch(function(){});

        var slug; try{ slug=requireSlug(); }catch(_e){ return; }
        setSaveStatus('saving','Загрузка баннера…');

        uploadViaApi(slug,'banner',f).then(function(url){
          state.bannerDataUrl = url;
          state.bannerUrl = url;
          persistNow(); renderPreview();
          setSaveStatus('saved','Баннер загружен');
          toast('Баннер загружен','Сохранить → опубликует профиль');
        }).catch(function(err){
          setSaveStatus('saved','Сохранено локально');
          toast('Баннер не загружен', err && err.message ? err.message : 'upload failed');
        });
      }, true);
    }


    // LOGO
    var lg = document.getElementById('logoFile');
    if (lg){
      lg.addEventListener('change', function(e){
        var f = e.target.files && e.target.files[0]; if(!f) return;

        // preview instantly
        fileToCoverDataUrl(f,500,500,0.86).then(function(preview){
          state.logoDataUrl = preview;
          try{ renderPreview(); }catch(_e){}
          // ABQD_NO_PERSIST_BASE64_PREVIEW_v1
        }).catch(function(){});

        var slug; try{ slug=requireSlug(); }catch(_e){ return; }
        setSaveStatus('saving','Загрузка логотипа…');

        uploadViaApi(slug,'logo',f).then(function(url){
          state.logoDataUrl = url;
          state.logoUrl = url;

          try{ var li=document.getElementById('logoUrl'); if(li) li.value=url; }catch(_e2){}

          persistNow(); renderPreview();
          setSaveStatus('saved','Логотип загружен');
          toast('Логотип загружен','Сохранить → опубликует профиль');
        }).catch(function(err){
          setSaveStatus('saved','Сохранено локально');
          toast('Логотип не загружен', err && err.message ? err.message : 'upload failed');
        });
      }, true);
    }

    // GALLERY
    document.body.addEventListener('change', function(e){
      var t=e.target;
      if(!t || !t.dataset) return;
      if(t.dataset.g !== 'imgfile') return;
      try{ e.stopImmediatePropagation(); }catch(_e0){}
      try{ e.stopPropagation(); }catch(_e1){}
      var idx = Number(t.dataset.i);
      if(!isFinite(idx)) return;
      var f = t.files && t.files[0]; if(!f) return;

      fileToCoverDataUrl(f,1600,1000,0.86).then(function(preview){
        if(!state.gallery) state.gallery=[];
        if(!state.gallery[idx]) state.gallery[idx]={title:'',text:'',img:'',url:''};
        state.gallery[idx].img = preview;
        try{ renderLists(); }catch(_e){}
        try{ renderPreview(); }catch(_e){}
        // ABQD_NO_PERSIST_BASE64_PREVIEW_v1
        }).catch(function(){});

      var slug; try{ slug=requireSlug(); }catch(_e){ return; }
      setSaveStatus('saving','Загрузка фото…');

      uploadViaApi(slug,'gallery',f).then(function(url){
        if(!state.gallery) state.gallery=[];
        if(!state.gallery[idx]) state.gallery[idx]={title:'',text:'',img:'',url:''};
        state.gallery[idx].img = url;
        persistNow(); renderLists(); renderPreview();
        setSaveStatus('saved','Фото загружено');
        toast('Фото загружено','Сохранить → опубликует профиль');
      }).catch(function(err){
        setSaveStatus('saved','Сохранено локально');
        toast('Фото не загружено', err && err.message ? err.message : 'upload failed');
      });
    }, true);

    // Ensure publish sends URLs (not base64)
    var saveBtn = document.getElementById('save');
    if (saveBtn){
      saveBtn.addEventListener('click', function(){
        try{ stripBase64(); persistNow(); }catch(_e){}
      }, true);
    }
  })();
  /* ===================== end ABQD_UPLOAD_VIA_API_ALL_MEDIA_v1 ===================== */

  /* =========================
     ABQD_GALLERY_FILE_DETECT_v1 • 2026-01-09
     Fallback: uploads gallery photos even if inputs don't have data-g="imgfile"
     ========================= */
  (function(){
    function clean(x){ return String(x==null?'':x).replace(/^\s+|\s+$/g,''); }

    function apiOrigin(){
      try{
        var u=new URL(location.href);
        var api=clean(u.searchParams.get('api')||'');
        if(api && /^https?:\/\//i.test(api)) return api.replace(/\/+$/,'');
      }catch(_e){}
      return 'https://api.abqd.ru';
    }

    function normalizeIfPossible(s){
      try{ if (typeof normalizeSlug==='function') return normalizeSlug(s||''); }catch(_e){}
      return clean(s||'').toLowerCase();
    }

    function requireSlug(){
      var slug = normalizeIfPossible(state && state.slug ? state.slug : '');
      if(!slug){
        try{ toast('Нет slug','Сначала задай адрес страницы (slug)'); }catch(_e){}
        throw new Error('no-slug');
      }
      state.slug = slug;
      return slug;
    }

    function uploadViaApi(slug, kind, file){
      var fd=new FormData();
      fd.append('slug', slug);
      fd.append('kind', kind);
      fd.append('file', file, file.name || kind);
      return fetch(apiOrigin() + '/api/v1/media/upload', { method:'POST', body: fd })
        .then(function(r){ return r.text().then(function(t){
          var j={}; try{ j=t?JSON.parse(t):{} }catch(_e){}
          if(!r.ok) throw new Error(j.detail || ('HTTP '+r.status));
          if(!j.public_url) throw new Error('no public_url');
          return j.public_url;
        });});
    }

    function guessIndex(input){
      var idx = -1;
      try{ if (input && input.dataset && input.dataset.i) idx = Number(input.dataset.i); }catch(_e){}
      if (isFinite(idx) && idx >= 0) return idx;

      var id = clean(input && input.id);
      var m = id.match(/(\d{1,3})/);
      if(m){
        idx = Number(m[1]);
        if(isFinite(idx) && idx >= 0) return idx;
      }

      try{
        if (!state.gallery) state.gallery=[];
        return state.gallery.length;
      }catch(_e2){ return 0; }
    }

    function isInsideGallery(input){
      try{
        if (input && input.closest){
          if (input.closest('#galleryList, #gallerySection, #gallery, [data-section="gallery"], .gallery')) return True;
        }
      }catch(_e){}
      return False;
    }

    function looksLikeGalleryInput(input){
      if(!input) return false;
      if (input.dataset && input.dataset.g === 'imgfile') return false; // уже обработано основным обработчиком
      if ((input.type||'').toLowerCase() !== 'file') return false;

      // если есть возможность определить по DOM — это лучший признак
      try{
        if (input.closest && input.closest('#galleryList, #gallerySection, #gallery, [data-section="gallery"], .gallery')) return true;
      }catch(_e){}

      // иначе — по названию/классам (безопасно отсекаем avatar/banner/logo)
      var hint = (input.id||'') + ' ' + (input.name||'') + ' ' + (input.className||'');
      if (/avatar|banner|logo/i.test(hint)) return false;
      return /gallery|work|portfolio|gimg|gfile|photo|image|img/i.test(hint);
    }

    document.body.addEventListener('change', function(e){
      var t = e.target;
      if (!looksLikeGalleryInput(t)) return;

      var f = t.files && t.files[0]; if(!f) return;
      try{ e.stopImmediatePropagation(); }catch(_e0){}
      try{ e.stopPropagation(); }catch(_e1){}

      var idx = guessIndex(t);

      // preview instantly
      try{
        fileToCoverDataUrl(f,1600,1000,0.86).then(function(preview){
          if(!state.gallery) state.gallery=[];
          if(!state.gallery[idx]) state.gallery[idx]={title:'',text:'',img:'',url:''};
          state.gallery[idx].img = preview;
          try{ renderLists(); }catch(_e){}
        try{ renderPreview(); }catch(_e){}
        // ABQD_NO_PERSIST_BASE64_PREVIEW_v1
        }).catch(function(){});
      }catch(_e2){}

      var slug; try{ slug=requireSlug(); }catch(_e3){ return; }
      try{ setSaveStatus('saving','Загрузка фото…'); }catch(_e4){}

      uploadViaApi(slug,'gallery',f).then(function(url){
        if(!state.gallery) state.gallery=[];
        if(!state.gallery[idx]) state.gallery[idx]={title:'',text:'',img:'',url:''};
        state.gallery[idx].img = url;
        persistNow(); renderLists(); renderPreview();
        try{ setSaveStatus('saved','Фото загружено'); }catch(_e5){}
        try{ toast('Фото загружено','Сохранить → опубликует профиль'); }catch(_e6){}
      }).catch(function(err){
        try{ setSaveStatus('saved','Сохранено локально'); }catch(_e7){}
        try{ toast('Фото не загружено', err && err.message ? err.message : 'upload failed'); }catch(_e8){}
      });
    }, true);
  })();
  window.ABQD_GALLERY_FILE_DETECT_v1 = true;
  /* ===================== end ABQD_GALLERY_FILE_DETECT_v1 ===================== */



/* =========================
     



ABQD_PUBLISH_TO_API_v3 • 2026-01-09
     Save -> PUT https://api.abqd.ru/api/v1/profile/<slug> {state}
     Capture listener (не зависит от старых обработчиков)
     ========================= */
  (function(){
    function apiOrigin(){ return 'https://api.abqd.ru'; }
    function clean(x){ return String(x==null?'':x).replace(/^\s+|\s+$/g,''); }
    function isData(x){ return x && String(x).indexOf('data:')===0; }

    function safeStatus(st, txt){
      try{ if (typeof setSaveStatus === 'function') setSaveStatus(st, txt); }catch(_e){}
    }
    function safeToast(a,b){
      try{ if (typeof toast === 'function') toast(a,b); }catch(_e){}
    }

    function stripBase64(){
      try{
        if (isData(state.avatarDataUrl)) state.avatarDataUrl = '';
        if (isData(state.bannerDataUrl)) state.bannerDataUrl = '';
        if (isData(state.logoDataUrl)) state.logoDataUrl = '';
        if (state.gallery && state.gallery.length){
          for (var i=0;i<state.gallery.length;i++){
            if (state.gallery[i] && isData(state.gallery[i].img)) state.gallery[i].img = '';
          }
        }
      }catch(_e){}
    }

    function publishNow(){
      if (typeof state !== 'object' || !state){
        safeToast('Ошибка','state не найден');
        return;
      }
      var slug = '';
      try{
        slug = (typeof normalizeSlug === 'function')
          ? normalizeSlug(state.slug || '')
          : clean(state.slug || '');
      }catch(_e){}

      if (!slug){
        safeToast('Нет slug','Сначала задай адрес страницы (slug)');
        return;
      }
      state.slug = slug;

      stripBase64();
      try{ if (typeof persistNow === 'function') persistNow(); }catch(_e){}

      safeStatus('saving','Публикация…');

      fetch(apiOrigin() + '/api/v1/profile/' + encodeURIComponent(slug), {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ state: state })
      }).then(function(r){
        if (!r.ok) return r.text().then(function(t){ throw new Error(t || ('HTTP '+r.status)); });
        return r.text();
      }).then(function(){
        safeStatus('saved','Опубликовано');
        safeToast('Опубликовано','/u/' + slug);
      }).catch(function(err){
        safeStatus('saved','Сохранено локально');
        safeToast('Не опубликовано', err && err.message ? err.message : 'publish failed');
      });
    }

    function isSaveEl(el){
      if (!el) return false;
      if (el.id === 'save') return true;
      try{
        var t = clean(el.textContent || '');
        if (t === 'Сохранить' || t === 'Сохранить профиль') return true;
      }catch(_e){}
      return false;
    }

    document.addEventListener('click', function(e){
      var el = e.target;
      while(el && el !== document){
        if (isSaveEl(el)){
          try{ e.preventDefault(); }catch(_e){}
          try{ e.stopImmediatePropagation(); }catch(_e2){}
          try{ e.stopPropagation(); }catch(_e3){}
          publishNow();
          return;
        }
        el = el.parentElement;
      }
    }, true);

    window.ABQD_PUBLISH_TO_API_v3 = true;
  })();
  /* ===================== end ABQD_PUBLISH_TO_API_v3 ===================== */

  function runTests(){
    try {
      // existing tests (не меняем)
      console.assert(wrapFixedChars('12345678901234567', 17) === '12345678901234567', 'wrap: exact 17');
      console.assert(wrapFixedChars('123456789012345678', 17) === '12345678901234567\n8', 'wrap: overflow');
      console.assert(normalizeSlug('Ivan Ivanov') === 'ivan-ivanov', 'slug: spaces');
      console.assert(contactIcon('') === '', 'contactIcon: empty');
      console.assert(contactIcon('☎️') === '☎️', 'contactIcon: keeps user emoji');
      console.assert($("slugPublicUrl"), 'ui: slugPublicUrl exists');
      console.assert($('callStyle'), 'ui: callStyle exists');
      console.assert((state.callStyle === 'ghost' || state.callStyle === 'primary'), 'state: callStyle ok');
      console.assert(phoneToTel('+7 999 000-00-00') === 'tel:+79990000000', 'phoneToTel: formats');
      console.assert(phoneToTel('123') === '', 'phoneToTel: too short');

      // additional tests
      setActiveActionButton('save');
      console.assert($('save').classList.contains('active'), 'ui: save active');
      console.assert(!$('preview').classList.contains('active'), 'ui: preview not active');
      setActiveActionButton('preview');
      console.assert($('preview').classList.contains('active'), 'ui: preview active');
      console.assert(!$('save').classList.contains('active'), 'ui: save not active');
      console.assert(contactUrl('name@mail.com') === 'mailto:name@mail.com', 'contactUrl: mailto');
      console.assert(normUrl('example.com') === 'https://example.com', 'normUrl: adds https');
      console.assert(wrapFixedChars('a\n' + (new Array(21).join('b')), 17).indexOf('\n') !== -1, 'wrap: keeps line breaks');
    } catch(e) {
      if (window && window.console && console.warn) console.warn('Tests failed:', e);
    }
  }

  function init(){
    setTheme(state.theme || 'soft');
    state.slug = normalizeSlug(state.slug);

    syncFieldsFromState();
    renderLists();
    renderPreview();

    setSaveStatus('saved');
    runTests();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
