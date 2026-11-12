# -*- coding: utf-8 -*-
"""Datos del sitio de Andreas. Para cambiar precios o platos, editar SOLO este archivo
y correr: python3 tools/build.py"""

NEGOCIO = {
    "whatsapp": "5491127843427",
    "whatsapp_visible": "+54 9 11 2784-3427",
    "direccion": "San Martín 351, El Chaltén, Santa Cruz",
    "instagram": "https://instagram.com/andreaselchalten",
    "maps": "https://www.google.com/maps/search/?api=1&query=Andreas+Food+and+Drinks+San+Mart%C3%ADn+351+El+Chalt%C3%A9n",
    "maps_embed": "https://www.google.com/maps?q=Andreas+Food+%26+Drinks,+San+Mart%C3%ADn+351,+El+Chalt%C3%A9n,+Santa+Cruz&output=embed",
    "rating": "4,5",
    "rating_en": "4.5",
    "resenas": "150",
}

# Platos más vendidos según el POS (octubre 2026). Se revisa cada mes.
MAS_PEDIDOS = {"andreas-burger", "tehuelche", "cheese-bacon", "bife"}

# Cada sección: id, nombre ES, nombre EN, nota ES, nota EN, items
# Cada item: id, nombre ES, nombre EN, descripción ES, descripción EN, precio, etiquetas
MENU = [
    ("carancheo", "Carancheo", "Snacks", "", "", [
        ("papas", "Papas fritas", "French fries", "", "", 12000, []),
        ("papas-cheddar", "Papas con cheddar, panceta y verdeo", "Fries with cheddar, bacon and green onion", "", "", 16000, []),
        ("bastoncitos", "Bastoncitos de mozzarella", "Mozzarella sticks", "", "", 15000, []),
        ("empanada", "Empanada de carne", "Beef empanada", "", "", 5000, []),
        ("chicken-fingers", "Chicken fingers", "Chicken fingers", "", "", 18000, []),
        ("provoleta", "Provoleta con tomates secos", "Grilled provolone with sun-dried tomatoes", "", "", 20000, ["veg"]),
        ("rabas", "Rabas", "Fried squid rings", "", "", 25000, []),
        ("langostinos", "Langostinos apanados", "Breaded prawns", "", "", 30000, []),
    ]),
    ("pizzas", "Pizzas", "Pizzas", "Masa casera.", "Homemade dough.", [
        ("muzza", "Mozzarella", "Mozzarella", "Salsa de tomate y mozzarella.", "Tomato sauce and mozzarella.", 31000, ["veg"]),
        ("napo-pizza", "Napolitana", "Napoletana", "Salsa de tomate, mozzarella, tomate y aceitunas.", "Tomato sauce, mozzarella, tomato and olives.", 37000, ["veg"]),
        ("jym", "Jamón y morrones", "Ham and red peppers", "Salsa de tomate, mozzarella, jamón cocido y morrones.", "Tomato sauce, mozzarella, ham and red peppers.", 37000, []),
        ("fugazza", "Fugazza", "Fugazza", "Cebolla y mozzarella.", "Onion and mozzarella.", 35000, ["veg"]),
    ]),
    ("tablas", "Tablas para compartir", "Sharing platters", "", "", [
        ("tabla-mar", "Tabla 1, de mar", "Platter 1, from the sea", "Langostinos apanados, rabas a la romana, merluza rebozada y papas fritas.", "Breaded prawns, fried squid rings, battered hake and fries.", 70000, []),
        ("tabla-2", "Tabla 2", "Platter 2", "Milanesitas de carne, 2 empanadas, bastoncitos de mozzarella, chicken fingers y papas fritas.", "Mini beef milanesas, 2 empanadas, mozzarella sticks, chicken fingers and fries.", 65000, []),
    ]),
    ("clasicos", "Clásicos", "Classics", "Guarnición a elección: papas fritas o ensalada.", "Choice of side: fries or salad.", [
        ("mila-napo", "Milanesa napolitana con guarnición", "Milanesa napolitana with a side", "", "Breaded beef cutlet topped with ham, tomato sauce and cheese.", 33000, []),
        ("mila-pollo-napo", "Milanesa de pollo napolitana con guarnición", "Chicken milanesa napolitana with a side", "", "", 30000, []),
        ("mila", "Milanesa con guarnición", "Milanesa with a side", "", "Breaded beef cutlet.", 28000, []),
        ("mila-tallarines", "Milanesa con tallarines", "Milanesa with noodles", "", "", 32000, []),
        ("merluza", "Filete de merluza con guarnición", "Hake fillet with a side", "", "", 28000, []),
        ("guiso", "Guiso de lentejas patagónico", "Patagonian lentil stew", "", "", 28000, []),
        ("bondiola-risotto", "Bondiola en cocción lenta sobre risotto cremoso de calabaza", "Slow-cooked pork shoulder on creamy pumpkin risotto", "", "", 30000, []),
        ("cesar", "Ensalada César", "Caesar salad", "", "", 26000, []),
    ]),
    ("carne", "Carne argentina", "Argentine beef", "", "", [
        ("bife", "Bife de chorizo de 400 g", "Sirloin steak, 400 g", "Con salsa criolla y papas canoa.", "With salsa criolla and wedge potatoes.", 43000, []),
    ]),
    ("pastas", "Pastas", "Pasta", "Salsas: scarparo, carbonara, rosa o blanca.", "Sauces: scarparo, carbonara, rosé or white.", [
        ("fetuccini", "Fetuccini con salsa a elección", "Fettuccine with sauce of your choice", "", "", 25000, []),
        ("sorrentinos", "Sorrentinos de jamón y queso", "Ham and cheese sorrentinos", "", "", 29000, []),
        ("noquis", "Ñoquis con salsa a elección", "Gnocchi with sauce of your choice", "", "", 23000, []),
    ]),
    ("sandwich", "Sandwich del Puestero", "Puestero sandwich", "Incluye papas fritas.", "Served with fries.", [
        ("puestero", "Sandwich del Puestero", "Puestero sandwich", "Bondiola braseada con cerveza roja, cebolla y pepino encurtidos, salsa barbacoa y cebolla crispy.", "Red ale-braised pork shoulder, pickled onion and cucumber, barbecue sauce and crispy onion.", 34000, []),
    ]),
    ("hamburguesas", "Hamburguesas", "Burgers", "Medallón de novillo. Todas incluyen papas fritas.", "Beef patty. All served with fries.", [
        ("cheese-bacon", "Cheese Bacon", "Cheese Bacon", "Panceta y cheddar.", "Bacon and cheddar.", 27000, []),
        ("del-viento", "Del Viento", "Del Viento", "Cebolla caramelizada y cheddar.", "Caramelized onion and cheddar.", 31000, []),
        ("andreas-burger", "Andreas Burger", "Andreas Burger", "Cebolla crispy, panceta, cheddar y salsa Andreas.", "Crispy onion, bacon, cheddar and Andreas sauce.", 33000, []),
        ("cordillerana", "Cordillerana", "Cordillerana", "Morrón asado, huevo y queso.", "Roasted red pepper, egg and cheese.", 33000, []),
        ("estepa", "Estepa", "Estepa", "Tomate, lechuga, huevo, jamón y queso.", "Tomato, lettuce, egg, ham and cheese.", 33000, []),
        ("tehuelche", "Tehuelche", "Tehuelche", "Guacamole, tomate, panceta y cheddar.", "Guacamole, tomato, bacon and cheddar.", 33000, []),
        ("corinto", "Corinto", "Corinto", "Medallón de vegetales, cebolla caramelizada, pepinillos, lechuga y tomate.", "Veggie patty, caramelized onion, pickles, lettuce and tomato.", 25000, ["veg"]),
    ]),
    ("postres", "Postres", "Desserts", "", "", [
        ("don-pedro", "Don Pedro", "Don Pedro", "Helado de crema americana, whisky, nueces, crema batida y praliné.", "Vanilla ice cream, whisky, walnuts, whipped cream and praline.", 16000, []),
        ("volcan", "Volcán de chocolate", "Chocolate lava cake", "Con helado y frutos rojos.", "With ice cream and red berries.", 16000, []),
        ("brownie", "Brownie con frutos secos y helado", "Brownie with nuts and ice cream", "", "", 17000, []),
        ("flan", "Flan", "Flan", "Con dulce de leche o crema, $3.000 cada uno.", "Add dulce de leche or cream, $3,000 each.", 9000, []),
    ]),
    ("cervezas", "Cervezas", "Beer", "Happy Hour de 16 a 20 h: 2 cervezas por $15.000.", "Happy Hour 4 to 8 pm: 2 beers for $15,000.", [
        ("pinta", "Rabieta, pinta", "Rabieta, pint", "Golden, IPA o Red Irish.", "Golden, IPA or Red Irish.", 9000, []),
        ("media-pinta", "Rabieta, media pinta", "Rabieta, half pint", "", "", 6000, []),
        ("guinness", "Guinness, lata 473 ml", "Guinness, 473 ml can", "", "", 9000, []),
    ]),
    ("tragos", "Tragos", "Drinks", "", "", [
        ("vermu", "Vermú", "Vermouth", "", "", 10000, []),
        ("gancia", "Gancia", "Gancia", "", "", 10000, []),
        ("fernet", "Fernet Branca con coca", "Fernet and cola", "", "", 11000, []),
        ("campari", "Campari con naranja o pomelo", "Campari with orange or grapefruit", "", "", 11000, []),
        ("cynar", "Cynar con pomelo", "Cynar with grapefruit", "", "", 11000, []),
        ("gin-spirito", "Gin tonic Spirito Blu", "Spirito Blu gin and tonic", "", "", 11000, []),
        ("gin-premium", "Gin tonic Bombay o Tanqueray Sevilla", "Bombay or Tanqueray Sevilla gin and tonic", "", "", 15000, []),
        ("negroni", "Negroni", "Negroni", "", "", 18000, []),
        ("monkey", "Whisky Monkey Shoulder", "Monkey Shoulder whisky", "", "", 18000, []),
        ("jw-black", "Whisky Johnnie Walker Black Label", "Johnnie Walker Black Label whisky", "", "", 20000, []),
        ("jack", "Whiskey Jack Daniel's", "Jack Daniel's whiskey", "", "", 20000, []),
    ]),
    ("vinos", "Vinos", "Wine", "", "", [
        ("copa-blanco", "Copa de vino blanco, 250 ml", "Glass of white wine, 250 ml", "", "", 9000, []),
        ("copa-tinto", "Copa de vino tinto, 250 ml", "Glass of red wine, 250 ml", "", "", 10000, []),
        ("durmientes", "Los Durmientes Malbec o Cabernet", "Los Durmientes Malbec or Cabernet", "", "", 16000, []),
        ("monos", "Cuatro Monos Locos Malbec", "Cuatro Monos Locos Malbec", "", "", 18000, []),
        ("marlo", "Marlo, blanco dulce", "Marlo, sweet white", "", "", 19000, []),
        ("cordero", "Cordero con Piel de Lobo Malbec", "Cordero con Piel de Lobo Malbec", "", "", 20000, []),
        ("casillero", "Casillero del Diablo Malbec", "Casillero del Diablo Malbec", "", "", 21000, []),
        ("rama-negra", "Rama Negra Malbec", "Rama Negra Malbec", "", "", 22000, []),
        ("gran-cordero", "Gran Cordero con Piel de Lobo Malbec", "Gran Cordero con Piel de Lobo Malbec", "", "", 24000, []),
        ("norton", "Norton Reserva Cabernet", "Norton Reserva Cabernet", "", "", 24000, []),
        ("estrella", "Estrella Bianchi Extra Brut", "Estrella Bianchi Extra Brut", "", "", 25000, []),
        ("perro", "Perro Callejero Malbec", "Perro Callejero Malbec", "", "", 26000, []),
        ("trivento", "Trivento Golden Malbec", "Trivento Golden Malbec", "", "", 35000, []),
    ]),
    ("sin-alcohol", "Sin alcohol", "Soft drinks", "", "", [
        ("agua", "Agua 500 cc", "Still water, 500 ml", "", "", 3500, []),
        ("agua-gas", "Agua con gas 500 cc", "Sparkling water, 500 ml", "", "", 5000, []),
        ("saborizada", "Agua saborizada", "Flavored water", "", "", 5000, []),
        ("gaseosa", "Gaseosas", "Soft drinks", "", "", 5000, []),
    ]),
]

