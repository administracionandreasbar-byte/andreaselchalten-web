// Sirve el sitio, el pronóstico (/api/clima) y el CRM en Notion (reservas, grupos y socios).
// Pronóstico: MET Norway (api.met.no), licencia CC BY 4.0, uso comercial permitido.
// CRM: un solo secreto en Cloudflare, NOTION_TOKEN (la clave de la integración de Notion).
// Sin ese secreto, las reservas online quedan desactivadas y el sitio ofrece WhatsApp.
import PROSPECTOS from './tools/prospectos.json';

const LAT = -49.33, LON = -72.89;
const DOMINIO = 'https://andreaselchalten.com';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname, post = request.method === 'POST';
    try {
      if (p === '/api/clima') return await clima(ctx);
      if (p === '/api/ocupadas') return await ocupadasApi(url, env);
      if (p === '/api/reservas' && post) return await reservar(request, env);
      if (p === '/api/grupo' && post) return await grupo(request, env);
      if (p === '/api/socios' && post) return await altaSocio(request, env);
      if (p === '/api/crm/instalar') return await instalar(env);
    } catch (e) {
      return json({ error: 'crm', detalle: String(e.message || e).slice(0, 200) }, 502);
    }
    return env.ASSETS.fetch(request);
  }
};

async function clima(ctx) {
  const cache = caches.default;
  const clave = new Request(DOMINIO + '/api/clima-v2');
  const guardado = await cache.match(clave);
  if (guardado) return guardado;
  const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${LAT}&lon=${LON}`, {
    headers: { 'User-Agent': 'andreaselchalten.com administracion.andreasbar@gmail.com' }
  });
  if (!r.ok) return json({ error: 'sin pronóstico' }, 502);
  const datos = await r.json();
  const horas = datos.properties.timeseries.map(p => ({
    t: p.time,
    temp: Math.round(p.data.instant.details.air_temperature),
    viento: Math.round(p.data.instant.details.wind_speed * 3.6),
    dir: Math.round(p.data.instant.details.wind_from_direction)
  }));
  const resp = new Response(JSON.stringify({ fuente: 'MET Norway', horas }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' }
  });
  ctx.waitUntil(cache.put(clave, resp.clone()));
  return resp;
}

// ---------- utilidades ----------
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const pagina = (titulo, cuerpo, recargar) => new Response(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${recargar ? '<meta http-equiv="refresh" content="3">' : ''}<meta name="robots" content="noindex"><title>${titulo}</title><body style="font:18px/1.5 system-ui,sans-serif;max-width:560px;margin:40px auto;padding:0 18px;background:#f8f9f0;color:#211f20"><h1 style="font-size:1.5rem">${titulo}</h1>${cuerpo}</body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
const espera = ms => new Promise(r => setTimeout(r, ms));
const texto = s => [{ type: 'text', text: { content: String(s || '').slice(0, 1900) } }];
const sel = s => (s ? { select: { name: String(s).replace(/,/g, ' ').slice(0, 90) } } : { select: null });
const limpiar = (s, n) => String(s || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const ETIQUETAS = { S1: '1', S2: '2', S3: '3', S4: '4', S5: '5', S6: '6', S7: '7', S8: '8', PA: 'A', P1: '9', P2: '10', P3: '11', P4: '12', PB: 'B', PC: 'C' };
const ID_DE = Object.fromEntries(Object.entries(ETIQUETAS).map(([k, v]) => [v, k]));
const ORIGENES_GENERICOS = ['whatsapp', 'mail', 'instagram', 'google', 'qr'];
const T_RESERVAS = 'Andreas – Reservas', T_SOCIOS = 'Andreas – Socios';

function slug(s) {
  return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24).replace(/-+$/, '');
}
function horaDe(start) {
  if (!start || start.length < 16) return null;
  if (/(Z|[+-]\d\d:\d\d)$/.test(start)) return new Date(Date.parse(start) - 3 * 3600e3).toISOString().slice(11, 16);
  return start.slice(11, 16);
}

// ---------- Notion ----------
async function notion(env, ruta, metodo = 'GET', cuerpo) {
  for (let intento = 0; intento < 3; intento++) {
    const r = await fetch('https://api.notion.com/v1/' + ruta, {
      method: metodo,
      headers: { 'Authorization': 'Bearer ' + env.NOTION_TOKEN, 'Notion-Version': '2022-06-28', 'content-type': 'application/json' },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    if (r.status === 429) { await espera(1000 * Math.min(+(r.headers.get('retry-after') || 1), 3)); continue; }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(`Notion ${r.status}: ${d.message || ''}`); e.status = r.status; throw e; }
    return d;
  }
  throw new Error('Notion: demasiadas solicitudes');
}

const CLAVE_CACHE = new Request(DOMINIO + '/__crm/bases-v1');
async function bases(env, { sinCache = false } = {}) {
  if (!sinCache) {
    const c = await caches.default.match(CLAVE_CACHE);
    if (c) return c.json();
  }
  const d = await notion(env, 'search', 'POST', { query: 'Andreas', filter: { property: 'object', value: 'database' }, page_size: 50 });
  const titulo = db => (db.title || []).map(t => t.plain_text).join('');
  const encontrar = t => (d.results.find(db => titulo(db) === t && !db.archived && !db.in_trash) || {}).id || null;
  const b = { reservas: encontrar(T_RESERVAS), socios: encontrar(T_SOCIOS) };
  if (b.reservas && b.socios) await caches.default.put(CLAVE_CACHE, new Response(JSON.stringify(b), { headers: { 'cache-control': 'max-age=86400' } }));
  return b;
}

async function personas(env) {
  const k = new Request(DOMINIO + '/__crm/personas-v1');
  const c = await caches.default.match(k);
  if (c) return c.json();
  let ids = [];
  try { ids = (await notion(env, 'users?page_size=50')).results.filter(u => u.type === 'person').map(u => u.id); } catch (e) {}
  await caches.default.put(k, new Response(JSON.stringify(ids), { headers: { 'cache-control': 'max-age=86400' } }));
  return ids;
}

// Bloque de aviso: menciona a las personas del espacio de Notion para que les llegue la notificación (celular y mail).
async function aviso(env, linea) {
  const ids = await personas(env);
  const rt = ids.map(id => ({ type: 'mention', mention: { type: 'user', user: { id } } }));
  rt.push({ type: 'text', text: { content: ' ' + linea } });
  return [{ object: 'block', type: 'paragraph', paragraph: { rich_text: rt } }];
}

async function socioPorCodigo(env, b, codigo) {
  if (!codigo || ORIGENES_GENERICOS.includes(codigo)) return null;
  const d = await notion(env, `databases/${b.socios}/query`, 'POST', { filter: { property: 'Código', rich_text: { equals: codigo } }, page_size: 1 });
  return d.results[0] || null;
}

async function listo(env) {
  if (!env.NOTION_TOKEN) return null;
  const b = await bases(env);
  return b.reservas && b.socios ? b : null;
}

// ---------- Reservas de mesa ----------
async function ocupadasDe(env, b, fecha) {
  const sig = new Date(Date.parse(fecha + 'T12:00:00Z') + 864e5).toISOString().slice(0, 10);
  const d = await notion(env, `databases/${b.reservas}/query`, 'POST', {
    page_size: 100,
    filter: { and: [
      { property: 'Fecha', date: { on_or_after: `${fecha}T00:00:00-03:00` } },
      { property: 'Fecha', date: { before: `${sig}T00:00:00-03:00` } },
      { property: 'Mesa', select: { is_not_empty: true } },
      { property: 'Estado', select: { does_not_equal: 'Cancelada' } },
      { property: 'Estado', select: { does_not_equal: 'No vino' } }
    ] }
  });
  return d.results.map(p => ({
    mesa: ID_DE[p.properties.Mesa.select?.name] || null,
    hora: horaDe(p.properties.Fecha.date?.start)
  })).filter(o => o.mesa && o.hora);
}

async function ocupadasApi(url, env) {
  const b = await listo(env);
  if (!b) return json({ error: 'sin-sistema' }, 503);
  const fecha = url.searchParams.get('fecha') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return json({ error: 'fecha' }, 400);
  return json({ ocupadas: await ocupadasDe(env, b, fecha) });
}

const minutos = h => { const [a, m] = h.split(':'); return +a * 60 + +m; };

async function reservar(request, env) {
  const b = await listo(env);
  if (!b) return json({ error: 'sin-sistema' }, 503);
  let d;
  try { d = await request.json(); } catch { return json({ error: 'datos' }, 400); }
  const { mesa, fecha, hora, personas: pax, nombre, email } = d || {};
  if (!ETIQUETAS[mesa] || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^\d{2}:\d{2}$/.test(hora || '')
      || !limpiar(nombre, 80) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '') || !(pax >= 1 && pax <= 25)) {
    return json({ error: 'datos' }, 400);
  }
  const inicio = Date.parse(`${fecha}T${hora}:00-03:00`);
  if (!(inicio - Date.now() >= 12 * 3600e3)) return json({ error: 'anticipacion' }, 422);
  if (inicio - Date.now() > 60 * 864e5) return json({ error: 'lejos' }, 422);
  const ocupadas = await ocupadasDe(env, b, fecha);
  if (ocupadas.some(o => o.mesa === mesa && Math.abs(minutos(o.hora) - minutos(hora)) < 90)) return json({ error: 'ocupada' }, 409);

  const origen = limpiar(d.origen, 30).replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  const socio = await socioPorCodigo(env, b, origen).catch(() => null);
  const etiqueta = ETIQUETAS[mesa], zona = mesa.startsWith('P') ? 'Patio' : 'Salón';
  const nom = limpiar(nombre, 80);
  const props = {
    'Nombre': { title: texto(nom) },
    'Fecha': { date: { start: `${fecha}T${hora}:00-03:00` } },
    'Personas': { number: Number(pax) },
    'Tipo': sel('Mesa web'), 'Estado': sel('Confirmada'),
    'Mesa': sel(etiqueta), 'Zona': sel(zona),
    'Correo': { email: limpiar(email, 120) },
    'Origen': sel(origen || 'Directo'),
    'Idioma': sel(d.lang === 'en' ? 'Inglés' : 'Español')
  };
  if (socio) props['Socio'] = { relation: [{ id: socio.id }] };
  const dia = fecha.split('-').reverse().join('/');
  await notion(env, 'pages', 'POST', {
    parent: { database_id: b.reservas }, properties: props,
    children: await aviso(env, `Nueva reserva web: ${nom}, ${pax} pers., mesa ${etiqueta} (${zona}), ${dia} ${hora}. Origen: ${origen || 'directo'}.`)
  });
  return json({ ok: true });
}

// ---------- Pedidos de grupo (formulario de /agencias) ----------
async function grupo(request, env) {
  const b = await listo(env);
  if (!b) return json({ error: 'sin-sistema' }, 503);
  let d;
  try { d = await request.json(); } catch { return json({ error: 'datos' }, 400); }
  const agencia = limpiar(d.agencia, 80);
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(d.fecha || '') ? d.fecha : null;
  const hora = /^\d{2}:\d{2}$/.test(d.hora || '') ? d.hora : '12:00';
  const pax = Math.max(1, Math.min(60, parseInt(d.personas, 10) || 0));
  if (!agencia || !fecha || !pax) return json({ error: 'datos' }, 400);
  const origen = limpiar(d.origen, 30).replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  const socio = await socioPorCodigo(env, b, origen).catch(() => null);
  const props = {
    'Nombre': { title: texto(agencia) },
    'Fecha': { date: { start: `${fecha}T${hora}:00-03:00` } },
    'Personas': { number: pax },
    'Tipo': sel('Grupo'), 'Estado': sel('Pedido'),
    'Menú': { rich_text: texto(limpiar(d.menu, 80)) },
    'Notas': { rich_text: texto(limpiar(d.notas, 1000)) },
    'Origen': sel(origen || 'Directo'),
    'Idioma': sel(d.lang === 'en' ? 'Inglés' : 'Español')
  };
  if (socio) props['Socio'] = { relation: [{ id: socio.id }] };
  await notion(env, 'pages', 'POST', {
    parent: { database_id: b.reservas }, properties: props,
    children: await aviso(env, `Pedido de grupo: ${agencia}, ${pax} pasajeros, ${fecha.split('-').reverse().join('/')} ${hora}. Confirmalo por WhatsApp.`)
  });
  return json({ ok: true });
}

// ---------- Alta de socios (hoteles, hostels, agencias, guías) ----------
const TIPOS = ['Agencia', 'Transporte', 'Guías', 'Guía particular', 'Alojamiento', 'Otro'];
async function altaSocio(request, env) {
  const b = await listo(env);
  if (!b) return json({ error: 'sin-sistema' }, 503);
  let d;
  try { d = await request.json(); } catch { return json({ error: 'datos' }, 400); }
  const negocio = limpiar(d.negocio, 80), contacto = limpiar(d.contacto, 80), tel = limpiar(d.telefono, 30).replace(/[^\d+ ]/g, '');
  const correo = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.correo || '') ? limpiar(d.correo, 120) : null;
  const tipo = TIPOS.includes(d.tipo) ? d.tipo : 'Otro';
  if (!negocio || !contacto || tel.replace(/\D/g, '').length < 8) return json({ error: 'datos' }, 400);
  const codigo = (slug(negocio) || 'socio') + '-' + Math.random().toString(36).slice(2, 5);
  const link = `${DOMINIO}/?ref=${codigo}`;
  const props = {
    'Nombre': { title: texto(negocio) }, 'Tipo': sel(tipo), 'Estado': sel('Solicitud'),
    'Código': { rich_text: texto(codigo) }, 'Link': { url: link },
    'WhatsApp': { url: 'https://wa.me/' + tel.replace(/\D/g, '') },
    'Teléfono': { phone_number: tel }, 'Contacto': { rich_text: texto(contacto) },
    'Idioma': sel(d.lang === 'en' ? 'Inglés' : 'Español')
  };
  if (correo) props['Correo'] = { email: correo };
  await notion(env, 'pages', 'POST', {
    parent: { database_id: b.socios }, properties: props,
    children: await aviso(env, `Nuevo socio registrado: ${negocio} (${tipo}), contacto ${contacto}, ${tel}. Escribile para darle la bienvenida.`)
  });
  return json({ ok: true, codigo, link });
}

// ---------- Instalación: crea las bases en Notion y carga los prospectos ----------
async function instalar(env) {
  if (!env.NOTION_TOKEN) return pagina('Falta la clave de Notion', '<p>Cargá el secreto <b>NOTION_TOKEN</b> en Cloudflare (Worker → Settings → Variables and Secrets) y volvé a abrir esta página.</p>');
  let b;
  try { b = await bases(env, { sinCache: true }); }
  catch (e) { return pagina('Notion no acepta la clave', `<p>Revisá que copiaste la clave completa de la integración. Detalle: ${String(e.message).replace(/</g, '')}</p>`); }

  if (!b.reservas || !b.socios) {
    const pags = await notion(env, 'search', 'POST', { filter: { property: 'object', value: 'page' }, page_size: 20 });
    const madre = pags.results.find(p => p.parent?.type === 'workspace') || pags.results[0];
    if (!madre) return pagina('Falta conectar una página', '<p>En Notion abrí la página donde querés el CRM, tocá <b>•••</b> → <b>Conexiones</b> y agregá la integración. Después volvé a abrir esta página.</p>');
    const padre = { type: 'page_id', page_id: madre.id };
    const opciones = arr => ({ select: { options: arr.map(([name, color]) => ({ name, color })) } });
    if (!b.socios) {
      const s = await notion(env, 'databases', 'POST', {
        parent: padre, is_inline: false, title: texto(T_SOCIOS), icon: { type: 'emoji', emoji: '🤝' },
        properties: {
          'Nombre': { title: {} },
          'Estado': opciones([['Solicitud', 'purple'], ['Prospecto', 'gray'], ['Contactado', 'blue'], ['Interesado', 'yellow'], ['Activo', 'green'], ['Pausado', 'orange'], ['No por ahora', 'red']]),
          'Tipo': opciones([['Agencia', 'blue'], ['Transporte', 'brown'], ['Guías', 'green'], ['Guía particular', 'green'], ['Alojamiento', 'pink'], ['Otro', 'gray']]),
          'Próximo seguimiento': { date: {} },
          'WhatsApp': { url: {} }, 'Teléfono': { phone_number: {} }, 'Correo': { email: {} },
          'Contacto': { rich_text: {} }, 'Código': { rich_text: {} }, 'Link': { url: {} },
          'Idioma': opciones([['Español', 'default'], ['Inglés', 'default'], ['Portugués', 'default']]),
          'Motivo del no': { rich_text: {} }, 'Notas': { rich_text: {} }
        }
      });
      b.socios = s.id;
    }
    if (!b.reservas) {
      const r = await notion(env, 'databases', 'POST', {
        parent: padre, is_inline: false, title: texto(T_RESERVAS), icon: { type: 'emoji', emoji: '🍔' },
        properties: {
          'Nombre': { title: {} },
          'Fecha': { date: {} },
          'Personas': { number: { format: 'number' } },
          'Estado': opciones([['Pedido', 'yellow'], ['Confirmada', 'blue'], ['Vino', 'green'], ['No vino', 'red'], ['Cancelada', 'gray']]),
          'Tipo': opciones([['Mesa web', 'blue'], ['Grupo', 'purple'], ['Teléfono / local', 'gray'], ['Viandas', 'brown']]),
          'Mesa': opciones(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'A', 'B', 'C'].map(x => [x, 'default'])),
          'Zona': opciones([['Salón', 'red'], ['Patio', 'green']]),
          'Gastó': { number: { format: 'number_with_commas' } },
          'Origen': { select: {} },
          'Socio': { relation: { database_id: b.socios, dual_property: {} } },
          'Menú': { rich_text: {} },
          'Correo': { email: {} }, 'Teléfono': { phone_number: {} },
          'Idioma': opciones([['Español', 'default'], ['Inglés', 'default'], ['Portugués', 'default']]),
          'Notas': { rich_text: {} }
        }
      });
      b.reservas = r.id;
      const espejo = r.properties?.Socio?.relation?.dual_property?.synced_property_name;
      if (espejo && espejo !== 'Reservas') {
        await notion(env, `databases/${b.socios}`, 'PATCH', { properties: { [espejo]: { name: 'Reservas' } } }).catch(() => {});
      }
    }
    await caches.default.delete(CLAVE_CACHE);
  }

  // Carga de prospectos: los que falten, de a 20 por vez (la página se recarga sola hasta terminar).
  const codigos = new Set();
  let cursor;
  do {
    const d = await notion(env, `databases/${b.socios}/query`, 'POST', { page_size: 100, start_cursor: cursor, filter: { property: 'Código', rich_text: { is_not_empty: true } } });
    d.results.forEach(p => codigos.add((p.properties['Código'].rich_text || []).map(t => t.plain_text).join('')));
    cursor = d.has_more ? d.next_cursor : undefined;
  } while (cursor);
  const faltan = PROSPECTOS.filter(p => !codigos.has(p.c));
  for (const p of faltan.slice(0, 20)) {
    const ruta = p.idioma === 'Español' ? '/agencias/' : '/en/agencies/';
    await notion(env, 'pages', 'POST', {
      parent: { database_id: b.socios },
      properties: {
        'Nombre': { title: texto(p.n) }, 'Tipo': sel(p.tipo), 'Estado': sel(p.estado),
        'Código': { rich_text: texto(p.c) }, 'Link': { url: `${DOMINIO}${ruta}?ref=${p.c}` },
        'WhatsApp': { url: 'https://wa.me/' + p.t }, 'Teléfono': { phone_number: '+' + p.t }, 'Idioma': sel(p.idioma)
      }
    });
    await espera(340);
  }
  const resto = Math.max(0, faltan.length - 20);
  if (resto) return pagina('Cargando prospectos…', `<p>Faltan ${resto} de ${PROSPECTOS.length}. No cierres esta página: se recarga sola.</p>`, true);
  return pagina('CRM listo ✅', `<p>Las bases <b>${T_RESERVAS}</b> y <b>${T_SOCIOS}</b> están en tu Notion, con los ${PROSPECTOS.length} prospectos cargados.</p><p>Las reservas del sitio ya se guardan ahí. Podés cerrar esta página.</p>`);
}
