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
