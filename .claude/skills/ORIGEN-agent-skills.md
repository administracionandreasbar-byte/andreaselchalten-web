# Origen de accessibility-engineering, performance-optimization y security-and-hardening

Copias sin cambios de las carpetas `skills/<nombre>` de https://github.com/addyosmani/agent-skills
(commit `e997ac5`, versión 0.6.18, 23/11/2026). Autor: Addy Osmani. Licencia: MIT.

De las 26 skills de ese repositorio se tomaron solo estas tres porque son las que le sirven al sitio de Andreas:

- `accessibility-engineering`: accesibilidad (WCAG 2.2 AA). En Andreas se usa junto con `revisar-sitio` (ver `accesibilidad.js`).
- `performance-optimization`: velocidad de carga y Core Web Vitals, para las páginas y las fotos del menú.
- `security-and-hardening`: seguridad del Worker (`worker.js`): formularios, clave del CRM y llamadas a Notion.

Quedaron afuera las skills de ciclo de desarrollo (especificar, planificar, construir, probar, publicar), los comandos y los hooks: el proyecto ya tiene sus propias skills para publicar y revisar, y los hooks ejecutan código en cada sesión.
No modificar los archivos de esas carpetas: para actualizar, volver a copiarlas y cambiar el commit de arriba.
Nota: `accessibility-engineering/scripts/audit-a11y.sh` baja `@axe-core/cli` y `pa11y` con `npx`, en versiones fijas.
