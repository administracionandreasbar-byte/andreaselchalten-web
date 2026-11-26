---
name: registrar-cambios
description: Dejar constancia de los cambios del sitio de Andreas en la Bitácora de cruces (Google Drive) y en la base Tareas Andreas (Notion). Usar al terminar un cambio publicable, o cuando digan "anotalo en la bitácora", "avisale al proyecto" o "dejá constancia".
---

# Registrar los cambios

Hay dos lugares y se usan juntos:

| Lugar | Para qué |
|---|---|
| **Bitácora de cruces** (Google Doc) | Avisar a las otras áreas (Contenido, Ventas, Finanzas, Planillas…) de lo que cambió en el Sitio web y las afecta. |
| **Tareas Andreas** (Notion) | Lo hecho y lo que queda pendiente del Sitio web, con fecha. |

Antes de escribir en Drive, cargar la skill `anthropic-skills:google-workspace`. Las herramientas de Drive, Docs y Notion son diferidas: cargarlas con ToolSearch (`select:mcp__Google_Docs__read_doc,mcp__Google_Docs__update_doc,mcp__Google_Drive__read_file_content,mcp__Notion__notion-create-pages`).

## 1. Bitácora de cruces

- Documento: `12YDdr90vJvp_Kc471pHS7GeavQ7dmsv_RT2Xb1vJUng` (https://docs.google.com/document/d/12YDdr90vJvp_Kc471pHS7GeavQ7dmsv_RT2Xb1vJUng/edit).
- Formato: entradas fechadas `DD/MM/AAAA`, **la más reciente arriba**. Cada viñeta empieza con `Área origen → Área destino:` y dice qué cambió y qué tiene que hacer o saber la otra área. El área de este proyecto se llama **Sitio web**.
- Las otras áreas son Contenido, Ventas, Finanzas, Planillas, Desarrollo Personal y Chat madre. Escribir una viñeta por cada área afectada; si no afecta a nadie, no anotar.
- Cada semana, Sitio anota qué `?ref=` trajo visitas y reservas (acuerdo del 19/11).

### Cómo escribir sin romper el formato

1. Leer el documento entero con `read_doc` (para tener los índices y el `revisionId`).
2. Si ya existe el título de la fecha de hoy, insertar las viñetas **al final de ese día** (justo antes del título de la fecha anterior). Si no existe, insertar primero un título de fecha nuevo justo después de la línea en cursiva de la introducción, y las viñetas debajo.
3. Con `update_doc` mandar, en este orden y en una sola llamada: `insertText` (un párrafo por viñeta, terminado en `\n`), `updateParagraphStyle` a `NORMAL_TEXT`, `updateTextStyle` con `bold: false` y `createParagraphBullets` (`BULLET_DISC_CIRCLE_SQUARE`) sobre el rango insertado. Los índices son en UTF-16: calcular el largo con `len(texto.encode('utf-16-le'))//2`.
4. Mandar `writeControl.requiredRevisionId` con el `revisionId` leído: si alguien editó mientras tanto, la llamada falla y hay que volver a leer.
5. Releer con `read_file_content` y comprobar que las viñetas quedaron como viñetas y no como títulos. El texto insertado hereda el estilo del párrafo donde se inserta (suele ser un título): por eso el paso 3 lo resetea.
6. No reescribir ni reformatear entradas de otras áreas ni de fechas anteriores.

## 2. Tareas Andreas (Notion)

- Base de datos: https://app.notion.com/p/6b323f2ab2c541768b149e9b9d800bf3 — fuente de datos `collection://06c97251-1b2a-4548-b98c-a9d1a4c74b1f`.
- Propiedades: `Tarea` (título), `Estado` (`Por hacer` / `En curso` / `Hecho`), `Área` (`Marketing y ventas`, `Equipo y salón`, `Cocina y compras`, `Administración`), `Prioridad` (`Alta` / `Media` / `Baja`), `Vence`, `Cerrado el` (fecha en que pasó a Hecho) y `Notas`. Las fechas van con las columnas separadas: `date:Vence:start` + `date:Vence:is_datetime` = 0.
- Lo del sitio va en `Marketing y ventas`.
- Crear **una página "Hecho"** con `Cerrado el` = hoy y la lista de cambios en el cuerpo (con el link al pull request), y **otra "Por hacer"** con lo pendiente (`Vence` con fecha) y casillas `- [ ]` en el cuerpo.
- Antes de crear, buscar con `notion-search` si ya hay una entrada de esta tarea para actualizarla en lugar de duplicarla.
- Leer `notion://docs/notion-flavored-markdown-spec` (con `notion-fetch`) antes de escribir contenido con formato.

## Reglas

- Escribir en español, claro y sin jerga técnica: lo leen personas del negocio, no programadores. Decir "el menú tiene fotos", no "se agregó FOTOS_MENU".
- No registrar secretos (claves, tokens). Nombrar el secreto (`CRM_CLAVE`) sí está bien; su valor, nunca.
- No afirmar que algo "ya está publicado" si no se pudo verificar en el sitio en vivo: escribir "unido en GitHub; falta confirmar en el sitio".
- Si una entrada nueva contradice una anterior (por ejemplo un precio), anotar la corrección como entrada nueva y avisar al usuario; no borrar la vieja.
