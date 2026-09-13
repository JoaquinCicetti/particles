import { defineMessages } from 'react-intl'

/**
 * Single source of truth for every UI string. `defaultMessage` is the Spanish
 * (source) copy — the `es` catalog is derived from it at runtime — while the
 * `en` / `pt` catalogs live in ./locales/*.json keyed by these same ids.
 */
export const M = defineMessages({
  // one label for every contact CTA — header, finale, contact section and the
  // dialog's own aria-label; the header form is uppercased in CSS
  ctaContact: { id: 'cta.contact', defaultMessage: 'Coordinar una reunión' },
  brandAria: { id: 'nav.brandAria', defaultMessage: 'Growcast — inicio' },
  navBrand: { id: 'nav.brand', defaultMessage: 'GROWCAST' },

  heroKicker: { id: 'hero.kicker', defaultMessage: 'PLATAFORMA DE MONITOREO AGRÍCOLA' },
  heroTitle: { id: 'hero.title', defaultMessage: 'Tu campo,<br></br>en tiempo real<accent>.</accent>' },
  heroBody: {
    id: 'hero.body',
    defaultMessage:
      'Growcast integra silos, depósitos y cultivos en una sola plataforma de monitoreo. Datos en tiempo real, del campo a la decisión.',
  },

  sensorsKicker: { id: 'sensors.kicker', defaultMessage: 'RED DE SENSORES' },
  sensorsTitle: { id: 'sensors.title', defaultMessage: 'Todo el establecimiento, una sola red.' },
  sensorsBody: {
    id: 'sensors.body',
    defaultMessage:
      'Temperatura, humedad, CO₂, conductividad y pH: cada variable, en cada punto, transmitiendo a un núcleo central.',
  },

  dataKicker: { id: 'data.kicker', defaultMessage: 'DATOS ESTRUCTURADOS' },
  dataTitle: { id: 'data.title', defaultMessage: 'El dato crudo se vuelve estructura.' },
  dataBody: {
    id: 'data.body',
    defaultMessage:
      'Series temporales, umbrales y alertas tempranas: cada variable, ordenada y lista para decidir.',
  },

  tagline: { id: 'common.tagline', defaultMessage: 'Monitoreo, control y trazabilidad' },
  convergeTitle: { id: 'converge.title', defaultMessage: 'Todo converge en Growcast.' },
  convergeBody: {
    id: 'converge.body',
    defaultMessage:
      'Medimos cada variable, controlamos riego y clima, y trazamos cada lote —del sensor a la decisión, en una sola fuente de verdad.',
  },

  finaleFine: { id: 'finale.fine', defaultMessage: 'GROWCAST © 2026 — INTELIGENCIA AGRÍCOLA' },
  hint: { id: 'hint', defaultMessage: 'DESPLAZÁ PARA EXPLORAR' },

  // sensor metric cards
  mTempLabel: { id: 'metric.temp.label', defaultMessage: 'TEMPERATURA' },
  mHumLabel: { id: 'metric.hum.label', defaultMessage: 'HUMEDAD' },
  mCo2Label: { id: 'metric.co2.label', defaultMessage: 'CO₂' },
  mEcLabel: { id: 'metric.ec.label', defaultMessage: 'CONDUCTIVIDAD' },
  mPhLabel: { id: 'metric.ph.label', defaultMessage: 'pH' },

  // scroll phase ticker
  phase1: { id: 'phase.1', defaultMessage: '01 / EL ESTABLECIMIENTO' },
  phase2: { id: 'phase.2', defaultMessage: '02 / RED DE SENSORES' },
  phase3: { id: 'phase.3', defaultMessage: '03 / FLUJO DE DATOS' },
  phase4: { id: 'phase.4', defaultMessage: '04 / DATOS ESTRUCTURADOS' },
  phase5: { id: 'phase.5', defaultMessage: '05 / CONVERGENCIA' },
  phase6: { id: 'phase.6', defaultMessage: '06 / GROWCAST' },

  // contact dialog
  dialogKicker: { id: 'dialog.kicker', defaultMessage: 'COORDINEMOS' },
  dialogTitle: { id: 'dialog.title', defaultMessage: 'Hablemos de tu campo' },
  dialogSub: {
    id: 'dialog.sub',
    defaultMessage:
      'Te respondemos por WhatsApp. Dejanos tu nombre y un mensaje y abrimos la conversación.',
  },
  dialogNameLabel: { id: 'dialog.nameLabel', defaultMessage: 'Nombre' },
  dialogNamePlaceholder: { id: 'dialog.namePlaceholder', defaultMessage: 'Tu nombre o establecimiento' },
  dialogMsgLabel: { id: 'dialog.msgLabel', defaultMessage: 'Mensaje' },
  dialogSend: { id: 'dialog.send', defaultMessage: 'Enviar por WhatsApp' },
  dialogClose: { id: 'dialog.close', defaultMessage: 'Cerrar' },
  dialogDefaultMsg: {
    id: 'dialog.defaultMsg',
    defaultMessage: 'Hola Growcast, me gustaría coordinar una reunión para conocer la plataforma.',
  },
  dialogNamePrefix: { id: 'dialog.namePrefix', defaultMessage: 'Soy {name}. ' },
  // ── solutions (in-flow sections after the finale) ─────────────
  // DRAFT copy — to be replaced with the client's material
  navMenu: { id: 'nav.menu', defaultMessage: 'Menú' },
  navSteps: { id: 'nav.steps', defaultMessage: 'Navegar por secciones' },
  navPrev: { id: 'nav.prev', defaultMessage: 'Sección anterior' },
  navNext: { id: 'nav.next', defaultMessage: 'Sección siguiente' },
  navInicio: { id: 'nav.inicio', defaultMessage: 'INICIO' },
  navCultivo: { id: 'nav.cultivo', defaultMessage: 'CULTIVO' },
  navSilos: { id: 'nav.silos', defaultMessage: 'SILOS' },
  navMaduracion: { id: 'nav.maduracion', defaultMessage: 'MADURACIÓN' },
  navContacto: { id: 'nav.contacto', defaultMessage: 'CONTACTO' },
  finaleMore: { id: 'finale.more', defaultMessage: 'VER SOLUCIONES' },


  solImplTitle: { id: 'sol.implTitle', defaultMessage: 'CÓMO LO IMPLEMENTAMOS' },
  solSolveTitle: { id: 'sol.solveTitle', defaultMessage: 'QUÉ RESOLVEMOS' },
  solFigureTag: { id: 'sol.figureTag', defaultMessage: 'ESQUEMA DE CONEXIÓN' },

  // 01 — salas de cultivo
  cultivoKicker: { id: 'sol.cultivo.kicker', defaultMessage: '01 / SALAS DE CULTIVO' },
  cultivoTitle: { id: 'sol.cultivo.title', defaultMessage: 'Cada sala, bajo control.' },
  cultivoLede: {
    id: 'sol.cultivo.lede',
    defaultMessage:
      'Monitoreo y control de clima, riego y nutrición en salas de cultivo indoor e invernaderos. Cada sala con su propio nodo, todas en una misma plataforma.',
  },
  cultivoDesignCta: { id: 'sol.cultivo.designCta', defaultMessage: 'Diseñá tu sala' },
  cultivoDesignNote: {
    id: 'sol.cultivo.designNote',
    defaultMessage: 'ARMALA EN 3D Y PEDÍ TU COTIZACIÓN · GRATIS, SIN REGISTRO',
  },
  cultivoImpl1: { id: 'sol.cultivo.impl.1', defaultMessage: 'Nodo por sala: temperatura, humedad, CO₂ y flujo de aire.' },
  cultivoImpl2: { id: 'sol.cultivo.impl.2', defaultMessage: 'Sondas de EC y pH en la solución de riego.' },
  cultivoImpl3: { id: 'sol.cultivo.impl.3', defaultMessage: 'Control de riego, ventilación y clima por umbrales y horarios.' },
  cultivoImpl4: { id: 'sol.cultivo.impl.4', defaultMessage: 'Tablero en tiempo real y alertas por WhatsApp.' },
  cultivoSolve1: { id: 'sol.cultivo.solve.1', defaultMessage: 'Uniformidad entre salas y ciclos.' },
  cultivoSolve2: { id: 'sol.cultivo.solve.2', defaultMessage: 'Dosificación precisa de agua y nutrientes.' },
  cultivoSolve3: { id: 'sol.cultivo.solve.3', defaultMessage: 'Detección temprana de desvíos antes de que afecten al cultivo.' },
  cultivoSolve4: { id: 'sol.cultivo.solve.4', defaultMessage: 'Trazabilidad por lote, del trasplante a la cosecha.' },
  cultivoStat1: { id: 'sol.cultivo.stat.1', defaultMessage: 'TEMPERATURA' },
  cultivoStat2: { id: 'sol.cultivo.stat.2', defaultMessage: 'HUMEDAD' },
  cultivoStat3: { id: 'sol.cultivo.stat.3', defaultMessage: 'EC' },
  cultivoFigure: { id: 'sol.cultivo.figure', defaultMessage: 'Sensores por sala → tablero Growcast → riego, luces y ventilación' },

  // 02 — silos y depósitos
  silosKicker: { id: 'sol.silos.kicker', defaultMessage: '02 / SILOS Y DEPÓSITOS' },
  silosTitle: { id: 'sol.silos.title', defaultMessage: 'El grano, vigilado las 24 horas.' },
  silosLede: {
    id: 'sol.silos.lede',
    defaultMessage:
      'Monitoreo de temperatura y humedad del grano en silos, celdas y silobolsas, con aireación automática y alertas tempranas de deterioro.',
  },
  silosImpl1: { id: 'sol.silos.impl.1', defaultMessage: 'Sondas multipunto de temperatura y humedad dentro de la masa de grano.' },
  silosImpl2: { id: 'sol.silos.impl.2', defaultMessage: 'CO₂ en el espacio de cabeza como indicador temprano de deterioro.' },
  silosImpl3: { id: 'sol.silos.impl.3', defaultMessage: 'Control automático de aireadores según condiciones ambiente.' },
  silosImpl4: { id: 'sol.silos.impl.4', defaultMessage: 'Historial por silo y por lote, accesible desde el celular.' },
  silosSolve1: { id: 'sol.silos.solve.1', defaultMessage: 'Focos de calentamiento detectados antes de que se propaguen.' },
  silosSolve2: { id: 'sol.silos.solve.2', defaultMessage: 'Menos mermas por hongos e insectos.' },
  silosSolve3: { id: 'sol.silos.solve.3', defaultMessage: 'Aireación solo cuando conviene: menos energía, mejor grano.' },
  silosSolve4: { id: 'sol.silos.solve.4', defaultMessage: 'Stock y calidad trazables por lote.' },
  silosStat1: { id: 'sol.silos.stat.1', defaultMessage: 'TEMP. GRANO' },
  silosStat2: { id: 'sol.silos.stat.2', defaultMessage: 'CO₂' },
  silosStat3: { id: 'sol.silos.stat.3', defaultMessage: 'HUMEDAD' },
  silosFigure: { id: 'sol.silos.figure', defaultMessage: 'Sondas en silo → tablero Growcast → aireadores' },

  // 03 — cámaras de maduración
  maduracionKicker: { id: 'sol.maduracion.kicker', defaultMessage: '03 / CÁMARAS DE MADURACIÓN' },
  maduracionTitle: { id: 'sol.maduracion.title', defaultMessage: 'La misma curva, en cada lote.' },
  maduracionLede: {
    id: 'sol.maduracion.lede',
    defaultMessage:
      'Control de temperatura, humedad y renovación de aire en cámaras de maduración de quesos y embutidos. Curvas por producto, registros por lote.',
  },
  maduracionImpl1: { id: 'sol.maduracion.impl.1', defaultMessage: 'Sensores de temperatura y humedad relativa en cada cámara.' },
  maduracionImpl2: { id: 'sol.maduracion.impl.2', defaultMessage: 'Control de frío, humidificación y renovación de aire.' },
  maduracionImpl3: { id: 'sol.maduracion.impl.3', defaultMessage: 'Curvas de maduración configurables por producto.' },
  maduracionImpl4: { id: 'sol.maduracion.impl.4', defaultMessage: 'Registro automático por lote para auditorías.' },
  maduracionSolve1: { id: 'sol.maduracion.solve.1', defaultMessage: 'Curvas repetibles: el mismo producto, lote tras lote.' },
  maduracionSolve2: { id: 'sol.maduracion.solve.2', defaultMessage: 'Menos defectos por mohos y desvíos de humedad.' },
  maduracionSolve3: { id: 'sol.maduracion.solve.3', defaultMessage: 'Merma de peso bajo control.' },
  maduracionSolve4: { id: 'sol.maduracion.solve.4', defaultMessage: 'Registros listos para presentar.' },
  maduracionStat1: { id: 'sol.maduracion.stat.1', defaultMessage: 'TEMPERATURA' },
  maduracionStat2: { id: 'sol.maduracion.stat.2', defaultMessage: 'HUMEDAD' },
  maduracionStat3: { id: 'sol.maduracion.stat.3', defaultMessage: 'DÍAS DE CURA' },
  maduracionFigure: { id: 'sol.maduracion.figure', defaultMessage: 'Sensores por cámara → tablero Growcast → frío y humidificación' },

  // contact section
  contactKicker: { id: 'contact.kicker', defaultMessage: 'CONTACTO' },
  contactTitle: { id: 'contact.title', defaultMessage: 'Hablemos de tu establecimiento.' },
  contactBody: {
    id: 'contact.body',
    defaultMessage:
      'Contanos qué querés monitorear y armamos una propuesta a medida: sensores, control y trazabilidad, en una sola plataforma.',
  },
  contactLine: { id: 'contact.line', defaultMessage: 'ROSARIO, SANTA FE · WHATSAPP {phone}' },
  // solutions — intro, audience, measured variables, process
  solutionsKicker: { id: 'solutions.kicker', defaultMessage: 'SOLUCIONES' },
  solutionsTitle: { id: 'solutions.title', defaultMessage: 'Tres ambientes, una sola plataforma.' },
  solutionsBody: {
    id: 'solutions.body',
    defaultMessage:
      'Salas de cultivo, silos y cámaras de maduración: en cada caso instalamos los sensores, conectamos el control y dejamos todo visible desde el celular o la computadora. Sin conocimientos técnicos.',
  },
  solWhoTitle: { id: 'sol.whoTitle', defaultMessage: 'PARA QUIÉN' },
  solMeasureTitle: { id: 'sol.measureTitle', defaultMessage: 'QUÉ MEDIMOS' },
  solStepsTitle: { id: 'sol.stepsTitle', defaultMessage: 'CÓMO TRABAJAMOS' },
  step1Title: { id: 'sol.step.1.title', defaultMessage: 'Relevamos e instalamos' },
  step2Title: { id: 'sol.step.2.title', defaultMessage: 'Medimos y controlamos' },
  step3Title: { id: 'sol.step.3.title', defaultMessage: 'Alertamos y registramos' },

  varTemp: { id: 'var.temp', defaultMessage: 'Temperatura' },
  varHum: { id: 'var.hum', defaultMessage: 'Humedad' },
  varCo2: { id: 'var.co2', defaultMessage: 'CO₂' },
  varEc: { id: 'var.ec', defaultMessage: 'EC' },
  varPh: { id: 'var.ph', defaultMessage: 'pH' },
  varAir: { id: 'var.air', defaultMessage: 'Flujo de aire' },
  varLight: { id: 'var.light', defaultMessage: 'Luz' },
  varGrain: { id: 'var.grain', defaultMessage: 'Humedad de grano' },
  varLevel: { id: 'var.level', defaultMessage: 'Nivel' },
  varWeight: { id: 'var.weight', defaultMessage: 'Merma de peso' },
  varDoor: { id: 'var.door', defaultMessage: 'Apertura de puertas' },
  varPower: { id: 'var.power', defaultMessage: 'Energía' },

  cultivoWho: { id: 'sol.cultivo.who', defaultMessage: 'Productores indoor, viveros, invernaderos y salas de propagación.' },
  cultivoStep1: { id: 'sol.cultivo.step.1', defaultMessage: 'Visitamos el establecimiento, definimos los puntos de medición por sala y dejamos los nodos instalados y conectados.' },
  cultivoStep2: { id: 'sol.cultivo.step.2', defaultMessage: 'Cada sala se ve en tiempo real. El riego, la ventilación y el clima se ajustan solos según los umbrales que definimos juntos.' },
  cultivoStep3: { id: 'sol.cultivo.step.3', defaultMessage: 'Si algo se sale de rango, avisamos por WhatsApp. Todo queda registrado por lote, desde el trasplante a la cosecha.' },

  silosWho: { id: 'sol.silos.who', defaultMessage: 'Acopiadores, cooperativas y productores con silos, celdas o silobolsas.' },
  silosStep1: { id: 'sol.silos.step.1', defaultMessage: 'Relevamos los silos y colocamos las sondas dentro del grano y los sensores en el espacio de cabeza.' },
  silosStep2: { id: 'sol.silos.step.2', defaultMessage: 'Temperatura y humedad del grano se ven silo por silo. Los aireadores arrancan y paran solos cuando el ambiente conviene.' },
  silosStep3: { id: 'sol.silos.step.3', defaultMessage: 'Ante un foco de calentamiento avisamos al instante. El historial de cada silo y cada lote queda guardado.' },

  maduracionWho: { id: 'sol.maduracion.who', defaultMessage: 'Queserías, fábricas de embutidos y plantas con cámaras de maduración o secado.' },
  maduracionStep1: { id: 'sol.maduracion.step.1', defaultMessage: 'Instalamos sensores en cada cámara y conectamos el frío, la humidificación y la renovación de aire.' },
  maduracionStep2: { id: 'sol.maduracion.step.2', defaultMessage: 'Cargamos la curva de cada producto. La cámara sigue la curva sola, día a día, sin intervención.' },
  maduracionStep3: { id: 'sol.maduracion.step.3', defaultMessage: 'Cualquier desvío se avisa por WhatsApp. Cada lote queda con su registro completo, listo para auditorías.' },
  // shared hardware labels for the three schematics (short — rendered inside the SVG)
  figPhone: { id: 'sol.fig.phone', defaultMessage: 'TU TELÉFONO' },
  figApp: { id: 'sol.fig.app', defaultMessage: 'APP GROWCAST' },
  figLive: { id: 'sol.fig.live', defaultMessage: 'EN VIVO' },

  // silo illustration labels (short — rendered inside the SVG)
  siloLblProbes: { id: 'silo.lbl.probes', defaultMessage: 'SONDAS T° · HUMEDAD' },
  siloLblNode: { id: 'silo.lbl.node', defaultMessage: 'NODO' },
  siloLblFan: { id: 'silo.lbl.fan', defaultMessage: 'AIREADOR' },
  siloLblHot: { id: 'silo.lbl.hot', defaultMessage: 'FOCO' },
  siloAria: { id: 'silo.aria', defaultMessage: 'Esquema: sondas dentro del silo y un sensor de CO₂ en el techo envían sus lecturas al tablero Growcast; su módulo comanda el aireador, y todo llega en vivo a tu teléfono.' },
  // grow-room illustration labels
  grLblLights: { id: 'grow.lbl.lights', defaultMessage: 'LUCES · 18/6' },
  grLblFan: { id: 'grow.lbl.fan', defaultMessage: 'VENTILADOR' },
  grLblSensor: { id: 'grow.lbl.sensor', defaultMessage: 'T° · HR · CO₂' },
  grLblIrrig: { id: 'grow.lbl.irrig', defaultMessage: 'RIEGO' },
  grLblEcph: { id: 'grow.lbl.ecph', defaultMessage: 'EC · pH' },
  grLblControl: { id: 'grow.lbl.control', defaultMessage: 'CONTROL' },
  grLblRoom: { id: 'grow.lbl.room', defaultMessage: 'SALA DE CULTIVO' },
  grAria: { id: 'grow.aria', defaultMessage: 'Esquema: los sensores de la sala envían clima y EC/pH al tablero Growcast; sus tres módulos comandan luces, ventilador y riego, y todo llega en vivo a tu teléfono.' },

  // curing-room illustration labels
  crLblSensor: { id: 'cure.lbl.sensor', defaultMessage: 'T° · HR' },
  crLblCo2: { id: 'cure.lbl.co2', defaultMessage: 'CO₂' },
  crLblCold: { id: 'cure.lbl.cold', defaultMessage: 'FRÍO' },
  crLblHum: { id: 'cure.lbl.hum', defaultMessage: 'HUMIDIFICADOR' },
  crLblScale: { id: 'cure.lbl.scale', defaultMessage: 'PESO' },
  crLblRack: { id: 'cure.lbl.rack', defaultMessage: 'ESTANTERÍA DE MADURACIÓN' },
  crAria: { id: 'cure.aria', defaultMessage: 'Esquema: sensores en la estantería de quesos envían temperatura, humedad y CO₂ al tablero Growcast; sus dos módulos comandan el frío y el humidificador, y todo llega en vivo a tu teléfono.' },
})
