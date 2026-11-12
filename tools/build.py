# -*- coding: utf-8 -*-
"""Genera las páginas del sitio en español e inglés a partir de tools/data.py.
Uso: python3 tools/build.py   (desde la raíz del repositorio)"""
import os, html, json
from data import NEGOCIO as N, MENU, MAS_PEDIDOS, RESENAS, MENU_AGENCIAS, PLATOS_AGENCIAS, VIANDA

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMINIO = "https://andreaselchalten.com"
INDEXAR = False  # pasar a True cuando los dueños aprueben la publicación

RUTAS = {
    "inicio":   {"es": "/", "en": "/en/"},
    "menu":     {"es": "/menu/", "en": "/en/menu/"},
    "agencias": {"es": "/agencias/", "en": "/en/agencies/"},
    "reservas": {"es": "/reservas/", "en": "/en/reservations/"},
}
e = html.escape

def precio(n, lang):
    s = f"{n:,}"
    return "$" + (s.replace(",", ".") if lang == "es" else s)

ICONO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"/></svg>'

def wa_link(texto):
    from urllib.parse import quote
    return f"https://wa.me/{N['whatsapp']}?text={quote(texto)}"

T = {
    "es": {
        "nav": [("menu", "Menú"), ("agencias", "Grupos y agencias"), ("reservas", "Reservar")],
        "saltar": "Ir al contenido",
        "wa_hola": "Hola, vi la web de Andreas y quiero consultar: ",
        "legal": "Venta de alcohol prohibida a menores de 18 años. Beber con moderación. Ley 24.788.",
        "pie_horario": "Todos los días de 12 a 24 h",
        "pie_hh": "Happy Hour de 16 a 20 h",
        "estrellas_txt": "estrellas",
        "orig": {"es": "", "en": "Traducida del inglés", "pt": "Traducida del portugués", "fr": "Traducida del francés", "de": "Traducida del alemán"},
    },
    "en": {
        "nav": [("menu", "Menu"), ("agencias", "Groups & agencies"), ("reservas", "Book a table")],
        "saltar": "Skip to content",
        "wa_hola": "Hi, I saw the Andreas website and I'd like to ask: ",
        "legal": "Alcohol is not sold to anyone under 18. Please drink responsibly.",
        "pie_horario": "Open daily, noon to midnight",
        "pie_hh": "Happy Hour 4 to 8 pm",
        "estrellas_txt": "stars",
        "orig": {"en": "", "es": "Translated from Spanish", "pt": "Translated from Portuguese", "fr": "Translated from French", "de": "Translated from German"},
    },
}

def head(lang, pagina, titulo, descripcion):
    otro = "en" if lang == "es" else "es"
    robots = "" if INDEXAR else '<meta name="robots" content="noindex">\n'
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(titulo)}</title>
<meta name="description" content="{e(descripcion)}">
{robots}<link rel="canonical" href="{DOMINIO}{RUTAS[pagina][lang]}">
<link rel="alternate" hreflang="{lang}" href="{DOMINIO}{RUTAS[pagina][lang]}">
<link rel="alternate" hreflang="{otro}" href="{DOMINIO}{RUTAS[pagina][otro]}">
<meta name="theme-color" content="#211f20">
<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(descripcion)}">
<meta property="og:image" content="{DOMINIO}/img/salon-sandwich-1400.webp">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-title" content="Andreas">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400..900&display=swap">
<link rel="stylesheet" href="/css/site.css">
</head>
<body>
<a class="salto" href="#contenido">{T[lang]['saltar']}</a>
"""

def header(lang, pagina):
    t = T[lang]
    nav = "".join(
        f'<a href="{RUTAS[k][lang]}"{" aria-current=\"page\"" if k == pagina else ""}>{e(v)}</a>' for k, v in t["nav"])
    if lang == "es":
        idioma = f'<span>ES</span><a href="{RUTAS[pagina]["en"]}" hreflang="en" lang="en" aria-label="English version">EN</a>'
    else:
        idioma = f'<a href="{RUTAS[pagina]["es"]}" hreflang="es" lang="es" aria-label="Versión en español">ES</a><span>EN</span>'
    return f"""<header class="top">
