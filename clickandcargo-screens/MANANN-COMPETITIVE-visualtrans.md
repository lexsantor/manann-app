# Manann — Inteligencia competitiva: Visual Trans

> Teardown del competidor de referencia, basado en su web real (visualtrans.com), examinada en sesión. Assets del sitio fechados feb-may 2026: **es un rediseño reciente, no un sitio legacy.** Este documento corrige supuestos del informe inicial y reencuadra el posicionamiento de Manann. Acompaña a `MANANN-SESSION-SUMMARY.md`.

---

## 1. Titular incómodo

Visual Trans **no es el dinosaurio que asumimos**. En 2026 tiene: web de marketing moderna, una suite de IA con cuatro productos nombrados, certificación ISO 27001, fondos EU Next Generation, y un mensaje anti-data-entry **casi idéntico al de Manann**. Dos de los diferenciadores que dábamos por sentados quedan tocados. Esto no hunde el proyecto — lo obliga a competir donde de verdad se gana: en la **ejecución demostrable**, no en el discurso.

---

## 2. Qué hacen bien (respetar, no ridiculizar)

- **Marketing moderno y segmentado.** Tagline con gancho ("Software que abre fronteras"), prueba social arriba (clientes: Bernardino Abad, Kaleido, Lantia, Altius, Ibercondor), testimonio nominal, 5 audiencias claras (transitarios, aduanas, operadores, consignatarios, cargadores).
- **Señales de confianza de peso B2B:** ISO 27001, EU Next Generation, política de seguridad, canal ético, +5.000 usuarios en +25 países (claim propio).
- **Consentimiento RGPD completo** (Funcional/Preferencias/Estadísticas/Marketing, Aceptar/Denegar/Ver preferencias).
- **API nativa** como mensaje de conectividad ("El futuro es un negocio conectado").

## 3. La suite de IA que YA tienen (el golpe real)

Cuatro productos de IA nombrados, lanzados aparentemente en 2025 (Suite 25.07, "Hola Aduania"):

| Producto | Qué hace | Choca con Manann |
|---|---|---|
| **Digitalización inteligente de documentos** (vForwarding) | Clasifica y extrae datos de docs no estructurados (DUAs, facturas) y los lleva a la operativa | **DIRECTAMENTE** — es tu momento wow |
| **Tariff Code** | Clasificación arancelaria TARIC a 10 dígitos con respaldo documental | Tangencial (aduanas) |
| **Aduania** | Asistente virtual aduanero (resuelve dudas) | Tangencial |
| **Victoria** | Agente de voz para comunicación logística | No |

**Su descripción del flujo documental** (parafraseada): el sistema recibe los documentos → la IA identifica y clasifica cada tipo → extrae la información → se integra en los procesos → *el equipo no pica datos, valida y decide*.

Esto es, conceptualmente, **idéntico** al human-in-the-loop de Manann. Incluso comparten el encuadre anti-data-entry ("la documentación sigue siendo uno de los mayores frenos a la eficiencia").

**Implicación dura:** NO se puede afirmar "ellos no tienen IA documental". Es falso y un stakeholder informado lo rebate. El diferenciador ya no es *tener* la capacidad — es *cómo se entrega y se prueba*.

## 4. Pecados de diseño aún explotables

1. **Cero transparencia de precio, cero self-serve.** Todo pasa por "SOLICITA TU PRECIO" / "Solicita una demo" / formulario / equipo comercial. No puedes ver ni probar el producto sin hablar con ventas. → Manann: entras y lo usas en 30 segundos.
2. **La IA está tras un muro de ventas.** Su digitalización documental solo se ve "en una demo personalizada". El vídeo demostrativo de la página apunta a un embed roto/placeholder (`about:blank`). No hay prueba pública del producto funcionando. → Manann: lo demuestras en vivo, sin intermediarios.
3. **Bug de pulido real y demostrable:** el banner de cookies está **a medio traducir** — mezcla español e inglés ("Preferences Preferences", "Statistics Statistics", "The technical storage or access..."). Delata plantilla genérica + descuido. En comparación lado a lado, se nota.
4. **WordPress + Squarespace CDN.** El sitio es WordPress (Jetpack/wp.com) con imágenes servidas desde un CDN de Squarespace. Marketing montado sobre CMS, no producto. La inversión visible está en la web comercial.
5. **Amplitud como debilidad:** 5 segmentos = un producto que intenta ser todo para todos. Manann es estrecho y profundo en una cosa que deslumbra.

## 5. Reencuadre del enemigo (cambio de estrategia)

**Antes (supuesto del informe):** "los ERPs del sector no tienen IA nativa; Manann llega con la novedad."

**Ahora (verificado):** el líder del sector YA anuncia IA documental con el mismo discurso que Manann. Por tanto, el enemigo se redefine:

> El enemigo no es la ausencia de IA. Es la **IA que se promete pero se entierra**: tras un muro de "solicita precio", sin precio público, sin self-serve, sin poder probarla, con un vídeo demostrativo roto. Manann gana **enseñándola funcionando, ahora, sin pedir permiso a un comercial.**

Frase para la sala: *"Ellos lo anuncian en una landing. Aquí lo haces tú: arrastra este BL y míralo."*

## 6. Qué cambia en el plan de Manann

- **El PR-7 (flujo wow) sube de crítico a existencial.** Era la mejor carta; ahora es la *única* ventaja diferencial real frente a un competidor que ya marca la casilla "IA documental". Tiene que funcionar en vivo, impecable.
- **No competir en la landing.** La suya tiene años de SEO, prueba social y compliance. La tuya es escaparate de 30s que da paso al producto. Gánales en el clic siguiente, no en la home.
- **Transparencia como arma.** Su talón de Aquiles es el muro de ventas. Si la demo de Manann es *probable sin fricción* (entra y úsalo), eso es un contraste que ellos estructuralmente no ofrecen.
- **Honestidad ante el stakeholder:** reconocer que Visual Trans tiene IA. Restarle credibilidad por negarlo sería un error. El argumento es ejecución + transparencia + UX, no "somos los únicos".

## 7. Acciones concretas

1. Actualizar `MANANN-storytelling.md` y `MANANN-SESSION-SUMMARY.md`: redefinir el enemigo de "ERPs sin IA" a "IA prometida pero enterrada tras un muro de ventas".
2. En la demo, incluir un **contraste explícito**: captura de su flujo ("solicita una demo para verlo") vs. tu flujo en vivo.
3. Reservar 1 línea del pitch a la transparencia: Manann se prueba sin comercial de por medio.
4. Vigilar su evolución: la suite IA es de 2025; pueden mejorarla. La ventaja de ejecución hay que mantenerla, no asumirla.

---

## 8. Límites de esta inteligencia

- **Alta confianza** en todo lo observable en su web pública (mensajes, productos anunciados, pecados de UX del sitio, stack).
- **Confianza media-baja** en el estado REAL de su producto in-app: su digitalización documental está tras el muro de demo; no se ha podido ver funcionando. No sabemos su precisión de extracción, su latencia, ni su UX real. Podría ser excelente o ser marketing por delante del producto. Solo se sabría solicitando su demo (recomendable hacerlo, como reconocimiento competitivo).
- Datos de la web a fecha de la sesión (jun 2026); su sitio se actualiza con frecuencia (assets feb-may 2026).
