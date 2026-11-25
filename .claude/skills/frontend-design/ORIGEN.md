# Origen de esta skill

Copia sin cambios de `plugins/frontend-design/skills/frontend-design` de https://github.com/anthropics/claude-plugins-official
(commit `6985b2d`, 24/11/2026). Autor: Anthropic. Licencia: Apache 2.0 (`LICENSE.txt`).

No modificar `SKILL.md`: para actualizar, volver a copiarlo desde ese repositorio y cambiar el commit de arriba.

## Cómo se usa en Andreas

El sitio ya tiene identidad definida: logo y colores terracota y crema, tipografía Montserrat, voz del local ("Del sendero a la mesa").
Esos colores salen del logo y de la marca, no de una plantilla: no se cambian porque la skill advierta sobre
paletas "típicas". Usarla para diseñar secciones o páginas nuevas (por ejemplo "Nuestra historia", cuando la familia
apruebe el texto) y para revisar el diseño con ojo crítico, **dentro** de la marca existente (`css/site.css`).
Después de cualquier cambio de diseño: skill `revisar-sitio`, mirar las capturas, y recordar que el HTML se genera
desde `tools/build.py` (ver `actualizar-menu`).