<div class="wrap">
<a class="marca" href="{RUTAS['inicio'][lang]}"><img src="/img/icon-192.png" alt="" width="44" height="44"><span>Andreas</span></a>
<nav class="nav" aria-label="{'Principal' if lang=='es' else 'Main'}">{nav}</nav>
<div class="idioma">{idioma}</div>
</div>
</header>
<main id="contenido">
"""

def footer(lang):
    t = T[lang]
    links = "".join(f'<li><a href="{RUTAS[k][lang]}">{e(v)}</a></li>' for k, v in t["nav"])
    return f"""</main>
<footer class="pie">
<div class="wrap">
<img src="/img/logo-512.webp" alt="Andreas, Food and Drinks for Adventurers" width="84" height="84" loading="lazy">
<div>
<p><b>Andreas, Food &amp; Drinks for Adventurers</b><br>{e(N['direccion'])}<br>{t['pie_horario']}. {t['pie_hh']}.</p>
<p><a href="https://wa.me/{N['whatsapp']}">WhatsApp {N['whatsapp_visible']}</a> · <a href="{N['instagram']}">Instagram @andreaselchalten</a></p>
</div>
<ul>{links}</ul>
<p class="legal">{t['legal']}</p>
</div>
</footer>
<script src="/js/site.js" defer></script>
</body>
</html>
"""

def estrellas(n):
    return "★" * n + "☆" * (5 - n)

def resenas_html(lang, cuales):
    t = T[lang]
    out = []
    for r in [RESENAS[i] for i in cuales]:
        nota = t["orig"][r["lang"]]
        out.append(f"""<figure class="resena">
<div class="estrellas" aria-label="{r['estrellas']} {t['estrellas_txt']}">{estrellas(r['estrellas'])}</div>
<blockquote><p>{e(r[lang])}</p></blockquote>
<figcaption><span>{e(r['autor'])}</span><span>{nota}</span></figcaption>
</figure>""")
    return '<div class="resenas">' + "\n".join(out) + "</div>"

def puntaje(lang):
    if lang == "es":
        txt = f"<b>{N['rating']}</b><span><span class=\"estrellas\" aria-hidden=\"true\">★★★★★</span><br>en Google, más de {N['resenas']} reseñas</span>"
    else:
        txt = f"<b>{N['rating_en']}</b><span><span class=\"estrellas\" aria-hidden=\"true\">★★★★★</span><br>on Google, {N['resenas']}+ reviews</span>"
    return f'<a class="puntaje" href="{N["maps"]}">{txt}</a>'

def btn_wa(texto, mensaje, clase="btn btn-wa"):
    return f'<a class="{clase}" href="{wa_link(mensaje)}">{ICONO_WA}{e(texto)}</a>'

# ---------------- INICIO ----------------
def inicio(lang):
    es = lang == "es"
    t = T[lang]
    platos = [
        ("burger-tehuelche", "Tehuelche", "Hamburguesa con guacamole, panceta y cheddar." if es else "Burger with guacamole, bacon and cheddar.", 33000),
        ("milanesa-napolitana", "Milanesa napolitana", "Abundante, para compartir después del sendero." if es else "A generous breaded cutlet, made for sharing after the trail.", 33000),
        ("sandwich-puestero", "Sandwich del Puestero" if es else "Puestero sandwich", "Bondiola braseada con cerveza roja, con papas." if es else "Red ale-braised pork shoulder, with fries.", 34000),
        ("fetuccini-carbonara", "Fetuccini carbonara" if es else "Fettuccine carbonara", "Pasta con la salsa que elijas." if es else "Pasta with the sauce you choose.", 25000),
    ]
    platos_html = "".join(f"""<article class="plato">
