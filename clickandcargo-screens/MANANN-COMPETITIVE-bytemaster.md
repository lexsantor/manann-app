# Manann — Inteligencia competitiva: Bytemaster (_b first)

> Teardown del competidor, basado en su web real (bytemaster.es), examinada en sesión. Empresa: Bytemaster, fundada 1994 (Xavier Camps y Salvador Monill), Mataró (TecnoCampus) + Madrid. 30+ años, pionera SaaS en España desde 1999. Acompaña a los teardowns de Visual Trans y Bitácora.

> Nota: el dominio bloquea el fetch directo de la home (protección anti-bot); el análisis combina la página de producto `_b first` y resultados de búsqueda verificados.

---

## 1. Titular

Bytemaster se parece a Visual Trans, no a Bitácora: **sí tiene IA**. Marketean un **"_b first IA" (Copilot IA)** y un **"Informe de Inteligencia Artificial"**, y su gestión de facturas usa **OCR con detección automática de campos** ("detecta automáticamente todos los campos del documento, independiente de su disposición"). Así que, igual que con Visual Trans, **no puedes decir "no tienen IA"**. PERO Bytemaster tiene un pecado único, demostrable y devastador que ni Visual Trans ni Bitácora exhiben tan claramente: **su producto es tan complejo que han tenido que construir una academia entera para enseñarlo** (`_b Learn`). Ese es tu mejor ángulo aquí.

---

## 2. El pecado estrella: necesitan una academia para su propio software

Bytemaster mantiene **`_b Learn`** (blearn.es), "la plataforma de e-learning especializada en el sector logístico", con cursos como "Empezando con _b first". Esto es la curva de aprendizaje empinada hecha producto — el mismo patrón que la WiseTech Academy de CargoWise.

**El argumento de Manann, directísimo:** *"Si necesitas un curso para usar tu ERP, el ERP ha fallado. Manann se entiende sin manual."* Es el contraste más limpio y visual que tienes contra Bytemaster: ellos venden formación porque su herramienta lo exige; tú vendes que no hace falta.

## 3. Qué hacen bien (respetar)

- **30+ años y pioneros SaaS** (modelo ASP/alquiler por usuario desde 1999). Solidez y trayectoria difíciles de discutir.
- **Cliente de referencia potente:** Transnatur (≈600 empleados, 14 delegaciones España/Portugal) hizo "renovación completa de sistemas" eligiendo _b first. Prueba social de peso.
- **Gestor de tarifas profundo** ("el más completo del mercado"): tarifas complejas por puerto/país/fecha/tipo, cálculo automático de fletes "para que ningún concepto se quede sin facturar". Es un dolor real que resuelven bien.
- **Suite completa:** Tráfico, Aduanas (conexión AEAT), Almacén/WMS, Distribución, Admin/Finanzas, BI (Power BI/Qlik), _b Tracking (portal cliente 24/7), integraciones (puertos, aeropuertos, agencias).
- **Infra seria:** ISO 27001 + ISO 22301 (continuidad de negocio), servicios cloud, ciberseguridad logística. Venden también la capa de infraestructura.
- **Engagement con IA a nivel estrategia** (informe de IA público) — no están dormidos.

## 4. Pecados de diseño explotables

1. **Necesitan `_b Learn`** (ver §2). El más fuerte.
2. **IA como "Copilot" y OCR de facturas, no como eje.** Tienen IA *añadida* (un copiloto, OCR documental), no IA *nativa* en el corazón del flujo. El momento "arrastra un BL → expediente completo" sigue sin ser su hero. Su OCR es de **facturas**, no el autorrelleno de expediente desde BL/AWB. Matiz que Manann puede explotar: "no es un copiloto bolted-on; es el flujo entero".
3. **Stack .NET + SQL Server.** Robusto pero clásico/pesado. No es el cloud-native edge moderno; "arquitectura inteligente" sobre SQL no es lo mismo que una experiencia 2026.
4. **Enfoque enterprise / sobredimensionado.** "El software ERP de los grandes operadores", referencias como Transnatur (600 empleados). Para un transitario pequeño-mediano (el segmento que Manann reivindica), es probablemente excesivo, caro y lento de implantar.
5. **Marketing WordPress denso y orientado a comunidad** (eventos, Logistic Pádel, Cafés Virtuales, _b Talks). Mucha cookie publicitaria (DoubleClick, HubSpot, GA). Vende relación y comunidad, no experiencia de producto moderna.
6. **Muro de ventas** estándar: sin precio público, acceso solo vía contacto/cliente existente.

