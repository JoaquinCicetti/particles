# Textos de la landing — versión corta del manual

Fuente única: [`manual-growcast.md`](./manual-growcast.md). Cada texto de la landing es un
recorte o una frase del manual, con la sección de donde sale. **Si una frase no se puede
señalar en el manual, no va en la landing.** El español vive en `src/i18n/messages.ts`;
`en.json` / `pt.json` son traducciones literales de ese español, sin agregar nada.

Registro: **usted** ("su teléfono", "su mano"), como el manual.

## Lo que NO decimos (textos inventados que se quitaron)

| Inventado | Por qué no |
|---|---|
| Alertas / avisos **por WhatsApp** | Growcast no envía WhatsApp. WhatsApp es solo el canal de contacto comercial. |
| "Cargamos la **curva** de cada producto; la cámara la **sigue sola**" / curvas de maduración configurables | No existe. El manual solo dice "comparar ciclos" y "cuando la instalación lo permite". |
| Riego/clima que "**se ajustan solos** según umbrales que definimos juntos" | No es lo que dice el manual. Siempre con "cuando la instalación lo permite". |
| "**Sin conocimientos técnicos**" | No está en el manual. |
| Sondas **multipunto** en la masa de grano, **humedad de grano**, **silobolsas** | El manual dice temperatura / humedad relativa **interior**. No menciona silobolsas. |
| **Merma de peso**, balanza, **días de cura**, **apertura de puertas** | No están en el manual. |
| Chips **Luz**, **Flujo de aire**, **Nivel**, **Energía** | No están en "Qué mide". |
| "Registros para **auditorías**", "menos mermas por hongos e insectos", "focos detectados antes de que se propaguen" | Promesas de resultado que el manual no hace. |
| "Inteligencia agrícola", "tu campo" | El manual habla de operaciones agroindustriales, no de campo. |

## Rubros en la landing

Solo tres (ver memoria del proyecto): §5.2 → `cultivo`, §5.1 → `silos`, §5.5 → `maduracion`.
§5.3 riego, §5.4 láctea y §5.6 laboratorios **no** van.

---

## Historia 3D (scroll)

| Clave | Texto | Fuente |
|---|---|---|
| hero.kicker | MONITOREO, CONTROL Y AUTOMATIZACIÓN | §2 |
| hero.title | Su operación, en su mano. | §7 "disponible en su mano" |
| hero.body | Growcast conecta una operación física con su teléfono, tablet o PC. Mide, registra, analiza, alerta y puede actuar sobre la operación. | §2 (dos frases en negrita) |
| phase.1–6 | 01 / LA OPERACIÓN · 02 / MEDIMOS · 03 / CONECTAMOS · 04 / ANALIZAMOS · 05 / CONTROLAMOS Y REGISTRAMOS · 06 / GROWCAST | §3 (cinco etapas) |
| sensors.kicker | MEDIMOS | §3.1 |
| sensors.title | Sensores en los puntos críticos. | §2 "Instalamos sensores en puntos críticos" |
| sensors.body | Temperatura, humedad, CO₂, conductividad eléctrica, pH, presión, estado de equipos: cada rubro requiere medir variables distintas. | §3.1 |
| data.kicker | ANALIZAMOS | §3.3 |
| data.title | El dato se convierte en herramienta. | §3.3 última frase |
| data.body | Condiciones actuales, gráficos históricos, tendencias, indicadores y alertas, desde un mismo lugar. | §3.3 lista, §3.2 |
| converge.kicker | CONTROLAMOS Y REGISTRAMOS | §3.4, §3.5 |
| converge.title | Todo converge en Growcast. | §3.2 "centralizar datos" — elegido por Joaquín, acompaña el morph del logo |
| converge.body | Cuando la instalación lo permite, Growcast acciona equipos de forma automática o remota. Todo queda registrado: mediciones, alertas, estados de equipos y eventos. | §3.4, §3.5 |
| finale.fine | GROWCAST © 2026 — MONITOREO, CONTROL Y TRAZABILIDAD | §2, §4.6 — elegido por Joaquín |

Chips flotantes: TEMPERATURA · HUMEDAD · CO₂ · CONDUCTIVIDAD · pH (§3.1). Valores ilustrativos.

## Soluciones — intro

| Clave | Texto | Fuente |
|---|---|---|
| solutions.title | Una misma base tecnológica, distintas operaciones. | §6 "adaptar una misma base tecnológica" |
| solutions.body | Las soluciones cambian según el rubro, pero la lógica es siempre la misma: medir una variable importante, registrar lo que ocurre, interpretar la información y, cuando es posible, controlar los equipos. | §4, §6 |
| Títulos de bloque | APLICACIONES · QUÉ MIDE · QUÉ CONTROLA · QUÉ PODEMOS RESOLVER · CÓMO ACTÚA GROWCAST | encabezados de §5 |
| Pasos | Medimos · Analizamos y alertamos · Controlamos y registramos | §3 |

## 01 — Producción bajo cubierta o salas (§5.2)