# Reseñas reales de Google (octubre y noviembre 2026). Texto original + traducción.
RESENAS = [
    {"autor": "Cristian G.", "estrellas": 5, "lang": "es",
     "es": "Luego de hacer el sendero hacia Laguna de los Tres, el mejor lugar para descansar y tomar una birrita.",
     "en": "After hiking to Laguna de los Tres, the best place to relax and have a beer."},
    {"autor": "Kate B.", "estrellas": 4, "lang": "en",
     "es": "Muy buen ambiente y excelente atención. Nos sentamos afuera y disfrutamos ver a los caminantes terminando su día.",
     "en": "Great atmosphere, excellent service. We sat outside and enjoyed seeing all the hikers finishing their days. Good cozy spot."},
    {"autor": "Micaela G.", "estrellas": 5, "lang": "es",
     "es": "Pedimos una milanesa napolitana y estaba muy muy rica. Abundante como para compartir. Definitivamente volvería.",
     "en": "We ordered a milanesa napolitana and it was absolutely delicious. Generous enough to share. I would definitely go back."},
    {"autor": "Elise M.", "estrellas": 5, "lang": "pt",
     "es": "Vinimos a cenar: no había espera, la comida llegó rápido y todos fueron muy amables.",
     "en": "We came for dinner: no waiting line, the food arrived quickly and the staff were all very kind."},
    {"autor": "Mees", "estrellas": 5, "lang": "en",
     "es": "La gente muy amable y la comida buena. Todos deberían probarlo cuando estén en El Chaltén. ¡La pasta, increíble!",
     "en": "The guys were very polite and the food was good! Everyone should try it when in El Chaltén. Pasta was amazing!!!"},
    {"autor": "Loan F.", "estrellas": 5, "lang": "fr",
     "es": "Pizzas de tamaño generoso. Servicio rápido y personal amable. Lo recomiendo.",
     "en": "Generously sized pizzas. Fast service and friendly staff. I recommend it."},
    {"autor": "M. Jacobi", "estrellas": 5, "lang": "de",
     "es": "Riquísimo. Las hamburguesas y sobre todo las papas fritas son excelentes.",
     "en": "Absolutely delicious. The burgers and especially the fries are excellent."},
    {"autor": "Hannelore D.", "estrellas": 5, "lang": "en",
     "es": "Comida rápida y honesta.",
     "en": "Fast and honest food."},
]

