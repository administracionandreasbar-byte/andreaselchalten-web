---
name: revisar-sitio
description: Revisar el sitio de Andreas antes de publicar, en un celular simulado (9 páginas en español e inglés). Detecta errores de JavaScript, archivos o links rotos, imágenes sin texto alternativo, páginas que se salen de costado y botones demasiado chicos para el dedo. Usar después de cualquier cambio al sitio y antes de publicar.
---

# Revisar el sitio

## Correr la revisión

Desde la raíz del repositorio (después de `python3 tools/build.py`):

```bash
python3 -m http.server 8765 >/dev/null 2>&1 &
sleep 1
NODE_PATH=$(npm root -g) node .claude/skills/revisar-sitio/revisar.js http://localhost:8765 <carpeta-de-capturas>
pkill -f "http.server 8765"
```

- Playwright y Chromium ya están instalados en el entorno: no instalarlos de nuevo.
- La carpeta de capturas es opcional; usar el directorio temporal de la sesión, nunca el repositorio.
- Sale con código 1 y lista cada problema si encuentra alguno; si no, imprime "Todo en orden".

## Qué revisa

Las 9 páginas (`/`, `/menu/`, `/reservas/`, `/agencias/`, `/ig/` y las 4 de `/en/`) en un iPhone 13:

- Errores de JavaScript y de consola, y archivos que devuelven 404.
- Links y archivos internos que no existen (imágenes, CSS, JS, otras páginas).
- Imágenes sin atributo `alt`.
- Desborde horizontal (la página se sale del ancho de la pantalla).
- Botones y links de menos de 44 px de alto (se excluyen el índice lateral de la portada y el "Ir al contenido").

Las llamadas a `/api/` no se prueban: el servidor simple no es el worker de Cloudflare, así que ahí fallan siempre. Reservas, clima y CRM necesitan el worker (`npx wrangler dev`) y la clave de Notion.

## Después de correrlo

1. Corregir lo que salga en rojo y volver a correrlo hasta que diga "Todo en orden".
2. Mirar con el Read tool al menos las capturas de `/` y `/menu/`: el script no ve si algo quedó feo, tapado o mal alineado. Si se agregó una página o sección nueva, mirarla también.
3. Si el cambio toca la versión de computadora, abrir una captura de 1280 px de ancho con Playwright.

## Limitaciones conocidas

- El índice lateral de la portada (`.indice`) se superpone con el texto en pantallas angostas: ya era así antes y por eso está excluido de la medición de botones.
- No mide velocidad ni posicionamiento en Google.