<img src="/img/{img}-800.webp" alt="{e(nom)}" width="800" height="1067" loading="lazy">
<h3>{e(nom)}</h3>
<p>{e(desc)} <span class="precio">{precio(p, lang)}</span></p>
</article>""" for img, nom, desc, p in platos)
    titulo = "Andreas – Food & Drinks for Adventurers | Restaurante en El Chaltén" if es else "Andreas – Food & Drinks for Adventurers | Restaurant in El Chaltén"
    desc = ("Restaurante en El Chaltén para después del sendero: hamburguesas, milanesas, pizzas, pastas y bife, con cerveza artesanal tirada. Todos los días de 12 a 24 h." if es else
            "Restaurant in El Chaltén for after the trail: burgers, milanesas, pizza, pasta and steak, with craft beer on tap. Open daily, noon to midnight.")
    h = head(lang, "inicio", titulo, desc) + header(lang, "inicio")
    h += f"""<section class="hero">
<div class="wrap">
<div>
<p class="estado" data-estado><i></i><span>{'Todos los días de 12 a 24 h' if es else 'Open daily, noon to midnight'}</span></p>
<h1>{'Bajaste del cerro. Acá se come.' if es else 'Off the trail. Time to eat.'}</h1>
<p class="bajada">{'Hamburguesas, milanesas, pizzas caseras y bife, con cerveza tirada. En el centro de El Chaltén, sobre la calle principal.' if es else 'Burgers, milanesas, homemade pizza and steak, with beer on tap. In the centre of El Chaltén, on the main street.'}</p>
<div class="acciones">
{btn_wa('Reservar por WhatsApp' if es else 'Book on WhatsApp', t['wa_hola'] + ('quiero reservar una mesa.' if es else 'I want to book a table.'))}
<a class="btn btn-linea" href="{RUTAS['menu'][lang]}">{'Ver el menú' if es else 'See the menu'}</a>
</div>
</div>
<figure>
<img src="/img/salon-sandwich-1400.webp" srcset="/img/salon-sandwich-800.webp 800w, /img/salon-sandwich-1400.webp 1400w" sizes="(max-width:860px) 100vw, 46vw" alt="{'Sandwich del Puestero con papas, en el salón de Andreas, con la calle San Martín de fondo' if es else 'Puestero sandwich with fries in the Andreas dining room, San Martín street behind'}" width="1400" height="1867" fetchpriority="high">
<figcaption>{'Sandwich del Puestero, en el salón.' if es else 'The Puestero sandwich, in our dining room.'}</figcaption>
</figure>
</div>
</section>
<nav class="carteles" aria-label="{'Datos rápidos' if es else 'Quick facts'}">
<div class="wrap">
<a class="cartel" href="#ubicacion"><small>{'Horario' if es else 'Hours'}</small><strong>{'Todos los días, 12 a 24 h' if es else 'Every day, noon to midnight'}</strong></a>
<a class="cartel" href="#happy-hour"><small>Happy Hour</small><strong>{'16 a 20 h, 2 cervezas por $15.000' if es else '4 to 8 pm, 2 beers for $15,000'}</strong></a>
<a class="cartel" href="{N['maps']}"><small>{'Cómo llegar' if es else 'Directions'}</small><strong>San Martín 351</strong></a>
</div>
</nav>
<section class="seccion">
<div class="wrap">
<div class="cabeza">
<div><h2>{'Lo que más sale' if es else 'What people order'}</h2>
<p>{'Platos abundantes. Hamburguesas y sándwiches vienen con papas fritas.' if es else 'Generous plates. Burgers and sandwiches come with fries.'}</p></div>
<a class="btn btn-linea" href="{RUTAS['menu'][lang]}">{'Menú completo con precios' if es else 'Full menu with prices'}</a>
</div>
<div class="platos">{platos_html}</div>
</div>
</section>
<section class="hh" id="happy-hour">
<div class="wrap">
<div class="grande">{'16–20 h' if es else '4–8 pm'}</div>
<p><b>Happy Hour.</b> {'Dos cervezas por $15.000, todos los días. Ideal para la vuelta del sendero, en el salón calefaccionado o en las mesas de afuera.' if es else 'Two beers for $15,000, every day. Just right after the trail, in our heated dining room or at the outdoor tables.'}</p>
{btn_wa('Consultar' if es else 'Ask us', t['wa_hola'], 'btn btn-linea')}
</div>
</section>
<section class="seccion alt">
<div class="wrap">
<div class="cabeza">
<div><h2>{'Lo dicen los que bajaron del cerro' if es else 'From people who just came down the mountain'}</h2>
<p>{'Reseñas reales de Google, de octubre y noviembre de 2026.' if es else 'Real Google reviews from October and November 2026.'}</p></div>
{puntaje(lang)}
</div>
{resenas_html(lang, [0,1,2,3,4,5,6,7])}
</div>
</section>
<section class="seccion">
<div class="wrap dividido">
<img style="object-position:50% 88%" src="/img/napolitana-salon-800.webp" alt="{'Milanesa napolitana con ensalada en el salón de noche' if es else 'Milanesa napolitana with salad in the dining room at night'}" width="800" height="1067" loading="lazy">
<div>
<h2>{'Grupos, agencias y guías' if es else 'Groups, agencies and guides'}</h2>
<p style="margin-top:14px">{'Recibimos grupos de hasta 25 personas con menú cerrado, servido en menos de 30 minutos. Guía y chofer no pagan, emitimos factura A y coordinamos todo por escrito.' if es else 'We host groups of up to 25 people with a set menu, served in under 30 minutes. Guides and drivers eat free, we issue invoices and confirm everything in writing.'}</p>
<div class="acciones" style="margin-top:22px"><a class="btn btn-wa" href="{RUTAS['agencias'][lang]}">{'Ver la propuesta para grupos' if es else 'See our group offer'}</a></div>
</div>
</div>
</section>
<section class="seccion alt" id="ubicacion">
<div class="wrap dividido">
<div>
<h2>{'Dónde estamos' if es else 'Where to find us'}</h2>
<p style="margin-top:14px">{e(N['direccion'])}. {'En pleno centro, sobre la calle principal.' if es else 'Right on the main street, in the centre of town.'}</p>
<table class="horario">
<tr><td>{'Todos los días' if es else 'Every day'}</td><td>{'12 a 24 h' if es else '12 pm – 12 am'}</td></tr>
<tr><td>Happy Hour</td><td>{'16 a 20 h' if es else '4 – 8 pm'}</td></tr>
</table>
<p>{'Salón calefaccionado, mesas afuera y wifi.' if es else 'Heated dining room, outdoor tables and free wifi.'}</p>
<div class="acciones"><a class="btn btn-wa" href="{N['maps']}">{'Cómo llegar' if es else 'Get directions'}</a>{btn_wa('WhatsApp', t['wa_hola'], 'btn btn-linea')}</div>
</div>
<iframe class="mapa" src="{N['maps_embed']}" title="{'Mapa de Andreas en El Chaltén' if es else 'Map of Andreas in El Chaltén'}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</div>
</section>
"""
    return h + footer(lang)

# ---------------- MENÚ ----------------
def menu(lang):
    es = lang == "es"
    chips = "".join(f'<a href="#{sid}">{e(nes if es else nen)}</a>' for sid, nes, nen, *_ in MENU)
    secciones = []
    for sid, nes, nen, notaes, notaen, items in MENU:
        lis = []
        for iid, n_es, n_en, d_es, d_en, p, tags in items:
            marcas = ""
            if iid in MAS_PEDIDOS:
                marcas += f'<span class="marca-item m-top">{"Más pedida" if es else "Most ordered"}</span>'
            if "veg" in tags:
                marcas += f'<span class="marca-item m-veg">{"Vegetariana" if es else "Vegetarian"}</span>'
            d = d_es if es else d_en
            lis.append(f'<li class="item"><h3>{e(n_es if es else n_en)}{marcas}</h3><span class="precio">{precio(p, lang)}</span>{f"<p>{e(d)}</p>" if d else ""}</li>')
        nota = notaes if es else notaen
        secciones.append(f'<section id="{sid}"><h2>{e(nes if es else nen)}</h2>{f"<p class=\"nota\">{e(nota)}</p>" if nota else ""}<ul class="items">{"".join(lis)}</ul></section>')
    titulo = "Menú de Andreas con precios | El Chaltén" if es else "Andreas menu with prices | El Chaltén"
    desc = "Carta completa con precios: hamburguesas, milanesas, pizzas, pastas, bife, cervezas, tragos y vinos." if es else "Full menu with prices: burgers, milanesas, pizza, pasta, steak, beer, cocktails and wine."
    h = head(lang, "menu", titulo, desc) + header(lang, "menu")
    h += f"""<section class="menu-hero"><div class="wrap">