- **Kicker:** 01 / BAJO CUBIERTA Y SALAS
- **Título:** Cada sala, en una misma plataforma. — "desde una misma plataforma"
- **Lede:** Temperatura, humedad, CO₂, ventilación, riego, sustrato, agua y nutrición cambian permanentemente. Pequeños desvíos sostenidos en el tiempo pueden impactar en calidad, productividad, sanidad o eficiencia. — Contexto
- **Aplicaciones:** Frutas y verduras, hongos, hidroponía, flores ornamentales, viveros, fitomejoramiento, procesos biotecnológicos y salas con ambiente controlado.
- **Qué mide:** Temperatura · Humedad · CO₂ · VPD · Humedad de sustrato · Conductividad eléctrica · pH · Estado de equipos
- **Qué controla:** Ventilación y extracción · Calefacción y refrigeración · Riego, nutrición y nebulización · Inyección de CO₂ y otros periféricos eléctricos, según instalación
- **Qué podemos resolver:** Medición manual de condiciones ambientales · Falta de alertas cuando una variable sale de rango · Falta de registros históricos por ciclo, sala o lote · Dificultad para sostener criterios de manejo cuando cambia el equipo de trabajo
- **Cómo actúa:**
  1. Instalamos sensores en cada sala, invernadero o sector, en los puntos relevantes de su proceso. (§3.1)
  2. Visualice cada espacio desde una misma plataforma: detecte desvíos en tiempo real, reciba alertas y compare ambientes.
  3. Growcast confecciona registros históricos por ciclo, sala o lote y, cuando la instalación lo permite, automatiza tareas repetitivas.
- **Esquema:** Sensores por sala → tablero Growcast → riego y ventilación

## 02 — Acopios de granos y plantas (§5.1)

- **Kicker:** 02 / ACOPIOS DE GRANOS
- **Título:** Cada silo, desde su propia mano. — Contexto
- **Lede:** La temperatura, la humedad, el CO₂, las condiciones exteriores y el uso de la aireación influyen directamente en la calidad del producto almacenado y en el consumo energético. — Contexto
- **Aplicaciones:** Acopios de granos, fábricas de alimentos balanceados, semilleros, molinos harineros, acondicionadoras y malterías. — título §5.1
- **Qué mide:** Temperatura interior · Humedad relativa interior · CO₂ · Temperatura exterior · Humedad relativa exterior · Estado de aireadores · Horas de funcionamiento
- **Qué controla:** Aireadores · Extractores · Accionamiento remoto o automático, según la estrategia operativa definida · Registro de cuándo, cuánto y bajo qué condiciones se usó la aireación
- **Qué podemos resolver:** Falta de monitoreo continuo dentro de los silos · Aireación operada manualmente o sin registros · Consumo energético innecesario por falta de información · Detección tardía de condiciones críticas o extremas
- **Cómo actúa:**
  1. Instalamos sensores en cada silo: temperatura, humedad relativa y CO₂ interiores, junto con las condiciones exteriores.
  2. Growcast centraliza la información de cada silo: condiciones actuales, históricos, alertas y comparación entre silos.
  3. Cuando el sistema se integra a la aireación, los aireadores pueden accionarse de forma remota o automática según la estrategia operativa definida, y queda registrado cuándo, cuánto y bajo qué condiciones se usaron.
- **Esquema:** Sensores en el silo → tablero Growcast → aireadores

## 03 — Quesos y chacinados (§5.5)

- **Kicker:** 03 / QUESOS Y CHACINADOS
- **Título:** Cada ciclo, registrado. — "registrar la evolución de las condiciones durante cada ciclo"
- **Lede:** En quesos, chacinados y otros alimentos madurados, las condiciones acumuladas durante el proceso pueden ser tan importantes como la receta o la materia prima. — Contexto
- **Aplicaciones:** Salas de maduración de quesos, secaderos de chacinados, cámaras de maduración y de conservación, y depósitos con condiciones ambientales críticas.
- **Qué mide:** Temperatura · Humedad · CO₂ (si aplica) · Estado de equipos · Horas de funcionamiento
- **Qué controla:** Ventilación y extracción · Calefacción y refrigeración · Humidificación y deshumidificación · Otros equipos de manejo ambiental, según instalación
- **Qué podemos resolver:** Control manual de salas · Falta de alertas ante desvíos · Variabilidad entre lotes · Falta de evidencia para analizar qué ocurrió durante un proceso
- **Cómo actúa:**
  1. Instalamos sensores en cada sala, cámara o secadero.
  2. Visualice las condiciones en tiempo real, reciba alertas ante desvíos y compare ciclos de maduración o secado.
  3. Registramos la evolución de las condiciones de cada lote y, cuando la instalación lo permite, nos integramos con los equipos de control ambiental.
- **Esquema:** Sensores por cámara → tablero Growcast → refrigeración y humidificación

## Contacto

| Clave | Texto | Fuente |
|---|---|---|
| contact.title | Hablemos de su operación. | — |
| contact.body | ¿Existe algún proceso importante que hoy se resuelve "a ojo", sin datos? Cada implementación comienza entendiendo la operación. | §6 |
| dialog.sub | Le respondemos por WhatsApp. Déjenos su nombre y un mensaje y abrimos la conversación. | canal de contacto real (wa.me) |
