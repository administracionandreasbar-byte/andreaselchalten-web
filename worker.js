// Sirve el sitio y un pronóstico simplificado para El Chaltén en /api/clima.
// Fuente: MET Norway (api.met.no), licencia CC BY 4.0, uso comercial permitido.
const LAT = -49.33, LON = -72.89;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api/clima') return clima(ctx);
    return env.ASSETS.fetch(request);
  }
};

async function clima(ctx) {
  const cache = caches.default;
  const clave = new Request('https://andreaselchalten.com/api/clima-v1');
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
    viento: Math.round(p.data.instant.details.wind_speed * 3.6)
  }));
  const resp = new Response(JSON.stringify({ fuente: 'MET Norway', horas }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' }
  });
  ctx.waitUntil(cache.put(clave, resp.clone()));
  return resp;
}