<h1>{'Menú' if es else 'Menu'}</h1>
<p>{'Precios en pesos argentinos, actualizados en noviembre de 2026. Hamburguesas y sándwiches incluyen papas fritas.' if es else 'Prices in Argentine pesos, updated November 2026. Burgers and sandwiches come with fries.'}</p>
</div></section>
<nav class="chips" aria-label="{'Secciones del menú' if es else 'Menu sections'}"><div class="wrap">{chips}</div></nav>
<div class="carta"><div class="wrap">
{''.join(secciones)}
<p class="aviso">{'¿Alergias o restricciones? Avisale al mozo antes de pedir. La Corinto es vegetariana; no tenemos platos veganos.' if es else 'Allergies or dietary needs? Tell your server before ordering. The Corinto burger is vegetarian; we have no vegan dishes.'}<br>{T[lang]['legal']}</p>
</div></div>
"""
    return h + footer(lang)

# ---------------- AGENCIAS ----------------
def agencias(lang):
    es = lang == "es"
    t = T[lang]
    filas = "".join(f'<tr><td><b>{e(a if es else b)}</b><br><span style="color:var(--suave)">{e(c if es else d)}</span></td><td class="precio">{precio(p, lang)}</td></tr>' for a, b, c, d, p in MENU_AGENCIAS)
    platos = "".join(f"<li>{e(a if es else b)}</li>" for a, b in PLATOS_AGENCIAS)
    msg_empezar = ("Hola, vi la web de Andreas. Trabajo en una agencia y quiero empezar a trabajar con ustedes." if es else
                   "Hi, I saw the Andreas website. I work for an agency and would like to start working with you.")
    titulo = "Grupos y agencias | Andreas, El Chaltén" if es else "Groups and agencies | Andreas, El Chaltén"
    desc = ("Menú grupal para agencias y guías en El Chaltén: hasta 25 personas, servido en menos de 30 minutos, guía y chofer sin cargo, factura A." if es else
            "Group menu for agencies and guides in El Chaltén: up to 25 people, served in under 30 minutes, guides and drivers eat free.")
    pasos = [
        ("Reservá", "Hasta 24 horas antes, sujeto a disponibilidad.", "Book", "Up to 24 hours ahead, subject to availability."),
        ("Elegí los platos", "La noche anterior a la excursión.", "Choose the dishes", "The night before the excursion."),
        ("Confirmá el horario", "Llegada estimada, a más tardar la mañana del mismo día.", "Confirm the time", "Estimated arrival, by the morning of the same day at the latest."),
        ("Lo confirmamos por escrito", "Pasajeros, menú y horario acordados.", "We confirm in writing", "Passengers, menu and time agreed."),
        ("Servimos en menos de 30 minutos", "Con menú único y horario confirmado.", "Served in under 30 minutes", "With a single set menu and a confirmed time."),
        ("Factura y pago", "Enviamos la factura dentro de las 72 horas hábiles; el pago, dentro de las 72 horas hábiles de recibirla.", "Invoice and payment", "We send the invoice within 72 business hours; payment is due within 72 business hours of receiving it."),
    ]
    pasos_html = "".join(f"<li><b>{e(a if es else c)}</b><span>{e(b if es else d)}</span></li>" for a, b, c, d in pasos)
    h = head(lang, "agencias", titulo, desc) + header(lang, "agencias")
    h += f"""<section class="hero">