# Menús para agencias (propuesta de octubre 2026). Precios a confirmar por los dueños.
MENU_AGENCIAS = [
    ("Menú simple", "Simple menu", "Plato principal.", "Main course.", 24000),
    ("Menú con postre", "Menu with dessert", "Plato principal y flan casero.", "Main course and homemade flan.", 28000),
    ("Menú completo", "Full menu", "Plato principal, flan casero y bebida sin alcohol.", "Main course, homemade flan and a soft drink.", 33000),
]
PLATOS_AGENCIAS = [
    ("Guiso de lentejas patagónico", "Patagonian lentil stew"),
    ("Milanesa de carne o pollo con papas fritas o ensalada", "Beef or chicken milanesa with fries or salad"),
    ("Cheese Bacon con papas fritas", "Cheese Bacon burger with fries"),
    ("Hamburguesa con queso, lechuga y tomate, con papas fritas", "Cheeseburger with lettuce and tomato, with fries"),
    ("Corinto, vegetariana, con papas fritas", "Corinto veggie burger with fries"),
]
VIANDA = (16000,
          "Sándwich de jamón y queso (o vegetariano de queso, tomate y lechuga), una fruta, una barra de cereal y agua.",
          "Ham and cheese sandwich (or veggie: cheese, tomato and lettuce), a piece of fruit, a cereal bar and water.")
