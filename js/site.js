(function () {
  var lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  var WA = '5491127843427';

  // Hora de El Chaltén (UTC-3, sin horario de verano)
  function horaLocal() {
    var d = new Date();
    var utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc - 3 * 3600000);
  }

  // Estado abierto / cerrado
  var estado = document.querySelector('[data-estado]');
  if (estado) {
    var h = horaLocal().getHours();
    var abierto = h >= 12;
    var hh = h >= 16 && h < 20;
    var t = {
      es: { a: 'Abierto ahora, hasta las 24 h', hh: 'Abierto ahora, Happy Hour hasta las 20 h', c: 'Cerrado ahora, abrimos a las 12 h' },
      en: { a: 'Open now until midnight', hh: 'Open now, Happy Hour until 8 pm', c: 'Closed now, we open at noon' }
    }[lang];
    estado.querySelector('span').textContent = abierto ? (hh ? t.hh : t.a) : t.c;
    if (abierto) estado.classList.add('abierto');
  }

  // Menú: marcar la sección visible
  var chips = document.querySelectorAll('.chips a');
  if (chips.length && 'IntersectionObserver' in window) {
    var porId = {};
    chips.forEach(function (c) { porId[c.getAttribute('href').slice(1)] = c; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (c) { c.classList.remove('activo'); });
        var c = porId[e.target.id];
        if (c) { c.classList.add('activo'); c.scrollIntoView({ block: 'nearest', inline: 'center' }); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.carta section[id]').forEach(function (s) { obs.observe(s); });
  }

  // Formularios que terminan en WhatsApp
  document.querySelectorAll('form[data-wa]').forEach(function (form) {
    var fecha = form.querySelector('input[type="date"]');
    if (fecha) {
      var hoy = horaLocal();
      fecha.min = hoy.toISOString().slice(0, 10);
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var err = form.querySelector('.error');
      if (!form.checkValidity()) {
        err.hidden = false;
        var primero = form.querySelector(':invalid');
        if (primero) primero.focus();
        return;
      }
      err.hidden = true;
      var lineas = [form.dataset.wa];
      form.querySelectorAll('[data-etiqueta]').forEach(function (campo) {
        var v = campo.value.trim();
        if (!v) return;
        if (campo.type === 'date') {
          var p = v.split('-'); v = p[2] + '/' + p[1] + '/' + p[0];
        }
        lineas.push(campo.dataset.etiqueta + ': ' + v);
      });
      window.location.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lineas.join('\n'));
    });
  });
})();