<div class="wrap">
<div>
<h1>{'Tu grupo, servido en menos de 30 minutos.' if es else 'Your group, served in under 30 minutes.'}</h1>
<p class="bajada">{'Menú cerrado para agencias, guías y transportes en el centro de El Chaltén. Precio fijo por persona, para que le sumes tu margen.' if es else 'Set menus for agencies, guides and transport companies in the centre of El Chaltén. A fixed price per person, so you can add your own margin.'}</p>
<div class="acciones">
{btn_wa('Empezar a trabajar juntos' if es else 'Start working with us', msg_empezar)}
<a class="btn btn-linea" href="#reservar-grupo">{'Reservar un grupo' if es else 'Book a group'}</a>
</div>
</div>
<figure><img src="/img/milanesa-napolitana-800.webp" alt="{'Milanesa napolitana con ensalada' if es else 'Milanesa napolitana with salad'}" width="800" height="1067"></figure>
</div>
</section>
<section class="seccion">
<div class="wrap">
<h2>{'Lo que necesitás saber' if es else 'What you need to know'}</h2>
<div class="datos">
<div class="dato"><b>{'Hasta 25' if es else 'Up to 25'}</b><span>{'personas sentadas adentro. Patio extra con buen clima.' if es else 'seated indoors. Extra patio seating in good weather.'}</span></div>
<div class="dato"><b>{'Menos de 30 min' if es else 'Under 30 min'}</b><span>{'con menú único y horario confirmado.' if es else 'with a single set menu and a confirmed time.'}</span></div>
<div class="dato"><b>{'Sin cargo' if es else 'Free'}</b><span>{'la comida de guía y chofer, desde 4 pasajeros.' if es else 'meals for guides and drivers, from 4 passengers.'}</span></div>
<div class="dato"><b>{'Factura A' if es else 'Invoices'}</b><span>{'y pago a 72 horas hábiles de recibida.' if es else 'issued, payment due 72 business hours after receipt.'}</span></div>
</div>
<p>{'Atención en español e inglés. Estacionamiento para el transporte. Podemos recibir grupos fuera del horario habitual si lo coordinamos antes.' if es else 'Service in Spanish and English. Parking for your vehicle. We can host groups outside regular hours if arranged in advance.'}</p>
</div>
</section>
<section class="seccion alt">
<div class="wrap dividido" style="align-items:start">
<div>
<h2>{'Menús por persona' if es else 'Menus per person'}</h2>
<table class="tarifas" style="margin-top:20px">
<thead><tr><th>{'Modalidad' if es else 'Option'}</th><th>{'Por persona' if es else 'Per person'}</th></tr></thead>
<tbody>{filas}</tbody>
</table>
<p style="margin-top:14px;color:var(--suave);font-size:.95rem">{'En las modalidades sin bebida, los pasajeros pueden comprarla en el local.' if es else 'For options without drinks, passengers can buy them at the restaurant.'}</p>
</div>
<div>
<h3>{'Platos a elegir' if es else 'Main course options'}</h3>
<ul class="lista" style="margin-top:12px">{platos}</ul>
<h3 style="margin-top:28px">{'Viandas para la excursión' if es else 'Packed lunches'} <span class="precio">{precio(VIANDA[0], lang)}</span></h3>
<p style="margin-top:8px">{e(VIANDA[1] if es else VIANDA[2])} {'Listas a la hora que nos digas.' if es else 'Ready at the time you set.'}</p>
</div>
</div>
</section>
<section class="seccion">
<div class="wrap">
<h2>{'Cómo funciona' if es else 'How it works'}</h2>
<ol class="pasos" style="margin-top:24px">{pasos_html}</ol>
</div>
</section>
<section class="seccion alt">
<div class="wrap">
<div class="cabeza"><div><h2>{'Rápido y abundante, según quienes ya vinieron' if es else 'Fast and generous, say our guests'}</h2></div>{puntaje(lang)}</div>
{resenas_html(lang, [3,5,2,7])}
</div>
</section>
<section class="seccion" id="reservar-grupo">
<div class="wrap">
<h2>{'Reservar un grupo' if es else 'Book a group'}</h2>
<p style="margin-top:12px">{'Completá los datos y te llega todo armado a nuestro WhatsApp. Te confirmamos por escrito.' if es else 'Fill in the details and they arrive ready on our WhatsApp. We confirm in writing.'}</p>
{form_grupo(lang)}
</div>
</section>
"""
    return h + footer(lang)

def form_grupo(lang):
    es = lang == "es"
    intro = "Hola, vi la web de Andreas y quiero reservar un grupo." if es else "Hi, I saw the Andreas website and want to book a group."
    opciones = "".join(f'<option>{e(a if es else b)} ({precio(p, lang)})</option>' for a, b, c, d, p in MENU_AGENCIAS)
    opciones += f'<option>{"Viandas" if es else "Packed lunches"} ({precio(VIANDA[0], lang)})</option>'
    return f"""<form class="form" data-wa="{e(intro)}" novalidate style="margin-top:24px">
