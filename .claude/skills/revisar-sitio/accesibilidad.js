// Revisión de accesibilidad (WCAG 2.2 AA) con axe-core, en un celular simulado, sobre las 9 páginas del sitio.
// Uso: NODE_PATH=$(npm root -g) node accesibilidad.js <carpeta donde está instalado axe-core> [url base]
//   Instalar axe-core en una carpeta temporal (fuera del repositorio):  npm install axe-core@4.13.0
// Sale en "Sin violaciones" o lista cada problema con las páginas afectadas y un ejemplo.
const { chromium } = require('playwright');
const fs = require('fs');
const axeSrc = fs.readFileSync(process.argv[2] + '/node_modules/axe-core/axe.min.js', 'utf8');
(async () => {
  const b = await chromium.launch();
  const pages = ['/', '/menu/', '/reservas/', '/agencias/', '/ig/', '/en/', '/en/menu/', '/en/reservations/', '/en/agencies/'];
  const todas = {};
  for (const p of pages) {
    const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
    await pg.goto((process.argv[3] || 'http://localhost:8765') + p, { waitUntil: 'networkidle' });
    await pg.addScriptTag({ content: axeSrc });
    const r = await pg.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }));
    for (const v of r.violations) {
      const k = v.id + ' | ' + v.impact + ' | ' + v.help;
      todas[k] = todas[k] || { paginas: new Set(), ejemplos: [] };
      todas[k].paginas.add(p);
      if (todas[k].ejemplos.length < 2) todas[k].ejemplos.push(v.nodes[0].target.join(' ') + ' :: ' + (v.nodes[0].failureSummary || '').split('\n').slice(1, 2).join('').trim().slice(0, 150));
    }
    await pg.close();
  }
  await b.close();
  const ks = Object.keys(todas);
  if (!ks.length) console.log('Sin violaciones');
  ks.forEach(k => console.log(k + '\n   páginas: ' + [...todas[k].paginas].join(', ') + '\n   ej: ' + todas[k].ejemplos.join('\n       ')));
})();
