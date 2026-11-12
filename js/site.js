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

// Sol en la vereda y clima (ilustrativo)
(function () {
  var panel = document.querySelector('[data-vereda]');
  if (!panel) return;
  var en = document.documentElement.lang === 'en';
  var fecha = document.getElementById('r-fecha'), hora = document.getElementById('r-hora');
  var LAT = -49.33, LON = -72.89, pronostico = null, pedido = false;
  var VIENTO_CIERRE = 40; // km/h: desde acá el patio figura cerrado
  var TX = en ? {
    titulo: 'Sun and weather on the patio', aprox: 'Approximate, for reference only.',
    poco: 'Little sun: only the strip next to the street', medio: 'Partial sun on the patio', pleno: 'Full sun on the patio',
    bajando: 'Sun going down, still some light', cerros: 'Shade: the sun hides behind the mountains', noche: 'Night: the patio is in the shade',
    temp: 'Temperature', viento: 'Wind', sens: 'Feels', sinp: 'The forecast for that day is not available yet (about 9 days ahead).',
    adentro: 'Patio closed due to wind. We save you a table inside, in the heated room.', fresco: 'Chilly: if you sit outside, bring a jacket.', sombra: 'No sun on the patio by then: inside is more comfortable.', afuera: 'Good for the patio.',
    calmo: 'calm', moderado: 'moderate', fuerte: 'strong', fuente: 'Forecast: MET Norway. Sun: estimate based on the sun\'s path.'
  } : {
    titulo: 'Sol y clima en el patio', aprox: 'Aproximado, solo como referencia.',
    poco: 'Poco sol: solo la franja pegada a la calle', medio: 'Medio sol en el patio', pleno: 'Sol pleno en el patio',
    bajando: 'El sol empieza a bajar, todavía hay luz', cerros: 'Sombra: el sol se esconde detrás de los cerros', noche: 'De noche: el patio queda en sombra',
    temp: 'Temperatura', viento: 'Viento', sens: 'Sensación', sinp: 'El pronóstico para ese día todavía no está disponible (llega hasta unos 9 días).',
    adentro: 'Patio cerrado por viento. Te esperamos adentro, en el salón calefaccionado.', fresco: 'Fresco: si vas al patio, llevá abrigo.', sombra: 'A esa hora ya no hay sol en el patio: adentro se está más cómodo.', afuera: 'Buen momento para el patio.',
    calmo: 'calmo', moderado: 'moderado', fuerte: 'fuerte', fuente: 'Pronóstico: MET Norway. Sol: estimación según el recorrido del sol.'
  };

  function elevacion(d) { // d en UTC
    var n = (d.getTime() - Date.UTC(2000, 0, 1, 12)) / 864e5;
    var L = (280.46 + 0.9856474 * n) % 360, g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
    var lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI / 180, eps = (23.439 - 4e-7 * n) * Math.PI / 180;
    var ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)), dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    var gmst = (18.697374558 + 24.06570982441908 * n) % 24, lst = ((gmst * 15 + LON) % 360) * Math.PI / 180;
    var H = lst - ra, la = LAT * Math.PI / 180;
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(H)) * 180 / Math.PI;
  }
  function utc(f, h) { var p = f.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 0, 0) + (h + 3) * 36e5); }
  function horaCruce(f, umbral) { // primera hora desde las 17 en que la elevación baja del umbral
    for (var h = 17; h <= 24; h += 0.25) if (elevacion(utc(f, h)) < umbral) return h;
    return 24;
  }
  function franjas(f) {
    var cerros = horaCruce(f, 12), noche = horaCruce(f, -1);
    return [['poco', 12, 14], ['medio', 14, 15.5], ['pleno', 15.5, Math.min(19, cerros)], ['bajando', Math.min(19, cerros), cerros], ['cerros', cerros, noche], ['noche', noche, 24]]
      .filter(function (b) { return b[2] > b[1]; });
  }
  function nivelViento(k) { return k < 20 ? TX.calmo : k < 40 ? TX.moderado : TX.fuerte; }
  function buscar(f, h) {
    if (!pronostico) return null;
    var objetivo = utc(f, h).getTime(), mejor = null, dif = Infinity;
    pronostico.forEach(function (p) { var d = Math.abs(new Date(p.t).getTime() - objetivo); if (d < dif) { dif = d; mejor = p; } });
    return dif <= 4 * 36e5 ? mejor : null;
  }
  function pedirClima() {
    if (pedido) return; pedido = true;
    fetch('/api/clima').then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.horas) { pronostico = d.horas; dibujar(); } }).catch(function () {});
  }
  function dibujar() {
    if (!fecha.value || !hora.value) { panel.hidden = true; return; }
    var hm = hora.value.split(':'), h = +hm[0] + (+hm[1]) / 60;
    if (h < 12) h = 12;
    var bs = franjas(fecha.value), actual = bs.filter(function (b) { return h >= b[1] && h < b[2]; })[0] || bs[bs.length - 1];
    var barras = bs.map(function (b) { return '<span class="b-' + b[0] + '" style="width:' + ((b[2] - b[1]) / 12 * 100) + '%" title="' + TX[b[0]] + '"></span>'; }).join('');
    var c = buscar(fecha.value, h), clima;
    if (c) {
      var consejo = c.viento >= VIENTO_CIERRE ? TX.adentro : (actual[0] === 'cerros' || actual[0] === 'noche') ? TX.sombra : c.temp < 12 ? TX.fresco : TX.afuera;
      var lugar = document.getElementById('r-lugar');
      if (lugar) { var op = lugar.options[2]; op.disabled = c.viento >= VIENTO_CIERRE; if (op.disabled && lugar.selectedIndex === 2) lugar.selectedIndex = 1; }
      clima = '<div class="clima"><div><small>' + TX.temp + '</small><b>' + c.temp + ' °C</b></div><div><small>' + TX.viento + '</small><b>' + c.viento + ' km/h</b><small>' + nivelViento(c.viento) + '</small></div></div><p class="consejo">' + consejo + '</p>';
    } else clima = pronostico ? '<p class="fuente">' + TX.sinp + '</p>' : '';
    panel.innerHTML = '<h3>' + TX.titulo + '</h3><p style="margin:0 0 4px"><b>' + TX[actual[0]] + '.</b></p>' +
      '<div class="dia" role="img" aria-label="' + TX[actual[0]] + '">' + barras + '<i class="marca-hora" style="left:' + ((h - 12) / 12 * 100) + '%"></i></div>' +
      '<div class="escala"><span>12 h</span><span>15 h</span><span>18 h</span><span>21 h</span><span>24 h</span></div>' + clima +
      '<p class="fuente">' + TX.aprox + ' ' + TX.fuente + '</p>';
    panel.hidden = false;
  }
  [fecha, hora].forEach(function (el) { el.addEventListener('change', function () { pedirClima(); dibujar(); }); el.addEventListener('input', dibujar); });
})();