// Sol en el patio y clima: ilustración interactiva (aproximada)
(function () {
  var panel = document.querySelector('[data-vereda]');
  if (!panel) return;
  var en = document.documentElement.lang === 'en';
  var fecha = document.getElementById('r-fecha'), hora = document.getElementById('r-hora');
  var LAT = -49.33, LON = -72.89, pronostico = null, pedido = false;
  var VIENTO_CIERRE = 40; // km/h: desde acá el patio figura cerrado
  var TX = en ? {
    titulo: 'Sun and weather on the patio', aprox: 'Approximate, for reference only. Forecast: MET Norway.',
    poco: 'Little sun: just the strip by the street', medio: 'Partial sun on the patio', pleno: 'Full sun on the patio',
    bajando: 'The sun is going down', cerros: 'Shade: the sun is behind the mountains', noche: 'Night time',
    temp: 'Temperature', viento: 'Wind', sinp: 'Forecast available about 9 days ahead. Check again closer to the date.',
    cerrado: 'Patio closed due to wind', adentro: 'We save you a table inside, in the heated room.',
    fresco: 'Chilly: if you sit outside, bring a jacket.', sombra: 'No sun on the patio by then: inside is more comfortable.', afuera: 'Good time for the patio.',
    calmo: 'calm', moderado: 'moderate', fuerte: 'strong', cargando: 'Loading forecast…', horas: 'Hour by hour'
  } : {
    titulo: 'Sol y clima en el patio', aprox: 'Aproximado, solo como referencia. Pronóstico: MET Norway.',
    poco: 'Poco sol: solo la franja pegada a la calle', medio: 'Medio sol en el patio', pleno: 'Sol pleno en el patio',
    bajando: 'El sol empieza a bajar', cerros: 'Sombra: el sol ya está detrás de los cerros', noche: 'De noche',
    temp: 'Temperatura', viento: 'Viento', sinp: 'El pronóstico llega hasta unos 9 días. Volvé a mirar más cerca de la fecha.',
    cerrado: 'Patio cerrado por viento', adentro: 'Te esperamos adentro, en el salón calefaccionado.',
    fresco: 'Fresco: si vas al patio, llevá abrigo.', sombra: 'A esa hora ya no hay sol en el patio: adentro se está más cómodo.', afuera: 'Buen momento para el patio.',
    calmo: 'calmo', moderado: 'moderado', fuerte: 'fuerte', cargando: 'Cargando pronóstico…', horas: 'Hora por hora'
  };

  function elevacion(d) {
    var n = (d.getTime() - Date.UTC(2000, 0, 1, 12)) / 864e5;
    var L = (280.46 + 0.9856474 * n) % 360, g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
    var lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI / 180, eps = (23.439 - 4e-7 * n) * Math.PI / 180;
    var ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)), dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    var gmst = (18.697374558 + 24.06570982441908 * n) % 24, lst = ((gmst * 15 + LON) % 360) * Math.PI / 180;
    var H = lst - ra, la = LAT * Math.PI / 180;
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H)) * 180 / Math.PI;
  }
  function utc(f, h) { var p = f.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]) + (h + 3) * 36e5); }
  function cruce(f, u) { for (var h = 17; h <= 24; h += 0.25) if (elevacion(utc(f, h)) < u) return h; return 24; }
  function franja(f, h) {
    var c = cruce(f, 12), n = cruce(f, -1);
    if (h >= n) return 'noche'; if (h >= c) return 'cerros';
    if (h >= Math.min(19, c)) return 'bajando'; if (h >= 15.5) return 'pleno'; if (h >= 14) return 'medio'; return 'poco';
  }
  function buscar(f, h, tol) {
    if (!pronostico) return null;
    var obj = utc(f, h).getTime(), mejor = null, dif = Infinity;
    pronostico.forEach(function (p) { var d = Math.abs(new Date(p.t).getTime() - obj); if (d < dif) { dif = d; mejor = p; } });
    return dif <= (tol || 3.5) * 36e5 ? mejor : null;
  }
  function pedirClima() {
    if (pedido) return; pedido = true;
    fetch('/api/clima').then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { pronostico = (d && d.horas) || []; dibujar(); }).catch(function () { pronostico = []; dibujar(); });
  }

  // Escena: cielo, recorrido del sol, cerros y patio
  var W = 360, SUELO = 150;
  function X(h) { return 14 + (h - 12) / 12 * (W - 28); }
  function Y(el) { return SUELO - Math.max(el, -4) * 2; }
  function escena(f, h, fr, cerrado) {
    var cielos = { poco: ['#8ec9ea', '#d9eef8'], medio: ['#8ec9ea', '#e2f1f8'], pleno: ['#7dbfe6', '#eaf5fb'], bajando: ['#f2b26b', '#fbe3bd'], cerros: ['#6f6aa3', '#f0a27a'], noche: ['#151a33', '#2f3561'] }[fr];
    var pts = [];
    for (var t = 12; t <= 24.001; t += 0.25) pts.push(X(t).toFixed(1) + ',' + Y(elevacion(utc(f, t))).toFixed(1));
    var el = elevacion(utc(f, h)), sx = X(h), sy = Y(el);
    var detras = fr === 'cerros' || fr === 'noche';
    var cerros = 'M0 ' + SUELO + ' L0 132 L28 128 L52 134 L80 124 L104 130 L132 121 L150 127 L176 118 L198 125 L222 112 L240 120 L258 104 L272 113 L288 96 L300 108 L314 92 L326 103 L340 98 L360 106 L360 ' + SUELO + ' Z';
    var patio = { poco: '#d9c48a', medio: '#e7c568', pleno: '#f0c04a', bajando: '#e3a65a', cerros: '#9a948a', noche: '#3d3a40' }[fr];
    var astro = fr === 'noche'
      ? '<g transform="translate(' + (W - 46) + ',34)"><circle r="13" fill="#f4f1d0"/><circle cx="6" cy="-4" r="12" fill="' + cielos[0] + '"/></g>'
      : '<g opacity="' + (detras ? .45 : 1) + '"><circle cx="' + sx + '" cy="' + sy + '" r="26" fill="url(#halo)"/><circle cx="' + sx + '" cy="' + sy + '" r="11" fill="#ffd34d" stroke="#fff3c4" stroke-width="2"/></g>';
    var horasTxt = [12, 15, 18, 21, 24].map(function (k) { return '<text x="' + X(k) + '" y="' + (SUELO + 30) + '" text-anchor="middle">' + k + ' h</text>'; }).join('');
    var sello = cerrado ? '<g transform="translate(' + (W / 2) + ',' + (SUELO + 4) + ') rotate(-6)"><rect x="-118" y="-17" width="236" height="34" rx="6" fill="#c8322a"/><text y="6" text-anchor="middle" fill="#fff" font-weight="800" font-size="15">' + TX.cerrado + '</text></g>' : '';
    return '<svg class="escena" viewBox="0 0 ' + W + ' 190" role="img" aria-label="' + TX[fr] + '">' +
      '<defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + cielos[0] + '"/><stop offset="1" stop-color="' + cielos[1] + '"/></linearGradient>' +
      '<radialGradient id="halo"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset="1" stop-color="#ffd34d" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="' + W + '" height="190" fill="url(#cielo)"/>' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="2" stroke-dasharray="3 5"/>' +
      astro +
      '<path d="' + cerros + '" fill="' + (fr === 'noche' ? '#0f1226' : '#3b4a5e') + '" opacity=".92"/>' +
      '<path d="M0 ' + (SUELO - 8) + ' L60 ' + (SUELO - 14) + ' L120 ' + (SUELO - 9) + ' L190 ' + (SUELO - 16) + ' L260 ' + (SUELO - 10) + ' L360 ' + (SUELO - 15) + ' L360 ' + SUELO + ' L0 ' + SUELO + 'Z" fill="' + (fr === 'noche' ? '#1b1f35' : '#4f6150') + '"/>' +
      '<rect y="' + SUELO + '" width="' + W + '" height="40" fill="' + patio + '"/>' +
      '<line x1="' + sx + '" x2="' + sx + '" y1="' + SUELO + '" y2="' + (SUELO + 14) + '" stroke="#211f20" stroke-width="3" stroke-linecap="round"/>' +
      '<g class="escena-horas">' + horasTxt + '</g>' + sello + '</svg>';
  }
  function medidor(v) {
    var max = 60, a = Math.min(v, max) / max * 180 - 180, rad = a * Math.PI / 180;
    var nx = 60 + 44 * Math.cos(rad), ny = 62 + 44 * Math.sin(rad);
    var arco = function (d1, d2, col) {
      var r1 = (d1 / max * 180 - 180) * Math.PI / 180, r2 = (d2 / max * 180 - 180) * Math.PI / 180;
      return '<path d="M' + (60 + 50 * Math.cos(r1)) + ' ' + (62 + 50 * Math.sin(r1)) + ' A50 50 0 0 1 ' + (60 + 50 * Math.cos(r2)) + ' ' + (62 + 50 * Math.sin(r2)) + '" stroke="' + col + '" stroke-width="9" fill="none"/>';
    };
    return '<svg class="medidor" viewBox="0 0 120 72" aria-hidden="true">' + arco(0, 20, '#9cc77a') + arco(20, 40, '#f0c04a') + arco(40, 60, '#c8322a') +
      '<line x1="60" y1="62" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="#211f20" stroke-width="3.5" stroke-linecap="round"/><circle cx="60" cy="62" r="5" fill="#211f20"/></svg>';
  }
  function termometro(t) {
    var p = Math.max(0, Math.min(1, (t + 5) / 30)), alto = 6 + p * 40;
    var col = t < 8 ? '#5b8fd1' : t < 16 ? '#f0a83a' : '#c8322a';
    return '<svg class="termo" viewBox="0 0 30 72" aria-hidden="true"><rect x="10" y="4" width="10" height="52" rx="5" fill="#fff" stroke="#211f20" stroke-width="2"/><rect x="13" y="' + (54 - alto) + '" width="4" height="' + alto + '" rx="2" fill="' + col + '"/><circle cx="15" cy="60" r="9" fill="' + col + '" stroke="#211f20" stroke-width="2"/></svg>';
  }
  function flecha(dir) { return '<svg class="flecha" viewBox="0 0 24 24" style="transform:rotate(' + ((dir + 180) % 360) + 'deg)" aria-hidden="true"><path d="M12 3l5 9h-3.5v9h-3v-9H7z" fill="currentColor"/></svg>'; }
  function tira(f, h) {
    var celdas = [];
    for (var k = 12; k <= 23; k++) {
      var c = buscar(f, k, 0.6); if (!c) continue;
      var sel = Math.floor(h) === k;
      celdas.push('<div class="hora' + (sel ? ' sel' : '') + (c.viento >= VIENTO_CIERRE ? ' ventosa' : '') + '"><small>' + k + ' h</small><b>' + c.temp + '°</b>' + (c.dir != null ? flecha(c.dir) : '') + '<span>' + c.viento + '</span></div>');
    }
    return celdas.length > 3 ? '<p class="tira-titulo">' + TX.horas + ' <small>(km/h)</small></p><div class="tira">' + celdas.join('') + '</div>' : '';
  }
  function dibujar() {
    if (!fecha.value || !hora.value) { panel.hidden = true; return; }
    var hm = hora.value.split(':'), h = Math.max(12, +hm[0] + (+hm[1]) / 60);
    var fr = franja(fecha.value, h), c = buscar(fecha.value, h), cerrado = c && c.viento >= VIENTO_CIERRE;
    document.dispatchEvent(new CustomEvent('patio-viento', { detail: { cerrado: !!cerrado } }));
    var lugar = document.getElementById('r-lugar');
    if (lugar) { var op = lugar.options[2]; op.disabled = !!cerrado; if (cerrado && lugar.selectedIndex === 2) lugar.selectedIndex = 1; }
    var datos;
    if (c) {
      var nivel = c.viento < 20 ? TX.calmo : c.viento < VIENTO_CIERRE ? TX.moderado : TX.fuerte;
      var consejo = cerrado ? TX.adentro : (fr === 'cerros' || fr === 'noche') ? TX.sombra : c.temp < 12 ? TX.fresco : TX.afuera;
      datos = '<div class="clima">' +
        '<div class="dato-clima">' + termometro(c.temp) + '<div><small>' + TX.temp + '</small><b>' + c.temp + ' °C</b></div></div>' +
        '<div class="dato-clima">' + medidor(c.viento) + '<div><small>' + TX.viento + '</small><b>' + c.viento + ' km/h</b><small>' + nivel + '</small></div></div>' +
        '</div><p class="consejo' + (cerrado ? ' alerta' : '') + '">' + consejo + '</p>' + tira(fecha.value, h);
    } else datos = '<p class="fuente">' + (pronostico ? TX.sinp : TX.cargando) + '</p>';
    panel.innerHTML = '<div class="vereda-cab"><h3>' + TX.titulo + '</h3><p>' + TX[fr] + '</p></div>' + escena(fecha.value, h, fr, cerrado) + datos + '<p class="fuente">' + TX.aprox + '</p>';
    panel.hidden = false;
  }
  [fecha, hora].forEach(function (el) { el.addEventListener('change', function () { pedirClima(); dibujar(); }); el.addEventListener('input', dibujar); });
})();

// Índice flotante: se muestra mientras se scrollea y se esconde al parar
(function () {
  var nav = document.querySelector('[data-indice]');
  if (!nav) return;
  var t, inicio = document.getElementById('arriba');
  window.addEventListener('scroll', function () {
    var arriba = inicio && window.scrollY < inicio.offsetHeight * 0.6;
    nav.classList.toggle('visible', !arriba);
    clearTimeout(t);
    t = setTimeout(function () { nav.classList.remove('visible'); }, 1200);
  }, { passive: true });
  if (!('IntersectionObserver' in window)) return;
  var links = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var obs = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('activo', k === e.target.id); });
      nav.classList.toggle('oscuro', e.target.dataset.tono === 'oscuro');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) obs.observe(s); });
})();
