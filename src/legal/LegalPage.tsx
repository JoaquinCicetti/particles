import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useLocale } from '../i18n/I18nProvider'
import { M } from '../i18n/messages'
import { LEGAL_EMAIL } from '../lib/contact'
import { onNavClick, type LegalDoc } from '../lib/route'
import LegalLinks from '../ui/LegalLinks'
import {
  COMPANY,
  PRIVACY,
  PRIVACY_CLOSING,
  PRIVACY_TITLE,
  REGRET,
  REGRET_TITLE,
  TERMS,
  TERMS_TITLE,
  type Block,
} from './content'
import './legal.css'

const TITLES: Record<LegalDoc, string> = { terms: TERMS_TITLE, privacy: PRIVACY_TITLE, regret: REGRET_TITLE }

/** Terms, privacy policy and the "botón de arrepentimiento": one reading layout, Spanish copy. */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const intl = useIntl()
  const { locale } = useLocale()
  const title = TITLES[doc]

  useEffect(() => {
    const prev = document.title
    document.title = `${title} — Growcast`
    return () => {
      document.title = prev
    }
  }, [title])

  return (
    <div className="legal">
      <header className="legal-top">
        <a className="brand" href="/" onClick={onNavClick} aria-label={intl.formatMessage(M.brandAria)}>
          <span className="brand-mark" aria-hidden />
          <span className="wordmark">Growcast</span>
        </a>
        <a className="legal-back" href="/" onClick={onNavClick}>
          <span aria-hidden>←</span> {intl.formatMessage(M.legalBack)}
        </a>
      </header>

      <main className="legal-doc" lang="es">
        <span className="kicker">{COMPANY}</span>
        <h1>{title}</h1>
        {locale !== 'es' && (
          <p className="legal-note" lang={locale}>
            {intl.formatMessage(M.legalSpanishOnly)}
          </p>
        )}

        {doc === 'terms' && TERMS.map((b, i) => <LegalBlock key={i} block={b} />)}

        {doc === 'privacy' && (
          <>
            {PRIVACY.map((b, i) => (
              <LegalBlock key={i} block={b} />
            ))}
            <p className="legal-closing">{PRIVACY_CLOSING}</p>
          </>
        )}

        {doc === 'regret' && (
          <>
            <LegalBlock block={REGRET} />
            <RegretForm />
          </>
        )}
      </main>

      <footer className="legal-foot">
        <LegalLinks />
        <span className="finale-fine">
          <FormattedMessage {...M.finaleFine} />
        </span>
      </footer>
    </div>
  )
}

function MailLink() {
  return <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
}

function LegalBlock({ block }: { block: Block }) {
  const parts = block.p.split('{email}')
  return (
    <section className="legal-block">
      {block.h && <h2>{block.h}</h2>}
      <p>
        {parts.map((s, i) => (
          <Fragment key={i}>
            {i > 0 && <MailLink />}
            {s}
          </Fragment>
        ))}
      </p>
    </section>
  )
}

// the request reaches the Growcast inbox in Spanish, whatever the page language
const SUBJECT = 'Botón de arrepentimiento — Revocación de compra'

/**
 * A static site cannot send mail, so the form composes the request the clause
 * asks for (intent to return, bank details or voucher) and opens the visitor's
 * mail app addressed to LEGAL_EMAIL.
 */
function RegretForm() {
  const t = useIntl().formatMessage
  const [refund, setRefund] = useState<'bank' | 'voucher'>('bank')

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const v = (k: string) => String(form.get(k) ?? '').trim()
    const lines = [
      'Solicito revocar la compra (botón de arrepentimiento).',
      '',
      `Nombre y apellido: ${v('name')}`,
      `Email: ${v('email')}`,
    ]
    if (v('phone')) lines.push(`Teléfono: ${v('phone')}`)
    lines.push(`N.º de factura o de serie del producto: ${v('invoice')}`)
    lines.push(
      refund === 'bank'
        ? `Reintegro: devolución a mi cuenta bancaria — ${v('bank')}`
        : 'Reintegro: voucher por el valor del reembolso',
    )
    if (v('notes')) lines.push('', `Comentarios: ${v('notes')}`)
    window.location.href = `mailto:${LEGAL_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(lines.join('\n'))}`
  }

  return (
    <form className="legal-form" onSubmit={submit}>
      <h2>{t(M.regretFormTitle)}</h2>
      <p className="legal-form-sub">
        <FormattedMessage {...M.regretFormSub} values={{ email: <MailLink /> }} />
      </p>

      <label className="dialog-field">
        <span>{t(M.regretName)}</span>
        <input name="name" required maxLength={120} autoComplete="name" />
      </label>
      <div className="legal-grid">
        <label className="dialog-field">
          <span>{t(M.regretEmail)}</span>
          <input name="email" type="email" required maxLength={160} autoComplete="email" />
        </label>
        <label className="dialog-field">
          <span>{t(M.regretPhone)}</span>
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" />
        </label>
      </div>
      <label className="dialog-field">
        <span>{t(M.regretInvoice)}</span>
        <input name="invoice" required maxLength={80} />
      </label>

      <fieldset className="legal-radios">
        <legend>{t(M.regretRefund)}</legend>
        <label>
          <input type="radio" name="refund" checked={refund === 'bank'} onChange={() => setRefund('bank')} />
          {t(M.regretRefundBank)}
        </label>
        <label>
          <input type="radio" name="refund" checked={refund === 'voucher'} onChange={() => setRefund('voucher')} />
          {t(M.regretRefundVoucher)}
        </label>
      </fieldset>
      {refund === 'bank' && (
        <label className="dialog-field">
          <span>{t(M.regretBank)}</span>
          <input name="bank" required maxLength={80} />
        </label>
      )}

      <label className="dialog-field">
        <span>{t(M.regretNotes)}</span>
        <textarea name="notes" rows={3} maxLength={1000} />
      </label>

      <button type="submit" className="cta dialog-send">
        <span className="cta-label">{t(M.regretSend)}</span>
      </button>
    </form>
  )
}
