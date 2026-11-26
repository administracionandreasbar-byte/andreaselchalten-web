---
name: publicar-sitio
description: Publicar los cambios del sitio de Andreas: generar las páginas, revisarlas, guardar en git, subir la rama y (si lo piden) abrir y unir el pull request a main. Usar cuando digan "publicá", "subí los cambios", "mandalo a producción" o "hacé el pull request".
---

# Publicar el sitio

El sitio es un Worker de Cloudflare (`worker.js`) que sirve los archivos de la raíz del repositorio. La rama principal es `main`.

## Antes de subir

1. `python3 tools/build.py` desde la raíz: regenera todas las páginas, el sitemap y el manifest.
2. Skill `revisar-sitio`: tiene que decir "Todo en orden".
3. `git status` y `git diff --stat`: confirmar que solo cambió lo que se pidió. Las páginas generadas (`index.html`, `menu/`, `en/`, etc.) **sí** se suben: el repositorio trae las páginas ya generadas y no hay que depender de que Cloudflare corra el build.
4. Si se tocó `worker.js`: `node --check worker.js` (solo revisa la sintaxis; el archivo no se puede importar tal cual porque carga `tools/prospectos.json`). Si cambió la lógica, probarla con un servidor simulado: copiar el worker a un archivo temporal sin esa importación y llamarlo con `Request` de prueba, como se hizo con la protección anti-spam.

## Guardar y subir

- Trabajar siempre en la rama de desarrollo que indique la sesión, nunca directo en `main`.
- Commit con un título corto en español que diga qué cambió para el negocio (no "fix"), un cuerpo con viñetas, y al final las líneas de atribución que indique la sesión. Si el archivo es un secreto (`.env`, claves), no subirlo.
- `git push -u origin <rama>`; si falla por red, reintentar hasta 4 veces con espera.
- Si el pull request anterior de esa rama ya se unió a `main`, volver a partir de `origin/main` (`git checkout -B <rama> origin/main`) antes de hacer nuevos cambios.

## Pull request y publicación

- **Abrir un pull request solo si el usuario lo pidió** (o pidió "publicar"). Usar el título del commit y un cuerpo con: qué cambió, qué se probó y qué falta confirmar. Terminarlo con la línea de atribución de la sesión.
- Unir con `merge_method: merge`. El parámetro `expectedHeadSha` pide el hash **completo** de 40 caracteres (`git rev-parse HEAD`), no el corto.
- No unir si el usuario no lo autorizó en esta tarea.

## Confirmar que quedó publicado

Desde el entorno de Claude Code **no hay acceso a andreaselchalten.com** (el proxy lo bloquea), así que no se puede verificar desde acá. Decirlo con claridad en lugar de afirmar que está publicado.

Para el usuario, dejar estos pasos:

1. Abrir andreaselchalten.com unos minutos después y buscar el cambio (por ejemplo "Preguntas frecuentes" al final de la portada).
2. Si el despliegue automático de Cloudflare no lo publicó: `npx wrangler deploy` desde la carpeta del proyecto.
3. Secretos del Worker (Cloudflare → Settings → Variables and Secrets): `NOTION_TOKEN` (reservas y CRM) y, opcional, `CRM_CLAVE`. Sin `CRM_CLAVE`, la página `/api/crm/instalar` está abierta (hace falta para la instalación inicial del CRM); con `CRM_CLAVE` (mínimo 12 caracteres) solo funciona con `/api/crm/instalar?clave=…`. Una vez instalado el CRM conviene cargar `CRM_CLAVE` para cerrarla. Sin `NOTION_TOKEN` las reservas online se desactivan y el sitio ofrece WhatsApp.

## Después

Dejar constancia con la skill `registrar-cambios` (Bitácora de cruces en Drive y Tareas Andreas en Notion).
