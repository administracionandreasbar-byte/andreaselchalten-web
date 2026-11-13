// Alta de socios: crea el socio en el CRM y le muestra su link personal.
(function () {
  var raiz = document.querySelector('[data-socios]');
  if (!raiz) return;
  var en = raiz.dataset.lang === 'en';
  var WA = '5491127843427';
  var D = 'https://andreaselchalten.com';
  var T = en ? {
    faltan: 'Please fill in the highlighted fields.', enviando: 'Creating…', boton: 'Create my link',
    error: 'Something went wrong. Try again or send it on WhatsApp.', wa: 'Send on WhatsApp',
    sinSistema: 'Sign-up is not active yet. Send your details on WhatsApp and we will create your link.',
    listo: 'Done, you are a partner', guardar: 'Save this page or the links below. They are yours.',
    l1: 'Link for your guests', l2: 'Book a table', l3: 'Book a group',
    copiar: 'Copy', copiado: 'Copied', compartir: 'Share on WhatsApp',
    msgHuesped: 'Where to eat in El Chaltén after the trail: Andreas, San Martín 351. Menu and bookings: ',
    otro: 'Register another business', intro: 'Hi, I want to sign up as an Andreas partner.'
  } : {
    faltan: 'Completá los campos marcados.', enviando: 'Creando…', boton: 'Crear mi link',
    error: 'Algo falló. Probá de nuevo o mandalo por WhatsApp.', wa: 'Enviar por WhatsApp',
    sinSistema: 'El registro todavía no está activo. Mandanos tus datos por WhatsApp y te creamos el link.',
    listo: 'Listo, ya sos socio', guardar: 'Guardá esta página o los links de abajo. Son tuyos.',
    l1: 'Link para tus huéspedes', l2: 'Reservar una mesa', l3: 'Reservar un grupo',
    copiar: 'Copiar', copiado: 'Copiado', compartir: 'Compartir por WhatsApp',
    msgHuesped: 'Para comer en El Chaltén después del sendero: Andreas, San Martín 351. Menú y reservas: ',
    otro: 'Registrar otro negocio', intro: 'Hola, quiero registrarme como socio de Andreas.'
  };
  var $ = function (s) { return raiz.querySelector(s); };
  var form = $('[data-alta]'), err = $('[data-error]'), boton = $('[data-enviar]'), listo = $('[data-listo]');
  var rutas = en ? { mesa: '/en/reservations/', grupo: '/en/agencies/', inicio: '/en/' } : { mesa: '/reservas/', grupo: '/agencias/', inicio: '/' };

  function guardado() { try { return JSON.parse(localStorage.getItem('andreas-socio') || 'null'); } catch (e) { return null; } }
  function guardar(s) { try { localStorage.setItem('andreas-socio', JSON.stringify(s)); } catch (e) {} }

  function caja(titulo, url, compartir) {
    return '<div class="link-socio"><p><b>' + titulo + '</b></p><p class="url">' + url + '</p><div class="acciones">' +
      '<button type="button" class="btn btn-linea" data-copiar="' + url + '">' + T.copiar + '</button>' +
      (compartir ? '<a class="btn btn-wa" href="https://wa.me/?text=' + encodeURIComponent(T.msgHuesped + url) + '">' + T.compartir + '</a>' : '<a class="btn btn-linea" href="' + url + '">' + titulo + '</a>') +
      '</div></div>';
  }
  function mostrar(s) {
    var c = encodeURIComponent(s.codigo);
    form.hidden = true;
    listo.innerHTML = '<p class="listo-titulo">' + T.listo + '</p><p><b>' + s.negocio + '</b>. ' + T.guardar + '</p>' +
      caja(T.l1, D + rutas.inicio + '?ref=' + c, true) +
      caja(T.l2, D + rutas.mesa + '?ref=' + c, false) +
      caja(T.l3, D + rutas.grupo + '?ref=' + c + '#reservar-grupo', false) +
      '<p style="margin-top:18px"><button type="button" class="btn btn-linea" data-otro>' + T.otro + '</button></p>';
    listo.hidden = false;
    try { sessionStorage.setItem('origen', s.codigo); } catch (e) {}
  }
  listo.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-copiar]');
    if (b) {
      var u = b.dataset.copiar;
      (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { b.textContent = T.copiado; setTimeout(function () { b.textContent = T.copiar; }, 1600); }, function () { prompt('', u); });
    }
    if (ev.target.closest('[data-otro]')) { listo.hidden = true; form.hidden = false; form.reset(); }
  });

  var previo = guardado();
  if (previo && previo.codigo) mostrar(previo);

  function textoWA() {
    return T.intro + '\n' + $('#s-negocio').value + ' (' + $('#s-tipo').value + ')\n' + $('#s-contacto').value + ' · ' + $('#s-tel').value + ($('#s-correo').value ? ' · ' + $('#s-correo').value : '');
  }
  function ofrecerWA(msg) {
    err.innerHTML = msg + ' <a class="btn btn-wa" style="margin-top:10px" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(textoWA()) + '">' + T.wa + '</a>';
    err.hidden = false;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    err.hidden = true;
    if (!form.checkValidity()) { err.textContent = T.faltan; err.hidden = false; var x = form.querySelector(':invalid'); if (x) x.focus(); return; }
    boton.disabled = true; boton.textContent = T.enviando;
    var datos = { negocio: $('#s-negocio').value.trim(), tipo: $('#s-tipo').value, contacto: $('#s-contacto').value.trim(), telefono: $('#s-tel').value.trim(), correo: $('#s-correo').value.trim(), lang: en ? 'en' : 'es' };
    fetch('/api/socios', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(datos) })
      .then(function (r) { return r.json().then(function (d) { return { st: r.status, d: d }; }, function () { return { st: r.status, d: {} }; }); })
      .then(function (res) {
        boton.disabled = false; boton.textContent = T.boton;
        if (res.st === 200 && res.d.ok) { var s = { codigo: res.d.codigo, negocio: datos.negocio }; guardar(s); mostrar(s); listo.focus(); return; }
        if (res.st === 503 || res.st === 404) return ofrecerWA(T.sinSistema);
        if (res.d.error === 'datos') { err.textContent = T.faltan; err.hidden = false; return; }
        ofrecerWA(T.error);
      }).catch(function () { boton.disabled = false; boton.textContent = T.boton; ofrecerWA(T.error); });
  });
})();
