import { defineMessages } from 'react-intl'

/**
 * Single source of truth for every UI string. `defaultMessage` is the Spanish
 * (source) copy — the `es` catalog is derived from it at runtime — while the
 * `en` / `pt` catalogs live in ./locales/*.json keyed by these same ids.
 */
export const M = defineMessages({
  navCta: { id: 'nav.cta', defaultMessage: 'COORDINAR REUNIÓN' },
  brandAria: { id: 'nav.brandAria', defaultMessage: 'Growcast Agro — inicio' },

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

  finaleCta: { id: 'finale.cta', defaultMessage: 'Coordinar una reunión' },
  finaleFine: { id: 'finale.fine', defaultMessage: 'GROWCAST AGRO © 2026 — INTELIGENCIA AGRÍCOLA' },
  hint: { id: 'hint', defaultMessage: 'DESPLAZÁ PARA EXPLORAR' },

  // sensor metric cards
  mTempLabel: { id: 'metric.temp.label', defaultMessage: 'TEMPERATURA' },
  mTempNote: { id: 'metric.temp.note', defaultMessage: 'Δ −0.3 / 24H' },
  mHumLabel: { id: 'metric.hum.label', defaultMessage: 'HUMEDAD' },
  mHumNote: { id: 'metric.hum.note', defaultMessage: 'ESTABLE' },
  mCo2Label: { id: 'metric.co2.label', defaultMessage: 'CO₂' },
  mCo2Note: { id: 'metric.co2.note', defaultMessage: 'NOMINAL' },
  mEcLabel: { id: 'metric.ec.label', defaultMessage: 'CONDUCTIVIDAD' },
  mEcNote: { id: 'metric.ec.note', defaultMessage: 'EC · ÓPTIMO' },
  mPhLabel: { id: 'metric.ph.label', defaultMessage: 'pH' },
  mPhNote: { id: 'metric.ph.note', defaultMessage: 'EN RANGO' },
  mAirLabel: { id: 'metric.air.label', defaultMessage: 'FLUJO DE AIRE' },
  mAirNote: { id: 'metric.air.note', defaultMessage: 'ÓPTIMO' },

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
  dialogAria: { id: 'dialog.aria', defaultMessage: 'Coordinar una reunión' },
  dialogDefaultMsg: {
    id: 'dialog.defaultMsg',
    defaultMessage: 'Hola Growcast, me gustaría coordinar una reunión para conocer la plataforma.',
  },
  dialogNamePrefix: { id: 'dialog.namePrefix', defaultMessage: 'Soy {name}. ' },
})