<div class="full"><label for="g-agencia">{'Agencia o guía' if es else 'Agency or guide'}</label><input id="g-agencia" required data-etiqueta="{'Agencia' if es else 'Agency'}" autocomplete="organization"></div>
<div><label for="g-fecha">{'Fecha' if es else 'Date'}</label><input id="g-fecha" type="date" required data-etiqueta="{'Fecha' if es else 'Date'}"></div>
<div><label for="g-hora">{'Llegada estimada' if es else 'Estimated arrival'}</label><input id="g-hora" type="time" required data-etiqueta="{'Hora' if es else 'Time'}"></div>
<div><label for="g-pax">{'Pasajeros' if es else 'Passengers'}</label><input id="g-pax" type="number" min="4" max="25" required inputmode="numeric" data-etiqueta="{'Pasajeros' if es else 'Passengers'}"><p class="ayuda">{'De 4 a 25 personas.' if es else 'From 4 to 25 people.'}</p></div>
<div><label for="g-menu">{'Menú' if es else 'Menu'}</label><select id="g-menu" required data-etiqueta="{'Menú' if es else 'Menu'}"><option value="">{'Elegí una opción' if es else 'Choose an option'}</option>{opciones}</select></div>
<div class="full"><label for="g-notas">{'Comentarios' if es else 'Notes'}</label><textarea id="g-notas" data-etiqueta="{'Comentarios' if es else 'Notes'}" placeholder="{'Restricciones alimentarias, datos para la factura A, etc.' if es else 'Dietary needs, invoicing details, etc.'}"></textarea></div>
<p class="error full" hidden role="alert">{'Revisá los campos marcados: faltan datos.' if es else 'Please check the highlighted fields.'}</p>
<div class="full"><button class="btn btn-wa" type="submit">{ICONO_WA}{'Enviar por WhatsApp' if es else 'Send on WhatsApp'}</button></div>
</form>"""

# ---------------- RESERVAS ----------------
def reservas(lang):
    es = lang == "es"
    intro = "Hola, vi la web de Andreas y quiero reservar una mesa." if es else "Hi, I saw the Andreas website and want to book a table."
    titulo = "Reservar mesa | Andreas, El Chaltén" if es else "Book a table | Andreas, El Chaltén"
    desc = "Reservá tu mesa en Andreas, El Chaltén. Todos los días de 12 a 24 h." if es else "Book your table at Andreas, El Chaltén. Open daily, noon to midnight."
    h = head(lang, "reservas", titulo, desc) + header(lang, "reservas")
    h += f"""<section class="menu-hero"><div class="wrap">
