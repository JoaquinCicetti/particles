import { defineMessages } from 'react-intl'

/**
 * Designer strings. Like the landing catalog, `defaultMessage` is the Spanish
 * source; en/pt live in ./en.json and ./pt.json. Kept apart from the landing
 * messages so they only ship with the lazy designer chunk.
 */
export const D = defineMessages({
  kicker: { id: 'dz.kicker', defaultMessage: 'Diseñador de salas' },
  docTitle: { id: 'dz.docTitle', defaultMessage: 'Diseñador de salas de cultivo — Growcast Agro' },
  backHome: { id: 'dz.backHome', defaultMessage: 'Volver al inicio de Growcast Agro' },
  undo: { id: 'dz.undo', defaultMessage: 'Deshacer' },
  redo: { id: 'dz.redo', defaultMessage: 'Rehacer' },
  importBtn: { id: 'dz.import', defaultMessage: 'Importar' },
  exportBtn: { id: 'dz.export', defaultMessage: 'Exportar' },
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

  // tabs
  tabsAria: { id: 'dz.tabs', defaultMessage: 'Salas abiertas' },
  tabNew: { id: 'dz.tab.new', defaultMessage: 'Nueva sala' },
  tabRename: { id: 'dz.tab.rename', defaultMessage: 'Renombrar' },
  tabDuplicate: { id: 'dz.tab.duplicate', defaultMessage: 'Duplicar' },
  tabClose: { id: 'dz.tab.close', defaultMessage: 'Cerrar' },
  tabMenu: { id: 'dz.tab.menu', defaultMessage: 'Opciones de la sala' },
  defaultName: { id: 'dz.tab.defaultName', defaultMessage: 'Sala {n}' },
  copyName: { id: 'dz.tab.copyName', defaultMessage: '{name} (copia)' },
  confirmCloseTitle: { id: 'dz.tab.confirmTitle', defaultMessage: '¿Cerrar «{name}»?' },
  confirmCloseBody: {
    id: 'dz.tab.confirmBody',
    defaultMessage:
      'El diseño tiene {count, plural, one {# elemento} other {# elementos}}. Si no lo exportaste, se pierde.',
  },
  confirmCloseOk: { id: 'dz.tab.confirmOk', defaultMessage: 'Cerrar sala' },

  // steps
  step1: { id: 'dz.step.1', defaultMessage: 'Sala' },
  step2: { id: 'dz.step.2', defaultMessage: 'Racks y mesas' },
  step3: { id: 'dz.step.3', defaultMessage: 'Equipos' },
  step4: { id: 'dz.step.4', defaultMessage: 'Sensores' },
  step5: { id: 'dz.step.5', defaultMessage: 'Salidas extra' },
  step6: { id: 'dz.step.6', defaultMessage: 'Contacto' },
  step1Hint: { id: 'dz.step.1.hint', defaultMessage: 'Medidas interiores, en metros.' },
  step2Hint: {
    id: 'dz.step.2.hint',
    defaultMessage: 'Arrastralos en la vista 3D o en el plano. Se ajustan cada 10 cm.',
  },
  step3Hint: { id: 'dz.step.3.hint', defaultMessage: 'Cada equipo controlable suma una salida. Podés cambiarlo.' },
  step4Hint: { id: 'dz.step.4.hint', defaultMessage: 'Colgados del techo o a nivel del suelo.' },
  step5Hint: {
    id: 'dz.step.5.hint',
    defaultMessage: 'Salidas que no se dibujan: bombas, extractores, electroválvulas…',
  },
  step6Hint: { id: 'dz.step.6.hint', defaultMessage: 'Opcional. Se guarda dentro del archivo.' },

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

  // sensor kinds
  kindAir: { id: 'dz.kind.air', defaultMessage: 'Temperatura y humedad' },
  kindCo2: { id: 'dz.kind.co2', defaultMessage: 'CO₂' },
  kindSubstrate: { id: 'dz.kind.substrate', defaultMessage: 'Humedad / EC de sustrato' },
  kindWater: { id: 'dz.kind.water', defaultMessage: 'pH / EC de agua' },
  kindPar: { id: 'dz.kind.par', defaultMessage: 'Luz (PAR)' },

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
  cNotesPh: {
    id: 'dz.contact.notesPh',
    defaultMessage: 'Cultivo, etapa, equipos que ya tenés, lo que quieras contarnos…',
  },
  cEmailInvalid: { id: 'dz.contact.emailInvalid', defaultMessage: 'Revisá el email.' },

  // inspector
  inspector: { id: 'dz.insp.title', defaultMessage: 'Elemento' },
  inspectorEmpty: {
    id: 'dz.insp.empty',
    defaultMessage: 'Seleccioná un elemento en la vista o en las listas para editarlo.',
  },
  name: { id: 'dz.insp.name', defaultMessage: 'Nombre' },
  position: { id: 'dz.insp.position', defaultMessage: 'Posición' },
  size: { id: 'dz.insp.size', defaultMessage: 'Tamaño' },
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
  sensorsByKind: { id: 'dz.sum.sensorsByKind', defaultMessage: 'Sensores por tipo' },
  outputsByKind: { id: 'dz.sum.outputsByKind', defaultMessage: 'Salidas por tipo' },
  extraTag: { id: 'dz.sum.extraTag', defaultMessage: 'Extra' },
  none: { id: 'dz.sum.none', defaultMessage: 'Ninguno todavía' },
  summaryNote: {
    id: 'dz.sum.note',
    defaultMessage: 'Los totales se calculan siempre a partir del diseño.',
  },
  structures: {
    id: 'dz.sum.structures',
    defaultMessage: '{racks, plural, one {# rack} other {# racks}} · {tables, plural, one {# mesa} other {# mesas}}',
  },

  // views
  viewAria: { id: 'dz.view.aria', defaultMessage: 'Vista' },
  view3d: { id: 'dz.view.3d', defaultMessage: '3D' },
  viewPlan: { id: 'dz.view.plan', defaultMessage: 'Plano' },
  viewSplit: { id: 'dz.view.split', defaultMessage: 'Dividido' },
  frame: { id: 'dz.view.frame', defaultMessage: 'Encuadrar la sala' },
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
  isOutside: { id: 'dz.issue.outside', defaultMessage: 'queda fuera de la sala' },
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
  waRoom: { id: 'dz.wa.room', defaultMessage: 'Sala: {w} × {l} × {h} m ({area} m²)' },
  waSensors: { id: 'dz.wa.sensors', defaultMessage: 'Sensores: {n}' },
  waOutputs: { id: 'dz.wa.outputs', defaultMessage: 'Salidas a controlar: {n}' },
  waContact: { id: 'dz.wa.contact', defaultMessage: 'Contacto: {who}' },
  waAttach: { id: 'dz.wa.attach', defaultMessage: 'Adjunto el archivo {file}.' },

  // mobile panel tabs
  mDesign: { id: 'dz.m.design', defaultMessage: 'Diseño' },
  mItem: { id: 'dz.m.item', defaultMessage: 'Elemento' },
  mSummary: { id: 'dz.m.summary', defaultMessage: 'Resumen' },
})
