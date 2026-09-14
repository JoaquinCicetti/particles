import { defineMessages } from 'react-intl'

/**
 * Designer strings. Like the landing catalog, `defaultMessage` is the Spanish
 * source; en/pt live in ./en.json and ./pt.json. Kept apart from the landing
 * messages so they only ship with the lazy designer chunk. Strings that differ
 * between the three designers carry a `.silo` / `.curing` variant and are
 * picked through `KINDS[kind].text` (model/kinds.ts).
 */
export const D = defineMessages({
  kicker: { id: 'dz.kicker', defaultMessage: 'Diseñador de salas' },
  kickerSilo: { id: 'dz.kicker.silo', defaultMessage: 'Diseñador de silos' },
  kickerCuring: { id: 'dz.kicker.curing', defaultMessage: 'Diseñador de cámaras de maduración' },
  docTitle: { id: 'dz.docTitle', defaultMessage: 'Diseñador de salas de cultivo — Growcast Agro' },
  docTitleSilo: { id: 'dz.docTitle.silo', defaultMessage: 'Diseñador de silos — Growcast Agro' },
  docTitleCuring: { id: 'dz.docTitle.curing', defaultMessage: 'Diseñador de cámaras de maduración — Growcast Agro' },
  backHome: { id: 'dz.backHome', defaultMessage: 'Volver al inicio de Growcast Agro' },
  undo: { id: 'dz.undo', defaultMessage: 'Deshacer' },
  redo: { id: 'dz.redo', defaultMessage: 'Rehacer' },
  importBtn: { id: 'dz.import', defaultMessage: 'Importar' },
  sendBtn: { id: 'dz.send', defaultMessage: 'Enviar a Growcast' },
  importHint: { id: 'dz.importHint', defaultMessage: 'Abrir un diseño (.json) en una pestaña nueva' },
  exportHint: { id: 'dz.exportHint', defaultMessage: 'Descargar este diseño como .json' },
  sendHint: { id: 'dz.sendHint', defaultMessage: 'Descarga el archivo y abre WhatsApp con el resumen' },
  saved: { id: 'dz.saved', defaultMessage: 'Guardado en este navegador' },
  saving: { id: 'dz.saving', defaultMessage: 'Guardando…' },
  saveError: { id: 'dz.saveError', defaultMessage: 'No se pudo guardar en este navegador' },
  close: { id: 'dz.close', defaultMessage: 'Cerrar' },
  cancel: { id: 'dz.cancel', defaultMessage: 'Cancelar' },
  ok: { id: 'dz.ok', defaultMessage: 'Entendido' },
  decrease: { id: 'dz.decrease', defaultMessage: 'Restar' },
  increase: { id: 'dz.increase', defaultMessage: 'Sumar' },
  remove: { id: 'dz.remove', defaultMessage: 'Quitar' },
  empty: { id: 'dz.empty', defaultMessage: 'Todavía no agregaste ninguno.' },

  // switch between the three designers
  kindNavAria: { id: 'dz.kindNav.aria', defaultMessage: 'Diseñadores' },
  kindNavGrow: { id: 'dz.kindNav.grow', defaultMessage: 'Salas' },
  kindNavSilo: { id: 'dz.kindNav.silo', defaultMessage: 'Silos' },
  kindNavCuring: { id: 'dz.kindNav.curing', defaultMessage: 'Maduración' },

  // tabs
  tabsAria: { id: 'dz.tabs', defaultMessage: 'Diseños abiertos' },
  tabNew: { id: 'dz.tab.new', defaultMessage: 'Nuevo diseño' },
  tabRename: { id: 'dz.tab.rename', defaultMessage: 'Renombrar' },
  tabDuplicate: { id: 'dz.tab.duplicate', defaultMessage: 'Duplicar' },
  tabClose: { id: 'dz.tab.close', defaultMessage: 'Cerrar' },
  tabMenu: { id: 'dz.tab.menu', defaultMessage: 'Opciones del diseño' },
  defaultName: { id: 'dz.tab.defaultName', defaultMessage: 'Sala {n}' },
  defaultNameSilo: { id: 'dz.tab.defaultName.silo', defaultMessage: 'Silo {n}' },
  defaultNameCuring: { id: 'dz.tab.defaultName.curing', defaultMessage: 'Cámara {n}' },
  copyName: { id: 'dz.tab.copyName', defaultMessage: '{name} (copia)' },
  confirmCloseTitle: { id: 'dz.tab.confirmTitle', defaultMessage: '¿Cerrar «{name}»?' },
  confirmCloseBody: {
    id: 'dz.tab.confirmBody',
    defaultMessage:
      'El diseño tiene {count, plural, one {# elemento} other {# elementos}}. Si no lo exportaste, se pierde.',
  },
  confirmCloseOk: { id: 'dz.tab.confirmOk', defaultMessage: 'Cerrar diseño' },

  // object palette (one filterable list, no steps)
  addTitle: { id: 'dz.add.title', defaultMessage: 'Agregar al diseño' },
  inRoom: { id: 'dz.add.inRoom', defaultMessage: 'En el diseño' },
  searchPh: { id: 'dz.add.searchPh', defaultMessage: 'Buscar…' },
  noMatches: { id: 'dz.add.noMatches', defaultMessage: 'Nada coincide con la búsqueda.' },
  filterAll: { id: 'dz.filter.all', defaultMessage: 'Todo' },
  filterStructure: { id: 'dz.filter.structure', defaultMessage: 'Estructura' },
  // the customer's own equipment, apart from Growcast's hardware
  filterPeripheral: { id: 'dz.filter.peripheral', defaultMessage: 'Periféricos' },
  filterGrowcast: { id: 'dz.filter.growcast', defaultMessage: 'Growcast' },
  filterAria: { id: 'dz.filter.aria', defaultMessage: 'Filtrar objetos' },

  // finish step
  finish: { id: 'dz.finish', defaultMessage: 'Exportar' },
  finishHint: { id: 'dz.finish.hint', defaultMessage: 'Revisá el resumen, agregá lo que falte y descargá o envianos el diseño.' },
  finishTitle: { id: 'dz.finish.title', defaultMessage: 'Revisar y enviar' },
  downloadBtn: { id: 'dz.finish.download', defaultMessage: 'Descargar .json' },
  roomLine: { id: 'dz.finish.roomLine', defaultMessage: '{w} × {l} × {h} m · {area} m²' },
  roomLineRound: { id: 'dz.finish.roomLineRound', defaultMessage: 'Ø {w} × {h} m · {area} m²' },
  // snapshot: the views on screen, saved as a PDF
  pdfBtn: { id: 'dz.pdf.button', defaultMessage: 'Descargar .pdf' },
  pdfHint: { id: 'dz.pdf.hint', defaultMessage: 'Guardar la vista actual como PDF' },
  pdfFailed: { id: 'dz.pdf.failed', defaultMessage: 'No se pudo generar el PDF' },

  // remaining step copy
  roomTitle: { id: 'dz.step.1', defaultMessage: 'Sala' },
  roomTitleSilo: { id: 'dz.room.title.silo', defaultMessage: 'Silo o celda' },
  // a silo zone is round; the silo designer also covers rectangular storage cells
  shapeAria: { id: 'dz.shape.aria', defaultMessage: 'Forma' },
  shapeRound: { id: 'dz.shape.round', defaultMessage: 'Silo' },
  shapeBox: { id: 'dz.shape.box', defaultMessage: 'Celda / galpón' },
  roomTitleCuring: { id: 'dz.room.title.curing', defaultMessage: 'Cámara' },
  extrasTitle: { id: 'dz.step.5', defaultMessage: 'Salidas extra' },
  contactTitle: { id: 'dz.step.6', defaultMessage: 'Contacto' },
  roomHint: { id: 'dz.step.1.hint', defaultMessage: 'Medidas interiores, en metros.' },
  addHint: {
    id: 'dz.step.2.hint',
    defaultMessage: 'Arrastralos en la vista 3D o en el plano. Se ajustan cada 10 cm.',
  },
  extrasHint: {
    id: 'dz.step.5.hint',
    defaultMessage: 'Salidas que no se dibujan: bombas, extractores, electroválvulas…',
  },
  extrasHintOther: { id: 'dz.step.5.hint.other', defaultMessage: 'Salidas que no se dibujan en el diseño.' },
  contactHint: { id: 'dz.step.6.hint', defaultMessage: 'Opcional. Se guarda dentro del archivo.' },

  // room
  roomName: { id: 'dz.room.name', defaultMessage: 'Nombre' },
  width: { id: 'dz.room.width', defaultMessage: 'Ancho' },
  length: { id: 'dz.room.length', defaultMessage: 'Largo' },
  height: { id: 'dz.room.height', defaultMessage: 'Alto' },
  depth: { id: 'dz.depth', defaultMessage: 'Prof.' },
  area: { id: 'dz.room.area', defaultMessage: 'Superficie' },
  volume: { id: 'dz.room.volume', defaultMessage: 'Volumen' },

  // item types
  typeRack: { id: 'dz.type.rack', defaultMessage: 'Rack' },
  typeTable: { id: 'dz.type.table', defaultMessage: 'Mesa de cultivo' },
  typeLight: { id: 'dz.type.light', defaultMessage: 'Luminaria' },
  typeClimate: { id: 'dz.type.climate', defaultMessage: 'Aire acondicionado' },
  typeFan: { id: 'dz.type.fan', defaultMessage: 'Ventilador' },
  typeHumidifier: { id: 'dz.type.humidifier', defaultMessage: 'Humidificador' },
  typeSensor: { id: 'dz.type.sensor', defaultMessage: 'Sensor' },
  typeAerator: { id: 'dz.type.aerator', defaultMessage: 'Aireador' },
  typeExtractor: { id: 'dz.type.extractor', defaultMessage: 'Extractor' },
  typeCheeseRack: { id: 'dz.type.cheeseRack', defaultMessage: 'Estantería para quesos' },
  typeHanger: { id: 'dz.type.hanger', defaultMessage: 'Colgadero para chacinados' },
  typePallet: { id: 'dz.type.pallet', defaultMessage: 'Pallet / estiba' },
  typeTrolley: { id: 'dz.type.trolley', defaultMessage: 'Carro móvil' },
  typeCooler: { id: 'dz.type.cooler', defaultMessage: 'Equipo de frío' },
  typeHeater: { id: 'dz.type.heater', defaultMessage: 'Calefactor' },
  typeDehumidifier: { id: 'dz.type.dehumidifier', defaultMessage: 'Deshumidificador' },
  typeAppliance: { id: 'dz.type.appliance', defaultMessage: 'Otro periférico' },
  // Growcast hardware — names as in the Growcast docs
  typeGrowcastPlus: { id: 'dz.type.growcastPlus', defaultMessage: 'Growcast+' },
  typeIndustria: { id: 'dz.type.industria', defaultMessage: 'Growcast Industria (tablero)' },
  typeControlModule: { id: 'dz.type.controlModule', defaultMessage: 'Módulo de control' },
  typeExpander: { id: 'dz.type.expander', defaultMessage: 'Expansor' },

  // sensor kinds — Growcast's sensor line, plus the silo placements
  kindAir: { id: 'dz.kind.air', defaultMessage: 'Temperatura y humedad' },
  kindAirCo2: { id: 'dz.kind.airCo2', defaultMessage: 'Temperatura, humedad y CO₂' },
  kindTeros12: { id: 'dz.kind.teros12', defaultMessage: 'TEROS 12' },
  kindPressure: { id: 'dz.kind.pressure', defaultMessage: 'Temperatura y presión' },
  kindSoil: { id: 'dz.kind.soil', defaultMessage: 'Humedad de suelo' },
  kindWater: { id: 'dz.kind.water', defaultMessage: 'pH / EC' },
  kindCo2: { id: 'dz.kind.co2', defaultMessage: 'CO₂' },
  kindInterior: { id: 'dz.kind.interior', defaultMessage: 'Temperatura y humedad interior' },
  kindOutdoor: { id: 'dz.kind.outdoor', defaultMessage: 'Temperatura y humedad exterior' },

  // extra outputs
  exPump: { id: 'dz.extra.pump', defaultMessage: 'Bomba de riego' },
  exExtractor: { id: 'dz.extra.extractor', defaultMessage: 'Extractor' },
  exSolenoid: { id: 'dz.extra.solenoid', defaultMessage: 'Electroválvula' },
  exDehumidifier: { id: 'dz.extra.dehumidifier', defaultMessage: 'Deshumidificador' },
  exHeater: { id: 'dz.extra.heater', defaultMessage: 'Calefactor' },
  exCo2: { id: 'dz.extra.co2', defaultMessage: 'Inyector de CO₂' },
  exOther: { id: 'dz.extra.other', defaultMessage: 'Otra salida' },
  extraQty: { id: 'dz.extra.qty', defaultMessage: 'Cantidad' },
  extraNotePh: { id: 'dz.extra.notePh', defaultMessage: 'Detalle (opcional)' },
  extraEmpty: { id: 'dz.extra.empty', defaultMessage: 'Sin salidas extra por ahora.' },
  extraQuickAdd: { id: 'dz.extra.quickAdd', defaultMessage: 'Agregar' },

  // contact
  cName: { id: 'dz.contact.name', defaultMessage: 'Nombre' },
  cEmail: { id: 'dz.contact.email', defaultMessage: 'Email' },
  cPhone: { id: 'dz.contact.phone', defaultMessage: 'Teléfono' },
  cLocation: { id: 'dz.contact.location', defaultMessage: 'Ubicación' },
  cNotes: { id: 'dz.contact.notes', defaultMessage: 'Notas' },
  cNamePh: { id: 'dz.contact.namePh', defaultMessage: 'Tu nombre o empresa' },
  cLocationPh: { id: 'dz.contact.locationPh', defaultMessage: 'Ciudad, provincia' },
  cEmailPh: { id: 'dz.contact.emailPh', defaultMessage: 'nombre@empresa.com' },
  cPhonePh: { id: 'dz.contact.phonePh', defaultMessage: 'Con código de área' },
  cNotesPh: {
    id: 'dz.contact.notesPh',
    defaultMessage: 'Cultivo, etapa, equipos que ya tenés, lo que quieras contarnos…',
  },
  cNotesPhSilo: {
    id: 'dz.contact.notesPh.silo',
    defaultMessage: 'Granos que almacenás, equipos que ya tenés, lo que quieras contarnos…',
  },
  cNotesPhCuring: {
    id: 'dz.contact.notesPh.curing',
    defaultMessage: 'Productos que madurás, equipos que ya tenés, lo que quieras contarnos…',
  },
  cEmailInvalid: { id: 'dz.contact.emailInvalid', defaultMessage: 'Revisá el email.' },

  // inspector
  inspectorEmpty: {
    id: 'dz.insp.empty',
    defaultMessage: 'Seleccioná un elemento en la vista o en las listas para editarlo.',
  },
  name: { id: 'dz.insp.name', defaultMessage: 'Nombre' },
  position: { id: 'dz.insp.position', defaultMessage: 'Posición' },
  size: { id: 'dz.insp.size', defaultMessage: 'Tamaño' },
  diameter: { id: 'dz.insp.diameter', defaultMessage: 'Diámetro' },
  rotation: { id: 'dz.insp.rotation', defaultMessage: 'Rotación' },
  rotLeft: { id: 'dz.insp.rotLeft', defaultMessage: 'Girar 90° a la izquierda' },
  rotRight: { id: 'dz.insp.rotRight', defaultMessage: 'Girar 90° a la derecha' },
  mount: { id: 'dz.insp.mount', defaultMessage: 'Altura de montaje' },
  mountFloor: { id: 'dz.insp.mountFloor', defaultMessage: 'Suelo' },
  mountCanopy: { id: 'dz.insp.mountCanopy', defaultMessage: 'Canopia' },
  mountCeiling: { id: 'dz.insp.mountCeiling', defaultMessage: 'Techo' },
  sensorKind: { id: 'dz.insp.sensorKind', defaultMessage: 'Tipo de sensor' },
  outputs: { id: 'dz.insp.outputs', defaultMessage: 'Salidas a controlar' },
  outputsHint: {
    id: 'dz.insp.outputsHint',
    defaultMessage: 'Cuántas salidas del controlador usa este equipo (por ejemplo, 2 si tiene frío y calor).',
  },
  duplicate: { id: 'dz.insp.duplicate', defaultMessage: 'Duplicar' },
  delete: { id: 'dz.insp.delete', defaultMessage: 'Eliminar' },
  shortcuts: { id: 'dz.kb.title', defaultMessage: 'Atajos' },
  kbMove: { id: 'dz.kb.move', defaultMessage: 'Mover 10 cm (Shift: 1 m)' },
  kbRotate: { id: 'dz.kb.rotate', defaultMessage: 'Girar 90°' },
  kbDuplicate: { id: 'dz.kb.duplicate', defaultMessage: 'Duplicar' },
  kbDelete: { id: 'dz.kb.delete', defaultMessage: 'Eliminar' },
  kbUndo: { id: 'dz.kb.undo', defaultMessage: 'Deshacer / rehacer' },
  kbDeselect: { id: 'dz.kb.deselect', defaultMessage: 'Deseleccionar' },

  // summary
  summary: { id: 'dz.sum.title', defaultMessage: 'Resumen para cotizar' },
  sensorsTotal: { id: 'dz.sum.sensors', defaultMessage: 'Sensores' },
  outputsTotal: { id: 'dz.sum.outputs', defaultMessage: 'Salidas' },
  structuresByKind: { id: 'dz.sum.structuresByKind', defaultMessage: 'Estructuras' },
  devicesTotal: { id: 'dz.sum.devices', defaultMessage: 'Equipos Growcast' },
  devicesByKind: { id: 'dz.sum.devicesByKind', defaultMessage: 'Equipos Growcast' },
  sensorsByKind: { id: 'dz.sum.sensorsByKind', defaultMessage: 'Sensores por tipo' },
  outputsByKind: { id: 'dz.sum.outputsByKind', defaultMessage: 'Salidas por tipo' },
  extraTag: { id: 'dz.sum.extraTag', defaultMessage: 'Extra' },
  none: { id: 'dz.sum.none', defaultMessage: 'Ninguno todavía' },
  summaryNote: {
    id: 'dz.sum.note',
    defaultMessage: 'Los totales se calculan siempre a partir del diseño.',
  },

  // views
  viewAria: { id: 'dz.view.aria', defaultMessage: 'Vista' },
  view3d: { id: 'dz.view.3d', defaultMessage: '3D' },
  viewPlan: { id: 'dz.view.plan', defaultMessage: 'Plano' },
  viewSplit: { id: 'dz.view.split', defaultMessage: 'Dividido' },
  frame: { id: 'dz.view.frame', defaultMessage: 'Encuadrar el diseño' },
  hint3d: {
    id: 'dz.view.hint3d',
    defaultMessage: 'Arrastrá un elemento para moverlo · Arrastrá el fondo para girar · Rueda para zoom',
  },
  hintPlan: { id: 'dz.view.hintPlan', defaultMessage: 'Arrastrá los elementos · Rueda para zoom · Arrastrá el fondo para desplazar' },

  // import errors
  errTitle: { id: 'dz.err.title', defaultMessage: 'No se pudo abrir el archivo' },
  errJson: { id: 'dz.err.json', defaultMessage: 'El archivo no es un JSON válido.' },
  errFormat: {
    id: 'dz.err.format',
    defaultMessage: 'No es un diseño de Growcast: falta «format»: «growcast.room-design».',
  },
  errVersion: {
    id: 'dz.err.version',
    defaultMessage: 'El diseño usa una versión que esta página no reconoce ({version}).',
  },
  errSchema: { id: 'dz.err.schema', defaultMessage: 'El archivo tiene datos inválidos, así que no se cargó nada:' },
  errSize: { id: 'dz.err.size', defaultMessage: 'El archivo es demasiado grande (máximo 5 MB).' },
  errMore: { id: 'dz.err.more', defaultMessage: '…y {n} más.' },
  isType: { id: 'dz.issue.type', defaultMessage: 'tipo de dato inválido' },
  isRange: { id: 'dz.issue.range', defaultMessage: 'fuera de rango' },
  isRequired: { id: 'dz.issue.required', defaultMessage: 'falta el dato' },
  isNotAllowed: { id: 'dz.issue.notAllowed', defaultMessage: 'no corresponde a este tipo de elemento' },
  isOutside: { id: 'dz.issue.outside', defaultMessage: 'queda fuera del espacio diseñado' },
  isDuplicate: { id: 'dz.issue.duplicate', defaultMessage: 'id repetido' },
  isInvalid: { id: 'dz.issue.invalid', defaultMessage: 'valor inválido' },

  dropHint: { id: 'dz.drop', defaultMessage: 'Soltá el archivo .json para abrirlo en una pestaña nueva' },

  // toasts
  toastImported: { id: 'dz.toast.imported', defaultMessage: '«{name}» se abrió en una pestaña nueva' },
  toastExported: { id: 'dz.toast.exported', defaultMessage: 'Descargaste {file}' },
  toastSent: { id: 'dz.toast.sent', defaultMessage: 'Adjuntá el archivo descargado en el chat de WhatsApp' },

  // WhatsApp hand-off
  waIntro: {
    id: 'dz.wa.intro',
    defaultMessage: 'Hola Growcast, les comparto el diseño de mi sala «{name}» para cotizar.',
  },
  waIntroSilo: {
    id: 'dz.wa.intro.silo',
    defaultMessage: 'Hola Growcast, les comparto el diseño de mi silo «{name}» para cotizar.',
  },
  waIntroCuring: {
    id: 'dz.wa.intro.curing',
    defaultMessage: 'Hola Growcast, les comparto el diseño de mi cámara «{name}» para cotizar.',
  },
  waRoom: { id: 'dz.wa.room', defaultMessage: 'Sala: {w} × {l} × {h} m ({area} m²)' },
  waRoomSilo: { id: 'dz.wa.room.silo', defaultMessage: 'Celda: {w} × {l} × {h} m ({area} m²)' },
  waRoomRound: { id: 'dz.wa.room.round', defaultMessage: 'Silo: Ø {w} × {h} m ({area} m²)' },
  waRoomCuring: { id: 'dz.wa.room.curing', defaultMessage: 'Cámara: {w} × {l} × {h} m ({area} m²)' },
  waStructures: { id: 'dz.wa.structures', defaultMessage: 'Estructuras: {n}' },
  waDevices: { id: 'dz.wa.devices', defaultMessage: 'Equipos Growcast: {n}' },
  waSensors: { id: 'dz.wa.sensors', defaultMessage: 'Sensores: {n}' },
  waOutputs: { id: 'dz.wa.outputs', defaultMessage: 'Salidas a controlar: {n}' },
  waContact: { id: 'dz.wa.contact', defaultMessage: 'Contacto: {who}' },
  waAttach: { id: 'dz.wa.attach', defaultMessage: 'Adjunto el archivo {file}.' },

  // mobile panel tabs
  mDesign: { id: 'dz.m.design', defaultMessage: 'Diseño' },
  mItem: { id: 'dz.m.item', defaultMessage: 'Elemento' },
})
