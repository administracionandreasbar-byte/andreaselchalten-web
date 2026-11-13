// Sirve el sitio y un pronóstico simplificado para El Chaltén en /api/clima.
// Fuente: MET Norway (api.met.no), licencia CC BY 4.0, uso comercial permitido.
const LAT = -49.33, LON = -72.89;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/clima') return clima(ctx);
    if (url.pathname === '/api/ocupadas') return ocupadas(url, env);
    if (url.pathname === '/api/reservas' && request.method === 'POST') return reservar(request, env);
    return env.ASSETS.fetch(request);
  }
};

async function clima(ctx) {
  const cache = caches.default;
  const clave = new Request('https://andreaselchalten.com/api/clima-v2');
  const guardado = await cache.match(clave);
  if (guardado) return guardado;
  const r = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${LAT}&lon=${LON}`, {
    headers: { 'User-Agent': 'andreaselchalten.com administracion.andreasbar@gmail.com' }
  });
  if (!r.ok) return new Response(JSON.stringify({ error: 'sin pronóstico' }), { status: 502, headers: { 'content-type': 'application/json' } });
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

// ---------- Reservas: se guardan en la planilla de Google ----------
// La URL de la aplicación web de Apps Script y la clave compartida se cargan como secretos en Cloudflare:
// PLANILLA_URL y PLANILLA_CLAVE. Sin ellos, las reservas online quedan desactivadas (el sitio ofrece WhatsApp).
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const ETIQUETAS = { S1: '1', S2: '2', S3: '3', S4: '4', S5: '5', S6: '6', S7: '7', S8: '8', PA: 'A', P1: '9', P2: '10', P3: '11', P4: '12', PB: 'B', PC: 'C' };
const ID_DE = Object.fromEntries(Object.entries(ETIQUETAS).map(([k, v]) => [v, k]));

async function ocupadas(url, env) {
  if (!env.PLANILLA_URL || !env.PLANILLA_CLAVE) return json({ error: 'sin-sistema' }, 503);
  const fecha = url.searchParams.get('fecha') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return json({ error: 'fecha' }, 400);
  const r = await fetch(`${env.PLANILLA_URL}?clave=${encodeURIComponent(env.PLANILLA_CLAVE)}&fecha=${fecha}`);
  const d = await r.json().catch(() => ({}));
  if (!d.ocupadas) return json({ error: 'planilla' }, 502);
  return json({ ocupadas: d.ocupadas.map(o => ({ mesa: ID_DE[o.mesa] || o.mesa, hora: o.hora })) });
}

async function reservar(request, env) {
  if (!env.PLANILLA_URL || !env.PLANILLA_CLAVE) return json({ error: 'sin-sistema' }, 503);
  let d;
  try { d = await request.json(); } catch { return json({ error: 'datos' }, 400); }
  const { mesa, fecha, hora, personas, nombre, email } = d || {};
  if (!ETIQUETAS[mesa] || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^\d{2}:\d{2}$/.test(hora || '')
      || !nombre || String(nombre).length > 80 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '') || !(personas >= 1 && personas <= 25)) {
    return json({ error: 'datos' }, 400);
  }
  const inicio = Date.parse(`${fecha}T${hora}:00-03:00`);
  if (!(inicio - Date.now() >= 12 * 3600e3)) return json({ error: 'anticipacion' }, 422);
  if (inicio - Date.now() > 60 * 864e5) return json({ error: 'lejos' }, 422);
  const r = await fetch(env.PLANILLA_URL, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ clave: env.PLANILLA_CLAVE, mesa: ETIQUETAS[mesa], zona: mesa.startsWith('P') ? 'patio' : 'salon', fecha, hora,
      personas: Number(personas), nombre: String(nombre).slice(0, 80), email: String(email).slice(0, 120), lang: d.lang === 'en' ? 'en' : 'es' })
  });
  const res = await r.json().catch(() => ({}));
  if (res.ok) return json({ ok: true });
  if (res.error === 'ocupada') return json({ error: 'ocupada' }, 409);
  return json({ error: 'planilla' }, 502);
}
