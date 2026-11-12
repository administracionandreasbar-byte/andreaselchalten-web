(function () {
  var raiz = document.querySelector('[data-reservar]');
  if (!raiz) return;
  var en = raiz.dataset.lang === 'en';
  var WA = '5491127843427';
  var T = en ? {
    mesa: 'Table', hasta: 'seats up to', salon: 'dining room', patio: 'patio',
    ocupada: 'This table is already booked at that time. Choose another time or another table.',
    viento: 'The patio is closed due to wind at that time. Choose a table inside.',
    anticipacion: 'To choose a specific table, book at least 12 hours ahead. For today, write to us on WhatsApp.',
    faltan: 'Please fill in the highlighted fields.', limite: 'Too many bookings from this connection today. Write to us on WhatsApp.',
    error: 'Something went wrong. Try again or write to us on WhatsApp.', enviando: 'Booking…',
    listo: 'Booked!', listoTxt: 'We are expecting you', cambiar: 'If your plans change, let us know on WhatsApp.',
    sinSistema: 'Online booking is not active yet. Send it on WhatsApp and we confirm right away.', wa: 'Send on WhatsApp',
    personas: function (n) { return n + (n === 1 ? ' person' : ' people'); },
    dias: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], a: 'at'
  } : {
    mesa: 'Mesa', hasta: 'hasta', salon: 'salón', patio: 'patio',
    ocupada: 'Esta mesa ya está reservada en ese horario. Elegí otra hora u otra mesa.',
    viento: 'El patio está cerrado por viento en ese horario. Elegí una mesa del salón.',
    anticipacion: 'Para elegir una mesa puntual, reservá con 12 horas de anticipación. Para hoy, escribinos por WhatsApp.',
    faltan: 'Completá los campos marcados.', limite: 'Hiciste muchas reservas hoy desde esta conexión. Escribinos por WhatsApp.',
    error: 'Algo falló. Probá de nuevo o escribinos por WhatsApp.', enviando: 'Reservando…',
    listo: '¡Reserva hecha!', listoTxt: 'Te esperamos', cambiar: 'Si cambian tus planes, avisanos por WhatsApp.',
    sinSistema: 'Las reservas online todavía no están activas. Mandala por WhatsApp y te confirmamos enseguida.', wa: 'Enviar por WhatsApp',
    personas: function (n) { return n + (n === 1 ? ' persona' : ' personas'); },
    dias: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'], a: 'a las'
  };
  var $ = function (s) { return raiz.querySelector(s); };
  var form = $('[data-ficha]'), pasos = $('[data-pasos]'), vacia = $('[data-vacia]'), titulo = $('[data-titulo-mesa]');
  var fecha = $('#r-fecha'), hora = $('#r-hora'), pax = $('#r-pax'), estado = $('[data-estado-mesa]'), err = $('[data-error]'), boton = $('[data-enviar]'), listo = $('[data-listo]');
  var elegida = null, ocupadas = [], patioCerrado = false, sinSistema = false;

  function ahoraMas12() { return Date.now() + 12 * 3600e3; }
  function inicio(f, h) { return Date.parse(f + 'T' + h + ':00-03:00'); }
  function min(h) { var p = h.split(':'); return +p[0] * 60 + +p[1]; }

  // Pestañas
  raiz.querySelectorAll('[role="tab"]').forEach(function (b) {
    b.addEventListener('click', function () {
      raiz.querySelectorAll('[role="tab"]').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      raiz.querySelectorAll('[data-plano]').forEach(function (p) { p.hidden = p.dataset.plano !== b.dataset.zona; });
    });
  });

  // Elegir mesa
  function elegir(g) {
    if (g.classList.contains('ocupada')) return;
    raiz.querySelectorAll('.mesa').forEach(function (m) { m.classList.remove('elegida'); m.setAttribute('aria-pressed', 'false'); });
    g.classList.add('elegida'); g.setAttribute('aria-pressed', 'true');
    elegida = { id: g.dataset.id, cap: +g.dataset.cap, zona: g.dataset.zona, label: g.dataset.label };
    titulo.innerHTML = '<b>' + T.mesa + ' ' + elegida.label + '</b> · ' + (elegida.zona === 'patio' ? T.patio : T.salon) + ' · ' + T.hasta + ' ' + T.personas(elegida.cap);
    var prev = +pax.value || elegida.cap; pax.innerHTML = '';
    for (var i = 1; i <= elegida.cap; i++) pax.add(new Option(T.personas(i), i, false, i === Math.min(prev, elegida.cap)));
    vacia.hidden = true; pasos.hidden = false; listo.hidden = true;
    revisar();
    if (window.matchMedia('(max-width:860px)').matches) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  raiz.querySelectorAll('.mesa').forEach(function (g) {
    g.addEventListener('click', function () { elegir(g); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(g); } });
  });

  // Fecha mínima y horarios habilitados
  var d0 = new Date(ahoraMas12() - 3 * 3600e3);
  fecha.min = d0.toISOString().slice(0, 10);
  function horarios() {
    if (!fecha.value) return;
    Array.prototype.forEach.call(hora.options, function (o) { if (o.value) o.disabled = inicio(fecha.value, o.value) < ahoraMas12(); });
    if (hora.selectedOptions[0] && hora.selectedOptions[0].disabled) hora.value = '';
  }
  function cargarOcupadas() {
    if (!fecha.value) return;
    fetch('/api/ocupadas?fecha=' + fecha.value).then(function (r) {
      if (r.status === 503) { sinSistema = true; return { ocupadas: [] }; }
      return r.ok ? r.json() : { ocupadas: [] };
    }).then(function (d) { ocupadas = d.ocupadas || []; revisar(); }).catch(function () { ocupadas = []; revisar(); });
  }
  function revisar() {
    raiz.querySelectorAll('.mesa').forEach(function (g) {
      var oc = !!(hora.value && ocupadas.some(function (o) { return o.mesa === g.dataset.id && Math.abs(min(o.hora) - min(hora.value)) < 90; }));
      var cerrada = patioCerrado && g.dataset.zona === 'patio';
      g.classList.toggle('ocupada', oc || cerrada);
    });
    var msg = '';
    if (elegida && hora.value) {
      if (ocupadas.some(function (o) { return o.mesa === elegida.id && Math.abs(min(o.hora) - min(hora.value)) < 90; })) msg = T.ocupada;
      else if (patioCerrado && elegida.zona === 'patio') msg = T.viento;
    }
    estado.textContent = msg; estado.hidden = !msg; boton.disabled = !!msg;
  }
  fecha.addEventListener('change', function () { horarios(); cargarOcupadas(); });
  hora.addEventListener('change', revisar);
  document.addEventListener('patio-viento', function (e) { patioCerrado = !!e.detail.cerrado; revisar(); });

  function textoWA() {
    return (en ? 'Hi, I want to book from the website.' : 'Hola, quiero reservar desde la web.') + '\n' +
      T.mesa + ': ' + elegida.label + ' (' + (elegida.zona === 'patio' ? T.patio : T.salon) + ')\n' +
      fecha.value.split('-').reverse().join('/') + ' ' + hora.value + ' · ' + T.personas(+pax.value) + '\n' +
      $('#r-nombre').value + ' · ' + $('#r-email').value;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    err.hidden = true;
    if (!elegida) return;
    if (!form.checkValidity()) { err.textContent = T.faltan; err.hidden = false; var x = form.querySelector(':invalid'); if (x) x.focus(); return; }
    if (inicio(fecha.value, hora.value) < ahoraMas12()) { err.textContent = T.anticipacion; err.hidden = false; return; }
    if (sinSistema) return ofrecerWA();
    boton.disabled = true; boton.textContent = T.enviando;
    fetch('/api/reservas', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mesa: elegida.id, fecha: fecha.value, hora: hora.value, personas: +pax.value, nombre: $('#r-nombre').value.trim(), email: $('#r-email').value.trim(), lang: en ? 'en' : 'es' })
    }).then(function (r) { return r.json().then(function (d) { return { st: r.status, d: d }; }, function () { return { st: r.status, d: {} }; }); })
      .then(function (res) {
        boton.disabled = false; boton.textContent = en ? 'Book' : 'Reservar';
        if (res.st === 200 && res.d.ok) return confirmar();
        if (res.st === 503 || res.st === 404) { sinSistema = true; return ofrecerWA(); }
        if (res.d.error === 'ocupada') { cargarOcupadas(); err.textContent = T.ocupada; }
        else if (res.d.error === 'anticipacion') err.textContent = T.anticipacion;
        else if (res.d.error === 'limite') err.textContent = T.limite;
        else err.textContent = T.error;
        err.hidden = false;
      }).catch(function () { boton.disabled = false; boton.textContent = en ? 'Book' : 'Reservar'; err.textContent = T.error; err.hidden = false; });
  });

  function confirmar() {
    var f = new Date(fecha.value + 'T12:00:00');
    var cuando = T.dias[f.getDay()] + ' ' + fecha.value.split('-').reverse().slice(0, 2).join('/') + ' ' + T.a + ' ' + hora.value;
    pasos.hidden = true;
    listo.innerHTML = '<p class="listo-titulo">' + T.listo + '</p><p>' + T.listoTxt + ' <b>' + cuando + '</b>, ' + T.mesa.toLowerCase() + ' <b>' + elegida.label + '</b>, ' + T.personas(+pax.value) + '.</p><p class="ayuda">' + T.cambiar + ' <a href="https://wa.me/' + WA + '">WhatsApp</a></p>';
    listo.hidden = false; listo.focus();
    ocupadas.push({ mesa: elegida.id, hora: hora.value }); revisar();
  }
  function ofrecerWA() {
    err.innerHTML = T.sinSistema + ' <a class="btn btn-wa" style="margin-top:10px" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(textoWA()) + '">' + T.wa + '</a>';
    err.hidden = false;
  }
})();
