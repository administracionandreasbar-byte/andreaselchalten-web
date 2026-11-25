// Revisión automática del sitio en un celular simulado.
// Uso: node revisar.js <url base> <carpeta de capturas>
//   ej: node revisar.js http://localhost:8765 /tmp/capturas
// Requiere Playwright (ya instalado en el entorno de Claude Code).
const { chromium, devices } = require('playwright');
const fs = require('fs');

const BASE = (process.argv[2] || 'http://localhost:8765').replace(/\/$/, '');
const SALIDA = process.argv[3];
const PAGINAS = ['/', '/menu/', '/reservas/', '/agencias/', '/ig/', '/en/', '/en/menu/', '/en/reservations/', '/en/agencies/'];
const MIN_TOQUE = 44; // alto mínimo (px) de un botón o link para tocarlo con el dedo

(async () => {
  if (SALIDA) fs.mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  let problemas = 0;
  const avisar = (pagina, texto) => { problemas++; console.log(`  ✗ ${texto}`); };

  for (const ruta of PAGINAS) {
    console.log(ruta);
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push('JS: ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/\/api\//.test(m.text()) && !/status of 404/.test(m.text())) errores.push(m.text()); });
    pg.on('response', r => { if (r.status() >= 400 && !r.url().includes('/api/')) errores.push(`${r.status()} ${r.url()}`); });
    await pg.goto(BASE + ruta, { waitUntil: 'networkidle' }).catch(e => errores.push('no abrió: ' + e.message));

    errores.forEach(e => avisar(ruta, 'error: ' + e));

    const desborde = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (desborde > 0) avisar(ruta, `la página se sale ${desborde}px de costado`);

    const sinAlt = await pg.evaluate(() => [...document.images].filter(i => !i.hasAttribute('alt')).map(i => i.getAttribute('src')));
    sinAlt.forEach(s => avisar(ruta, 'imagen sin texto alternativo: ' + s));

    const chicos = await pg.evaluate(min => [...document.querySelectorAll('a,button,summary')]
      .filter(e => !e.closest('.indice') && !e.classList.contains('salto'))
      .map(e => ({ r: e.getBoundingClientRect(), t: e.textContent.trim().slice(0, 30) }))
      .filter(x => x.r.width > 0 && x.r.height < min)
      .map(x => `${x.t} (${Math.round(x.r.width)}x${Math.round(x.r.height)})`), MIN_TOQUE);
    [...new Set(chicos)].forEach(c => avisar(ruta, 'botón chico para el dedo: ' + c));

    // Links y archivos internos que no existen
    const internos = await pg.evaluate(() => {
      const out = new Set();
      document.querySelectorAll('[href],[src],[srcset]').forEach(e => {
        const v = e.getAttribute('href') || e.getAttribute('src') || e.getAttribute('srcset') || '';
        v.split(',').map(s => s.trim().split(' ')[0]).forEach(u => {
          if (u.startsWith('/') && !u.startsWith('//') && !u.startsWith('/api/')) out.add(u.split('#')[0].split('?')[0]);
        });
      });
      return [...out].filter(Boolean);
    });
    for (const u of internos) {
      const r = await ctx.request.get(BASE + u).catch(() => null);
      if (!r || r.status() >= 400) avisar(ruta, `link o archivo roto: ${u}`);
    }

    if (SALIDA) await pg.screenshot({ path: `${SALIDA}/${ruta.replace(/\//g, '_') || 'inicio'}.png`, fullPage: true });
    await pg.close();
  }
  await b.close();
  console.log(problemas ? `\n${problemas} problema(s)` : '\nTodo en orden');
  process.exit(problemas ? 1 : 0);
})();
