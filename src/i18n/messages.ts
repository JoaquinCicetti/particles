import { defineMessages } from 'react-intl'

/**
 * Single source of truth for every UI string. `defaultMessage` is the Spanish
 * (source) copy — the `es` catalog is derived from it at runtime — while the
 * `en` / `pt` catalogs live in ./locales/*.json keyed by these same ids.
 *
 * Every claim here is cut from the client's manual (docs/manual-growcast.md);
 * docs/landing-copy.md maps each string to its section. Do not add a claim
 * the manual does not make.
 */
export const M = defineMessages({
  // one label for every contact CTA — header, finale, contact section and the
  // dialog's own aria-label; the header form is uppercased in CSS
  ctaContact: { id: 'cta.contact', defaultMessage: 'Coordinar una reunión' },
  brandAria: { id: 'nav.brandAria', defaultMessage: 'Growcast — inicio' },
  navBrand: { id: 'nav.brand', defaultMessage: 'GROWCAST' },

  heroKicker: { id: 'hero.kicker', defaultMessage: 'MONITOREO, CONTROL Y AUTOMATIZACIÓN' },
  heroTitle: { id: 'hero.title', defaultMessage: 'Su operación,<br></br>en su mano<accent>.</accent>' },
  heroBody: {
    id: 'hero.body',
    defaultMessage:
      'Growcast conecta una operación física con su teléfono, tablet o PC. Mide, registra, analiza, alerta y puede actuar sobre la operación.',
  },

  sensorsKicker: { id: 'sensors.kicker', defaultMessage: 'MEDIMOS' },
  sensorsTitle: { id: 'sensors.title', defaultMessage: 'Sensores en los puntos críticos.' },
  sensorsBody: {
    id: 'sensors.body',
    defaultMessage:
      'Temperatura, humedad, CO₂, conductividad eléctrica, pH, presión, estado de equipos: cada rubro requiere medir variables distintas.',
  },

  dataKicker: { id: 'data.kicker', defaultMessage: 'ANALIZAMOS' },
  dataTitle: { id: 'data.title', defaultMessage: 'El dato se convierte en herramienta.' },
  dataBody: {
    id: 'data.body',
    defaultMessage:
      'Condiciones actuales, gráficos históricos, tendencias, indicadores y alertas, desde un mismo lugar.',
  },

  convergeKicker: { id: 'converge.kicker', defaultMessage: 'CONTROLAMOS Y REGISTRAMOS' },
  convergeTitle: { id: 'converge.title', defaultMessage: 'Todo converge en Growcast.' },
  convergeBody: {
    id: 'converge.body',
    defaultMessage:
      'Cuando la instalación lo permite, Growcast acciona equipos de forma automática o remota. Todo queda registrado: mediciones, alertas, estados de equipos y eventos.',
  },

  finaleFine: { id: 'finale.fine', defaultMessage: 'GROWCAST © 2026 — MONITOREO, CONTROL Y TRAZABILIDAD' },
  hint: { id: 'hint', defaultMessage: 'DESPLÁCESE PARA EXPLORAR' },

  // sensor metric cards
  mTempLabel: { id: 'metric.temp.label', defaultMessage: 'TEMPERATURA' },
  mHumLabel: { id: 'metric.hum.label', defaultMessage: 'HUMEDAD' },
  mCo2Label: { id: 'metric.co2.label', defaultMessage: 'CO₂' },
  mEcLabel: { id: 'metric.ec.label', defaultMessage: 'CONDUCTIVIDAD' },
  mPhLabel: { id: 'metric.ph.label', defaultMessage: 'pH' },

  // scroll phase ticker — the manual's five stages (§3)
  phase1: { id: 'phase.1', defaultMessage: '01 / LA OPERACIÓN' },
  phase2: { id: 'phase.2', defaultMessage: '02 / MEDIMOS' },
  phase3: { id: 'phase.3', defaultMessage: '03 / CONECTAMOS' },
  phase4: { id: 'phase.4', defaultMessage: '04 / ANALIZAMOS' },
  phase5: { id: 'phase.5', defaultMessage: '05 / CONTROLAMOS Y REGISTRAMOS' },
  phase6: { id: 'phase.6', defaultMessage: '06 / GROWCAST' },

  // contact dialog — WhatsApp is the sales contact channel only
  dialogKicker: { id: 'dialog.kicker', defaultMessage: 'COORDINEMOS' },
  dialogTitle: { id: 'dialog.title', defaultMessage: 'Hablemos de su operación' },
  dialogSub: {
    id: 'dialog.sub',
    defaultMessage: 'Le respondemos por WhatsApp. Déjenos su nombre y un mensaje y abrimos la conversación.',
  },
  dialogNameLabel: { id: 'dialog.nameLabel', defaultMessage: 'Nombre' },
  dialogNamePlaceholder: { id: 'dialog.namePlaceholder', defaultMessage: 'Su nombre o establecimiento' },
  dialogMsgLabel: { id: 'dialog.msgLabel', defaultMessage: 'Mensaje' },
  dialogSend: { id: 'dialog.send', defaultMessage: 'Enviar por WhatsApp' },
  dialogClose: { id: 'dialog.close', defaultMessage: 'Cerrar' },
  dialogDefaultMsg: {
    id: 'dialog.defaultMsg',
    defaultMessage: 'Hola Growcast, me gustaría coordinar una reunión para conocer la plataforma.',
  },
  dialogNamePrefix: { id: 'dialog.namePrefix', defaultMessage: 'Soy {name}. ' },

  // ── solutions (in-flow sections after the finale) ─────────────
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

  // block headings — the manual's own §5 headings
  solImplTitle: { id: 'sol.implTitle', defaultMessage: 'QUÉ CONTROLA' },
  solSolveTitle: { id: 'sol.solveTitle', defaultMessage: 'QUÉ PODEMOS RESOLVER' },
  solFigureTag: { id: 'sol.figureTag', defaultMessage: 'ESQUEMA DE CONEXIÓN' },

  // 01 — producción bajo cubierta o salas (manual §5.2)
  cultivoKicker: { id: 'sol.cultivo.kicker', defaultMessage: '01 / BAJO CUBIERTA Y SALAS' },
  cultivoTitle: { id: 'sol.cultivo.title', defaultMessage: 'Cada sala, en una misma plataforma.' },
  cultivoLede: {
    id: 'sol.cultivo.lede',
    defaultMessage:
      'Temperatura, humedad, CO₂, ventilación, riego, sustrato, agua y nutrición cambian permanentemente. Pequeños desvíos sostenidos en el tiempo pueden impactar en calidad, productividad, sanidad o eficiencia.',
  },
  cultivoDesignCta: { id: 'sol.cultivo.designCta', defaultMessage: 'Diseñe su sala' },
  cultivoDesignNote: {
    id: 'sol.cultivo.designNote',
    defaultMessage: 'ÁRMELA EN 3D Y PIDA SU COTIZACIÓN · GRATIS, SIN REGISTRO',
  },
  cultivoImpl1: { id: 'sol.cultivo.impl.1', defaultMessage: 'Ventilación y extracción.' },
  cultivoImpl2: { id: 'sol.cultivo.impl.2', defaultMessage: 'Calefacción y refrigeración.' },
  cultivoImpl3: { id: 'sol.cultivo.impl.3', defaultMessage: 'Riego, nutrición y nebulización.' },
  cultivoImpl4: { id: 'sol.cultivo.impl.4', defaultMessage: 'Inyección de CO₂ y otros periféricos eléctricos, según instalación.' },
  cultivoSolve1: { id: 'sol.cultivo.solve.1', defaultMessage: 'Medición manual de condiciones ambientales.' },
  cultivoSolve2: { id: 'sol.cultivo.solve.2', defaultMessage: 'Falta de alertas cuando una variable sale de rango.' },
  cultivoSolve3: { id: 'sol.cultivo.solve.3', defaultMessage: 'Falta de registros históricos por ciclo, sala o lote.' },
  cultivoSolve4: { id: 'sol.cultivo.solve.4', defaultMessage: 'Dificultad para sostener criterios de manejo cuando cambia el equipo de trabajo.' },
  cultivoStat1: { id: 'sol.cultivo.stat.1', defaultMessage: 'TEMPERATURA' },
  cultivoStat2: { id: 'sol.cultivo.stat.2', defaultMessage: 'HUMEDAD' },
  cultivoStat3: { id: 'sol.cultivo.stat.3', defaultMessage: 'EC' },
  cultivoFigure: { id: 'sol.cultivo.figure', defaultMessage: 'Sensores por sala → tablero Growcast → riego y ventilación' },

  // 02 — acopios de granos y plantas (manual §5.1)
  silosKicker: { id: 'sol.silos.kicker', defaultMessage: '02 / ACOPIOS DE GRANOS' },
  silosTitle: { id: 'sol.silos.title', defaultMessage: 'Cada silo, desde su propia mano.' },
  silosLede: {
    id: 'sol.silos.lede',
    defaultMessage:
      'La temperatura, la humedad, el CO₂, las condiciones exteriores y el uso de la aireación influyen directamente en la calidad del producto almacenado y en el consumo energético.',
  },
  silosImpl1: { id: 'sol.silos.impl.1', defaultMessage: 'Aireadores.' },
  silosImpl2: { id: 'sol.silos.impl.2', defaultMessage: 'Extractores.' },
  silosImpl3: { id: 'sol.silos.impl.3', defaultMessage: 'Accionamiento remoto o automático, según la estrategia operativa definida.' },
  silosImpl4: { id: 'sol.silos.impl.4', defaultMessage: 'Registro de cuándo, cuánto y bajo qué condiciones se usó la aireación.' },
  silosSolve1: { id: 'sol.silos.solve.1', defaultMessage: 'Falta de monitoreo continuo dentro de los silos.' },
  silosSolve2: { id: 'sol.silos.solve.2', defaultMessage: 'Aireación operada manualmente o sin registros.' },
  silosSolve3: { id: 'sol.silos.solve.3', defaultMessage: 'Consumo energético innecesario por falta de información.' },
  silosSolve4: { id: 'sol.silos.solve.4', defaultMessage: 'Detección tardía de condiciones críticas o extremas.' },
  silosStat1: { id: 'sol.silos.stat.1', defaultMessage: 'TEMP. INTERIOR' },
  silosStat2: { id: 'sol.silos.stat.2', defaultMessage: 'CO₂' },
  silosStat3: { id: 'sol.silos.stat.3', defaultMessage: 'HR INTERIOR' },
  silosFigure: { id: 'sol.silos.figure', defaultMessage: 'Sensores en el silo → tablero Growcast → aireadores' },

  // 03 — quesos y chacinados (manual §5.5)
  maduracionKicker: { id: 'sol.maduracion.kicker', defaultMessage: '03 / QUESOS Y CHACINADOS' },
  maduracionTitle: { id: 'sol.maduracion.title', defaultMessage: 'Cada ciclo, registrado.' },
  maduracionLede: {
    id: 'sol.maduracion.lede',
    defaultMessage:
      'En quesos, chacinados y otros alimentos madurados, las condiciones acumuladas durante el proceso pueden ser tan importantes como la receta o la materia prima.',
  },
  maduracionImpl1: { id: 'sol.maduracion.impl.1', defaultMessage: 'Ventilación y extracción.' },
  maduracionImpl2: { id: 'sol.maduracion.impl.2', defaultMessage: 'Calefacción y refrigeración.' },
  maduracionImpl3: { id: 'sol.maduracion.impl.3', defaultMessage: 'Humidificación y deshumidificación.' },
  maduracionImpl4: { id: 'sol.maduracion.impl.4', defaultMessage: 'Otros equipos de manejo ambiental, según instalación.' },
  maduracionSolve1: { id: 'sol.maduracion.solve.1', defaultMessage: 'Control manual de salas.' },
  maduracionSolve2: { id: 'sol.maduracion.solve.2', defaultMessage: 'Falta de alertas ante desvíos.' },
  maduracionSolve3: { id: 'sol.maduracion.solve.3', defaultMessage: 'Variabilidad entre lotes.' },
  maduracionSolve4: { id: 'sol.maduracion.solve.4', defaultMessage: 'Falta de evidencia para analizar qué ocurrió durante un proceso.' },
  maduracionStat1: { id: 'sol.maduracion.stat.1', defaultMessage: 'TEMPERATURA' },
  maduracionStat2: { id: 'sol.maduracion.stat.2', defaultMessage: 'HUMEDAD' },
  maduracionStat3: { id: 'sol.maduracion.stat.3', defaultMessage: 'CO₂' },
  maduracionFigure: { id: 'sol.maduracion.figure', defaultMessage: 'Sensores por cámara → tablero Growcast → refrigeración y humidificación' },

  // contact section
  contactKicker: { id: 'contact.kicker', defaultMessage: 'CONTACTO' },
  contactTitle: { id: 'contact.title', defaultMessage: 'Hablemos de su operación.' },
  contactBody: {
    id: 'contact.body',
    defaultMessage:
      '¿Existe algún proceso importante que hoy se resuelve "a ojo", sin datos? Cada implementación comienza entendiendo la operación.',
  },
  contactLine: { id: 'contact.line', defaultMessage: 'ROSARIO, SANTA FE · WHATSAPP {phone}' },

  // solutions — intro, applications, measured variables, how Growcast acts
  solutionsKicker: { id: 'solutions.kicker', defaultMessage: 'SOLUCIONES' },
  solutionsTitle: { id: 'solutions.title', defaultMessage: 'Una misma base tecnológica, distintas operaciones.' },
  solutionsBody: {
    id: 'solutions.body',
    defaultMessage:
      'Las soluciones cambian según el rubro, pero la lógica es siempre la misma: medir una variable importante, registrar lo que ocurre, interpretar la información y, cuando es posible, controlar los equipos.',
  },
  solWhoTitle: { id: 'sol.whoTitle', defaultMessage: 'APLICACIONES' },
  solMeasureTitle: { id: 'sol.measureTitle', defaultMessage: 'QUÉ MIDE' },
  solStepsTitle: { id: 'sol.stepsTitle', defaultMessage: 'CÓMO ACTÚA GROWCAST' },
  step1Title: { id: 'sol.step.1.title', defaultMessage: 'Medimos' },
  step2Title: { id: 'sol.step.2.title', defaultMessage: 'Analizamos y alertamos' },
  step3Title: { id: 'sol.step.3.title', defaultMessage: 'Controlamos y registramos' },

  // measured-variable chips — only what the manual's "Qué mide" lists
  varTemp: { id: 'var.temp', defaultMessage: 'Temperatura' },
  varHum: { id: 'var.hum', defaultMessage: 'Humedad' },
  varCo2: { id: 'var.co2', defaultMessage: 'CO₂' },
  varCo2IfApplies: { id: 'var.co2IfApplies', defaultMessage: 'CO₂ (si aplica)' },
  varEc: { id: 'var.ec', defaultMessage: 'Conductividad eléctrica' },
  varPh: { id: 'var.ph', defaultMessage: 'pH' },
  varVpd: { id: 'var.vpd', defaultMessage: 'VPD' },
  varSubstrate: { id: 'var.substrate', defaultMessage: 'Humedad de sustrato' },
  varTempIn: { id: 'var.tempIn', defaultMessage: 'Temperatura interior' },
  varHumIn: { id: 'var.humIn', defaultMessage: 'Humedad relativa interior' },
  varTempOut: { id: 'var.tempOut', defaultMessage: 'Temperatura exterior' },
  varHumOut: { id: 'var.humOut', defaultMessage: 'Humedad relativa exterior' },
  varFans: { id: 'var.fans', defaultMessage: 'Estado de aireadores' },
  varEquip: { id: 'var.equip', defaultMessage: 'Estado de equipos' },
  varHours: { id: 'var.hours', defaultMessage: 'Horas de funcionamiento' },

  cultivoWho: {
    id: 'sol.cultivo.who',
    defaultMessage:
      'Frutas y verduras, hongos, hidroponía, flores ornamentales, viveros, fitomejoramiento, procesos biotecnológicos y salas con ambiente controlado.',
  },
  cultivoStep1: { id: 'sol.cultivo.step.1', defaultMessage: 'Instalamos sensores en cada sala, invernadero o sector, en los puntos relevantes de su proceso.' },
  cultivoStep2: { id: 'sol.cultivo.step.2', defaultMessage: 'Visualice cada espacio desde una misma plataforma: detecte desvíos en tiempo real, reciba alertas y compare ambientes.' },
  cultivoStep3: { id: 'sol.cultivo.step.3', defaultMessage: 'Growcast confecciona registros históricos por ciclo, sala o lote y, cuando la instalación lo permite, automatiza tareas repetitivas.' },

  silosWho: {
    id: 'sol.silos.who',
    defaultMessage: 'Acopios de granos, fábricas de alimentos balanceados, semilleros, molinos harineros, acondicionadoras y malterías.',
  },
  silosStep1: { id: 'sol.silos.step.1', defaultMessage: 'Instalamos sensores en cada silo: temperatura, humedad relativa y CO₂ interiores, junto con las condiciones exteriores.' },
  silosStep2: { id: 'sol.silos.step.2', defaultMessage: 'Growcast centraliza la información de cada silo: condiciones actuales, históricos, alertas y comparación entre silos.' },
  silosStep3: { id: 'sol.silos.step.3', defaultMessage: 'Cuando el sistema se integra a la aireación, los aireadores pueden accionarse de forma remota o automática según la estrategia operativa definida, y queda registrado cuándo, cuánto y bajo qué condiciones se usaron.' },

  maduracionWho: {
    id: 'sol.maduracion.who',
    defaultMessage:
      'Salas de maduración de quesos, secaderos de chacinados, cámaras de maduración y de conservación, y depósitos con condiciones ambientales críticas.',
  },
  maduracionStep1: { id: 'sol.maduracion.step.1', defaultMessage: 'Instalamos sensores en cada sala, cámara o secadero.' },
  maduracionStep2: { id: 'sol.maduracion.step.2', defaultMessage: 'Visualice las condiciones en tiempo real, reciba alertas ante desvíos y compare ciclos de maduración o secado.' },
  maduracionStep3: { id: 'sol.maduracion.step.3', defaultMessage: 'Registramos la evolución de las condiciones de cada lote y, cuando la instalación lo permite, nos integramos con los equipos de control ambiental.' },

  // shared hardware labels for the three schematics (short — rendered inside the SVG)
  figPhone: { id: 'sol.fig.phone', defaultMessage: 'SU TELÉFONO' },
  figApp: { id: 'sol.fig.app', defaultMessage: 'APP GROWCAST' },
  figLive: { id: 'sol.fig.live', defaultMessage: 'EN VIVO' },

  // silo illustration labels (short — rendered inside the SVG)
  siloLblProbes: { id: 'silo.lbl.probes', defaultMessage: 'T° · HR INTERIOR' },
  siloLblNode: { id: 'silo.lbl.node', defaultMessage: 'NODO' },
  siloLblFan: { id: 'silo.lbl.fan', defaultMessage: 'AIREADOR' },
  siloLblHot: { id: 'silo.lbl.hot', defaultMessage: 'DESVÍO' },
  siloAria: { id: 'silo.aria', defaultMessage: 'Esquema: los sensores dentro del silo y un sensor de CO₂ envían sus lecturas al tablero Growcast, que acciona el aireador; todo se ve en tiempo real en su teléfono.' },
  // grow-room illustration labels
  grLblLights: { id: 'grow.lbl.lights', defaultMessage: 'LUCES' },
  grLblFan: { id: 'grow.lbl.fan', defaultMessage: 'VENTILACIÓN' },
  grLblSensor: { id: 'grow.lbl.sensor', defaultMessage: 'T° · HR · CO₂' },
  grLblIrrig: { id: 'grow.lbl.irrig', defaultMessage: 'RIEGO' },
  grLblEcph: { id: 'grow.lbl.ecph', defaultMessage: 'EC · pH' },
  grLblControl: { id: 'grow.lbl.control', defaultMessage: 'CONTROL' },
  grLblRoom: { id: 'grow.lbl.room', defaultMessage: 'SALA DE CULTIVO' },
  grAria: { id: 'grow.aria', defaultMessage: 'Esquema: los sensores de la sala envían temperatura, humedad, CO₂, EC y pH al tablero Growcast, que acciona luces, ventilación y riego; todo se ve en tiempo real en su teléfono.' },

  // curing-room illustration labels
  crLblSensor: { id: 'cure.lbl.sensor', defaultMessage: 'T° · HR' },
  crLblCo2: { id: 'cure.lbl.co2', defaultMessage: 'CO₂' },
  crLblCold: { id: 'cure.lbl.cold', defaultMessage: 'FRÍO' },
  crLblHum: { id: 'cure.lbl.hum', defaultMessage: 'HUMIDIFICADOR' },
  crLblRack: { id: 'cure.lbl.rack', defaultMessage: 'ESTANTERÍA DE MADURACIÓN' },
  crAria: { id: 'cure.aria', defaultMessage: 'Esquema: los sensores de la sala de maduración envían temperatura, humedad y CO₂ al tablero Growcast, que acciona la refrigeración y el humidificador; todo se ve en tiempo real en su teléfono.' },
})
