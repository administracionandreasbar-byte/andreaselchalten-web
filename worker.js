// Sirve el sitio y un pronóstico simplificado para El Chaltén en /api/clima.
// Fuente: MET Norway (api.met.no), licencia CC BY 4.0, uso comercial permitido.
const LAT = -49.33, LON = -72.89;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/clima') return clima(ctx);
    if (url.pathname === '/api/ocupadas') return ocupadas(url, env);
    if (url.pathname === '/api/reservas' && request.method === 'POST') return reservar(request, env);
    if (url.pathname === '/api/panel') return panel(request, url, env);
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

// ---------- Reservas (Cloudflare KV, binding RESERVAS) ----------
const DURACION = 90; // minutos que ocupa una mesa
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const minutos = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };

async function listar(env, fecha) {
  const out = [];
  let cursor;
  do {
    const r = await env.RESERVAS.list({ prefix: `res:${fecha}:`, cursor });
    for (const k of r.keys) out.push({ key: k.name, ...(k.metadata || {}) });
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out;
}

async function ocupadas(url, env) {
  if (!env.RESERVAS) return json({ error: 'sin-sistema' }, 503);
  const fecha = url.searchParams.get('fecha') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return json({ error: 'fecha' }, 400);
  const lista = await listar(env, fecha);
  return json({ ocupadas: lista.map(r => ({ mesa: r.mesa, hora: r.hora })) });
}

async function reservar(request, env) {
  if (!env.RESERVAS) return json({ error: 'sin-sistema' }, 503);
  let d;
  try { d = await request.json(); } catch { return json({ error: 'datos' }, 400); }
  const { mesa, fecha, hora, personas, nombre, email } = d || {};
  if (!/^[A-Z0-9]{1,4}$/.test(mesa || '') || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !/^\d{2}:\d{2}$/.test(hora || '')
      || !nombre || String(nombre).length > 80 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '') || !(personas >= 1 && personas <= 25)) {
    return json({ error: 'datos' }, 400);
  }
  // Anticipación mínima: 12 horas (hora de El Chaltén, UTC-3)
  const inicio = Date.parse(`${fecha}T${hora}:00-03:00`);
  if (!(inicio - Date.now() >= 12 * 3600e3)) return json({ error: 'anticipacion' }, 422);
  if (inicio - Date.now() > 60 * 864e5) return json({ error: 'lejos' }, 422);
  // Límite simple: 3 reservas por día por conexión
  const ip = request.headers.get('cf-connecting-ip') || 'x';
  const hoy = new Date().toISOString().slice(0, 10);
  const claveIp = `ip:${hoy}:${ip}`;
  const usadas = Number(await env.RESERVAS.get(claveIp) || 0);
  if (usadas >= 3) return json({ error: 'limite' }, 429);
  // Choque con otra reserva de la misma mesa
  const lista = await listar(env, fecha);
  const m = minutos(hora);
  if (lista.some(r => r.mesa === mesa && Math.abs(minutos(r.hora) - m) < DURACION)) return json({ error: 'ocupada' }, 409);
  const id = crypto.randomUUID().slice(0, 8);
  const key = `res:${fecha}:${mesa}:${hora}:${id}`;
  const meta = { mesa, hora, personas: Number(personas) };
  const vence = Math.floor(inicio / 1000) + 2 * 86400;
  await env.RESERVAS.put(key, JSON.stringify({ ...meta, fecha, nombre: String(nombre).slice(0, 80), email: String(email).slice(0, 120), creada: new Date().toISOString(), lang: d.lang === 'en' ? 'en' : 'es' }), { metadata: meta, expiration: vence });
  await env.RESERVAS.put(claveIp, String(usadas + 1), { expirationTtl: 86400 });
  return json({ ok: true, id });
}

async function panel(request, url, env) {
  if (!env.RESERVAS || !env.PANEL_PIN) return json({ error: 'sin-sistema' }, 503);
  if ((request.headers.get('x-pin') || '') !== env.PANEL_PIN) return json({ error: 'pin' }, 401);
  if (request.method === 'DELETE') {
    const key = url.searchParams.get('key') || '';
    if (!key.startsWith('res:')) return json({ error: 'key' }, 400);
    await env.RESERVAS.delete(key);
    return json({ ok: true });
  }
  const fecha = url.searchParams.get('fecha') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return json({ error: 'fecha' }, 400);
  const lista = await listar(env, fecha);
  const completas = await Promise.all(lista.map(async r => ({ key: r.key, ...(JSON.parse(await env.RESERVAS.get(r.key) || '{}')) })));
  completas.sort((a, b) => a.hora.localeCompare(b.hora));
  return json({ reservas: completas });
}