## 5. Posicionamiento de Manann frente a Bytemaster

> Bytemaster es el veterano robusto: 30 años, Transnatur, tarifas potentes, IA añadida como copiloto. No ataques su solidez ni su trayectoria — perderías. Ataca dos cosas concretas: (1) **la complejidad** — necesitan una academia (_b Learn) para enseñar su propio software, Manann no; (2) **la IA periférica vs. nativa** — ellos tienen un copiloto y OCR de facturas pegados a un ERP clásico; Manann pone la IA en el centro del flujo, desde el documento hasta el expediente.

Frase para la sala: *"Bytemaster necesita una academia para enseñar su ERP. Esto no necesita manual: arrastras el documento y ya está. Esa es la diferencia entre IA pegada encima y IA que ES el producto."*

## 6. Qué cambia en el plan de Manann

- **El ángulo "sin curva de aprendizaje / sin manual" sube de prioridad** específicamente contra Bytemaster. Refuerza que la demo debe ser *obvia* en 30 segundos, sin explicación. La UX no es decoración; es el argumento.
- **Distinguir "IA nativa" de "IA copiloto".** Contra Visual Trans y Bytemaster (que ya tienen IA), tu mensaje no es "tengo IA", es "mi IA no es un añadido: es el flujo entero, desde el PDF hasta el expediente, sin pasos intermedios". Afínalo en el storytelling.
- **No pelear el gestor de tarifas.** Es su fortaleza histórica y no es tu batalla (tu MVP ni lo toca). No abras ese frente.

## 7. Tabla comparativa actualizada (cuatro competidores)

| | Visual Trans | Bitácora ERP | Bytemaster (_b first) | CargoWise |
|---|---|---|---|---|
| Web | Rediseño 2026 moderno | WordPress datado | WordPress denso, community | Enterprise global |
| IA marketeada | Sí (4 productos) | **No** | Sí (Copilot + OCR facturas) | Limitada |
| Tipo de IA | Productos dedicados | — | Copiloto + OCR, añadidos | — |
| Stack | (WP + cloud) | (WP) | .NET + SQL Server | Propietario |
| Curva aprendizaje | Media | Media | **Alta (necesita _b Learn)** | Muy alta (WiseTech Academy) |
| Segmento | Amplio | Aduanas/depósito | **Grandes operadores** | Enterprise global |
| Prueba social | Media-alta | Muy alta (FedEx, Inditex) | Alta (Transnatur) | Máxima |
| Tu mejor arma contra ellos | Ejecución + transparencia | IA-nativa + UX | **"Sin manual" + IA nativa vs copiloto** | UX + precio + agilidad |

## 8. Síntesis de los cuatro: cómo posicionar Manann

El patrón del sector queda claro tras ver cuatro competidores:
- **Casi todos tienen ya "IA"** (salvo Bitácora) — pero como **productos añadidos, copilotos u OCR de facturas**, no como flujo nativo. → Tu diferenciador no es "tener IA", es **"IA nativa de extremo a extremo: del documento al expediente, sin pasos"**.
- **Todos esconden el producto tras un muro de ventas** (sin precio, sin prueba). → Tu arma transversal es **demostrar en vivo, sin comercial**.
- **Varios delatan complejidad** (academias, módulos, formación). → Tu arma es **lo obvio sin manual**.
- **Todos compiten en confianza/trayectoria** (décadas, clientes enormes). → No lo pelees; posiciona Manann como **"hacia dónde va el sector", demostración de potencial**, no reemplazo.

## 9. Límites de esta inteligencia

- **Alta confianza** en lo observable (módulos, _b Learn, OCR de facturas, Copilot IA anunciado, stack .NET/SQL, clientes, ISO).
- **Confianza media** en el estado real in-app y en cuánto entrega su "_b first IA": está tras muro de ventas; no se ha visto funcionando. Su Copilot podría ser potente o incipiente.
- **No verificado en profundidad:** el alcance real de su OCR (¿solo facturas, o también BL/AWB?). Su web dice facturas; conviene confirmarlo si el contraste se vuelve central.
- Home no accesible por fetch (anti-bot); análisis vía página de producto + búsqueda. Datos a fecha de sesión (jun 2026); assets web 2018-2024.
