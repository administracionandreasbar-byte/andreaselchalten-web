---
name: sonido-reels
description: Ponerle sonido a reels y videos de Andreas: crear efectos desde palabras, colocar sonidos reales en el cuadro exacto, buscar audios con licencia abierta y revisar la mezcla. Usar cuando pidan "sonorizá el reel", "agregá efectos de sonido", "buscá un sonido para...", "el audio suena sintético" o "revisá el audio de este video". Explica cuándo usar cada herramienta (skills earshot y real-sfx, y Openverse) y qué licencias sirven para un comercio.
---

# Sonido para reels y videos

Los reels, Instagram y Google Maps son del área **Contenido**: se registran en su "Estado actual" y no en este proyecto. Esta skill es la caja de herramientas de sonido; si lo que se hace afecta al sitio (un link, una página), eso sí se anota con `registrar-cambios`.

## Qué herramienta para qué

| Necesito… | Usar | Notas |
|---|---|---|
| Un efecto simple sin tener la grabación (clic, "whoosh", éxito, pasos, ambiente de salón o calle) | skill `earshot` (`earshot make "…" -o archivo.wav`) | Crea el sonido al momento a partir de palabras; el sonido es del usuario. Los ejemplos del repositorio están en inglés: pedirlo en inglés. |
| Escuchar un audio o video que Claude no puede oír: describirlo, medirlo, compararlo, ver si suena grabado o sintético | skill `earshot` (`describe`, `measure`, `critique`, `timeline`) | Los comandos que "escuchan" necesitan el extra `listen` y bajar ~1,1 GB de modelos. |
| Poner sonidos **reales** en el fotograma exacto de un video animado (texto en movimiento, pantalla grabada, HyperFrames) y conservar música y voz | skill `real-sfx` | Devuelve un MP4 nuevo y una pista WAV aparte. No trae biblioteca de sonidos propia: solo 78 sonidos de interfaz CC0. Hay que darle una biblioteca (carpeta) de sonidos reales. |
| Encontrar un audio con licencia abierta | Openverse (openverse.org) y Freesound con filtro CC0 | No es skill: se busca y se baja el archivo. |

**Alcance real:** estas herramientas están pensadas para videos animados o hechos con código. Para un reel filmado de comida o del salón sirven menos: ayudan a sumar efectos a los textos animados y a revisar el audio, pero no reemplazan al montaje. Decirlo así cuando alguien espere que "le ponga sonido a cualquier video".

## Licencias (un comercio usa los videos para vender)

- Usar solo audios **CC0 / dominio público**, o con licencia que permita uso comercial. Evitar cualquier licencia "no comercial" (NC).
- Con licencia CC BY hay que dar crédito: solo usarla si se puede poner el crédito en el epígrafe.
- Si no se puede confirmar la licencia de un archivo, **no usarlo**.
- Guardar junto al video un archivo de texto con, para cada sonido: nombre, autor, licencia y link de origen.
- Los 78 sonidos de interfaz que trae `real-sfx` son CC0 (hay un archivo de licencia en `real-sfx/vendor/node_modules/uisfx/`).
- Los sonidos que crea `earshot` los genera el programa: no hay un autor que pida crédito.

## Flujo

1. Pedir (o ubicar) el video y qué momentos necesitan sonido. Trabajar sobre una **copia**: nunca pisar el original.
2. Elegir la herramienta de la tabla. Si hay una biblioteca de sonidos reales, `real-sfx`; si no, `earshot` para efectos simples.
3. Poner los archivos de trabajo y el resultado **fuera del repositorio** (los videos pesan y el repositorio es del sitio). Usar el directorio temporal de la sesión y entregar el resultado al usuario.
4. Claude **no oye**: decir qué se comprobó con números (duración, volumen, sincronía) y qué tiene que escuchar la persona antes de publicar. No decir "suena bien".
5. Dejar el resultado como MP4 nuevo + pista de efectos (WAV) aparte, más el archivo de licencias.

## Instalación y entorno

- **earshot (paquete):** va en un entorno virtual fuera del repositorio, con la versión revisada:
  `python3 -m venv <tmp>/venv && <tmp>/venv/bin/pip install "earshot @ git+https://github.com/Leonxlnx/earshot@7a7f7c5c70d4a763a1eca4b3666af7c77e313f97"`.
  Necesita `ffmpeg` solo para escribir ogg, mp3, m4a y webm (wav y flac no). Para escuchar: `pip install "earshot[listen] @ git+…"`.
- **real-sfx:** ya está como skill. Primero `python3 -I .claude/skills/real-sfx/scripts/setup.py check`. Necesita Python 3.9+ y ffmpeg con ffprobe.
- **Verificado en el entorno de Claude Code (25/11/2026):** `earshot make "a soft success sound"` generó un wav de 0,36 s y `setup.py check` de real-sfx dio ffmpeg, ffprobe, node y python en orden.
- **Red del entorno de Claude Code:** PyPI funciona; `huggingface.co`, `freesound.org` y `api.openverse.org` están **bloqueados**. Sin Hugging Face no bajan los modelos de escucha (earshot `listen`, real-sfx `listen.py`), y sin Freesound/Openverse no se pueden buscar ni bajar audios desde la sesión. Opciones: que el usuario agregue esos hosts al entorno (configuración del entorno, sección de red), o bajar los audios él y dárselos a Claude.
- Esta skill no se probó con un reel real todavía: la primera vez, empezar con un video corto y revisar el resultado con el usuario.

## Origen y mantenimiento

`earshot` y `real-sfx` son copias de repositorios de terceros (MIT), con el commit anotado en su archivo `ORIGEN.md`. Se revisaron leyendo la documentación y buscando llamadas de red o ejecución de comandos en los scripts; no es una auditoría completa del código. No editar sus archivos: para actualizar, volver a copiarlos desde el repositorio de origen.
