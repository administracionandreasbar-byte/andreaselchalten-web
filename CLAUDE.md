# Sitio de Andreas: cómo trabajar en este repositorio

Sitio de Andreas, restaurante de El Chaltén (andreaselchalten.com). Corre en Cloudflare Workers. Las páginas se generan desde tools/data.py con `python3 tools/build.py`. Las skills del proyecto están en .claude/skills/.

## Reparto de trabajo: tres agentes

La sesión principal reparte el trabajo según la dificultad, para gastar lo justo:

| Agente | Modelo | Para qué |
|---|---|---|
| explorador | Haiku | Lo simple: buscar dónde está algo, leer y resumir archivos, listar cambios, renombrar. |
| implementador | Sonnet | Hacer cambios ya decididos y probarlos: páginas, CSS, JS, worker.js, tools/. |
| arquitecto | Opus | Planificar, decidir y resolver lo complejo: cambios grandes, seguridad, CRM, decisiones difíciles de deshacer. |

Reglas:

1. Antes de cada tarea, elegí el agente más barato que alcance. Ante la duda entre dos, empezá por el más barato y subí si no alcanza.
2. Un cambio grande va primero al arquitecto (plan), después al implementador (hacer y probar).
3. Al terminar, decí en una línea qué agente o modelo usaste y por qué.
4. Si Álvaro escribe "a tope", todo va al arquitecto.

## Reglas del proyecto

- Todo cambio de contenido va en español y en inglés.
- Antes de entregar, correr la skill revisar-sitio.
- Nada se une a main sin el ok de Álvaro (skill publicar-sitio).
- Los cambios importantes se anotan en la Bitácora de cruces y en Tareas Andreas (skill registrar-cambios).
