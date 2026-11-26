---
name: actualizar-menu
description: Cambiar precios, platos, fotos, preguntas frecuentes, horarios o datos del local en el sitio de Andreas (español e inglés). Usar cuando pidan "cambiá el precio de...", "agregá un plato", "sacá...", "poné la foto de...", "sumá una pregunta" o cualquier cambio de contenido del sitio.
---

# Actualizar el contenido del sitio

Las páginas HTML **se generan**: nunca se editan a mano (`index.html`, `menu/`, `en/`, `agencias/`, `reservas/`, `ig/`, `sitemap.xml`, `manifest.webmanifest` se pisan en cada build). Todo se cambia en `tools/data.py` o `tools/build.py` y después se corre el build.

## Pasos

1. Editar `tools/data.py` (o `tools/build.py` si es un dato fijo, ver "Datos repetidos").
2. Desde la raíz del repositorio: `python3 tools/build.py` (necesita Pillow: `pip install pillow`).
3. Mirar `git diff --stat` y confirmar que solo cambió lo esperado.
4. Correr la skill `revisar-sitio`.
5. Para publicar, la skill `publicar-sitio`; para dejar constancia, `registrar-cambios`.

## Qué hay en `tools/data.py`

- `NEGOCIO`: WhatsApp, mail, dirección, Instagram, mapa, puntaje y cantidad de reseñas de Google.
- `MENU`: secciones con `(id, nombre ES, nombre EN, nota ES, nota EN, [items])`. Cada item: `(id, nombre ES, nombre EN, descripción ES, descripción EN, precio, etiquetas)`.
  - El precio es un entero en pesos (`33000`). El formato `$33.000` / `$33,000` lo pone el build.
  - Etiqueta `"veg"` = hoja de vegetariana. No hay platos veganos: no prometerlos.
  - El `id` del item es estable: lo usan `MAS_PEDIDOS` y `FOTOS_MENU`.
- `MAS_PEDIDOS`: ids con la llama de "más pedida". Se revisa cada mes con el POS.
- `FOTOS_MENU`: `id del plato -> nombre de la foto en img/` (sin extensión). La miniatura redonda se genera sola en `img/menu/<id>.webp`.
- `PREGUNTAS`: preguntas frecuentes de la portada, con respuesta en ES y EN y un link opcional `(ruta o #ancla, texto ES, texto EN)`. También alimentan los datos estructurados `FAQPage` para Google.
- `RESENAS`, `MENU_AGENCIAS`, `PLATOS_AGENCIAS`, `VIANDA`, `MESAS`: reseñas, menú de grupos, vianda y plano de mesas.

## Agregar o cambiar una foto

1. Foto vertical 800 px de ancho, en `.webp`, a `img/<nombre>-800.webp` (pesar menos de ~150 KB).
2. Sumar `"<id-del-plato>": "<nombre>-800"` en `FOTOS_MENU`.
3. Correr el build. Si una foto deja de estar en `FOTOS_MENU`, su miniatura se borra sola.
4. Una foto en `img/` que ningún archivo usa es peso muerto: borrarla.

## Datos repetidos (cambiar en todos lados)

Estos valores están escritos más de una vez; si cambian, buscarlos con `grep -n` antes de dar el cambio por terminado:

- **Happy Hour** ($15.000 por 2 cervezas, 16 a 20 h): `tools/data.py` (nota de Cervezas y pregunta de horario) y `tools/build.py` (cartel y sección de la portada, en ES y EN).
- **Viandas** ($20.000 y $25.000): `tools/build.py` (lista de precios de la portada y opciones del formulario) y `tools/data.py` (pregunta de viandas). `VIANDA[0]` en `data.py` (16000) no se muestra en ninguna página: solo se usan sus textos (`VIANDA[1]` y `VIANDA[2]`) en la ficha de agencias y hoteles, que dice que el precio por mayor va por WhatsApp.
- **Platos de "Lo que más sale"** de la portada: están escritos con su precio en `tools/build.py`, función `inicio()`, y **no** leen `MENU`. Si cambia el precio de la milanesa napolitana, el Sandwich del Puestero, el Tehuelche o el volcán, cambiarlo ahí también.
- **"Precios actualizados en noviembre de 2026"** en el encabezado del menú (`tools/build.py`, función `menu()`): actualizar el mes cuando se cambian precios.
- **Horario** (todos los días 12 a 24 h): `data.py` (preguntas), `build.py` (portada, pie, datos estructurados) y `js/site.js` (cartel "abierto/cerrado").

## Reglas de contenido

- Todo en **español e inglés**. Si se agrega un texto, van los dos.
- No cargar un plato o trago sin **precio confirmado** por Álvaro.
- **Alcohol**: no asociar cerveza ni alcohol con el sendero ni con "la vuelta de la caminata" (ley 24.788); el Happy Hour lleva la leyenda legal. No vender ni promocionar a menores de 18.
- No inventar datos del local (medios de pago, mascotas, accesibilidad, propina): si no está en el repositorio o no lo dijo el usuario, preguntar. Las respuestas de `PREGUNTAS` salen en Google, así que deben ser ciertas.
- Medios de pago confirmados: tarjeta, QR, efectivo en pesos, dólares y euros.
- "Nuestra historia" (Andreas Madsen) no se publica hasta que la familia y la Casa Museo aprueben el texto.