<h1>{'Reservar mesa' if es else 'Book a table'}</h1>
<p>{'Completá los datos y se abre WhatsApp con tu reserva escrita. La mesa queda confirmada cuando te respondemos.' if es else 'Fill in your details and WhatsApp opens with your booking ready to send. Your table is confirmed when we reply.'}</p>
</div></section>
<section class="seccion"><div class="wrap dividido" style="align-items:start">
<form class="form" data-wa="{e(intro)}" novalidate>
<div class="full"><label for="r-nombre">{'Nombre' if es else 'Name'}</label><input id="r-nombre" required autocomplete="name" data-etiqueta="{'Nombre' if es else 'Name'}"></div>
<div><label for="r-pax">{'Personas' if es else 'People'}</label><input id="r-pax" type="number" min="1" max="25" required inputmode="numeric" data-etiqueta="{'Personas' if es else 'People'}"></div>
<div><label for="r-fecha">{'Fecha' if es else 'Date'}</label><input id="r-fecha" type="date" required data-etiqueta="{'Fecha' if es else 'Date'}"></div>
<div><label for="r-hora">{'Hora' if es else 'Time'}</label><input id="r-hora" type="time" min="12:00" max="23:00" required data-etiqueta="{'Hora' if es else 'Time'}"><p class="ayuda">{'Abrimos de 12 a 24 h.' if es else 'We are open noon to midnight.'}</p></div>
<div><label for="r-idioma">{'Idioma' if es else 'Language'}</label><select id="r-idioma" data-etiqueta="{'Idioma' if es else 'Language'}"><option>Español</option><option{' selected' if not es else ''}>English</option><option>Português</option><option>Français</option></select></div>
<div class="full"><label for="r-notas">{'Comentarios' if es else 'Notes'}</label><textarea id="r-notas" data-etiqueta="{'Comentarios' if es else 'Notes'}" placeholder="{'Cumpleaños, alergias, silla para bebé…' if es else 'Birthday, allergies, high chair…'}"></textarea></div>
<label class="check full"><input type="checkbox" required> <span>{'Acepto que Andreas use estos datos solo para gestionar mi reserva (ley 25.326).' if es else 'I agree that Andreas will use this information only to manage my booking.'}</span></label>
<p class="error full" hidden role="alert">{'Revisá los campos marcados: faltan datos.' if es else 'Please check the highlighted fields.'}</p>
<div class="full"><button class="btn btn-wa" type="submit">{ICONO_WA}{'Enviar reserva por WhatsApp' if es else 'Send booking on WhatsApp'}</button></div>
</form>
<div>
<img src="/img/burger-tehuelche-800.webp" alt="{'Hamburguesa Tehuelche con papas fritas' if es else 'Tehuelche burger with fries'}" width="800" height="1067" loading="lazy" style="aspect-ratio:4/3">
<p style="margin-top:16px">{'¿Son más de 25 o vienen con una agencia?' if es else 'More than 25 people, or travelling with an agency?'} <a href="{RUTAS['agencias'][lang]}">{'Mirá la propuesta para grupos.' if es else 'See our group offer.'}</a></p>
</div>
</div></section>
"""
    return h + footer(lang)

def escribir(ruta, contenido):
    destino = os.path.join(RAIZ, ruta.strip("/"), "index.html") if ruta != "/" else os.path.join(RAIZ, "index.html")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, "w", encoding="utf-8") as f:
        f.write(contenido)

for lang in ("es", "en"):
    escribir(RUTAS["inicio"][lang], inicio(lang))
    escribir(RUTAS["menu"][lang], menu(lang))
    escribir(RUTAS["agencias"][lang], agencias(lang))
    escribir(RUTAS["reservas"][lang], reservas(lang))

manifest = {"name": "Andreas – Food & Drinks for Adventurers", "short_name": "Andreas", "start_url": "/", "display": "standalone",
            "background_color": "#f8f9f0", "theme_color": "#211f20",
            "icons": [{"src": "/img/icon-192.png", "sizes": "192x192", "type": "image/png"},
                      {"src": "/img/logo-512.png", "sizes": "512x512", "type": "image/png"}]}
with open(os.path.join(RAIZ, "manifest.webmanifest"), "w") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=1)
print("Listo")
