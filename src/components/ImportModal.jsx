import { useRef, useState } from 'react'
import Modal from './Modal.jsx'
import { useContacts } from '../context/ContactContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { parseImport } from '../utils/exportUtils'
import { findDuplicateContact } from '../utils/contactUtils'
import { HiOutlineArrowUpTray, HiOutlineDocumentArrowUp, HiOutlineExclamationTriangle } from 'react-icons/hi2'

/**
 * Import contacts from a JSON or CSV file.
 * Flow: pick file → parse & validate → preview (valid / invalid / duplicates)
 *       → choose how to handle duplicates → import.
 */
export default function ImportModal({ open, onClose }) {
  const { contacts, importContacts } = useContacts()
  const toast = useToast()
  const fileRef = useRef(null)
  const [stage, setStage] = useState('pick') // pick | reviewing | importing
  const [fileName, setFileName] = useState('')
  const [report, setReport] = useState(null) // { valid, invalid, duplicates }
  const [dupPolicy, setDupPolicy] = useState('skip')
  const [parseError, setParseError] = useState('')

  const reset = () => {
    setStage('pick'); setFileName(''); setReport(null); setParseError(''); setDupPolicy('skip')
  }
  const close = () => { reset(); onClose() }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setFileName(file.name)
    const text = await file.text()
    const parsed = parseImport(text, file.name)
    if (parsed.error) {
      setParseError(parsed.error)
      setReport(null)
      setStage('reviewing')
      return
    }
    const duplicates = parsed.valid.filter((c) => findDuplicateContact(contacts, c))
    setReport({ ...parsed, duplicates })
    setParseError('')
    setStage('reviewing')
  }

  const doImport = () => {
    setStage('importing')
    setTimeout(() => {
      const nonDupValid = report.valid
      const { imported, skipped } = importContacts(nonDupValid, dupPolicy)
      toast.success(
        `Import complete — ${imported} contact${imported === 1 ? '' : 's'} imported${skipped ? `, ${skipped} duplicate${skipped === 1 ? '' : 's'} skipped` : ''}.`
      )
      close()
    }, 400)
  }

  return (
    <Modal open={open} onClose={close} title="Import contacts" wide>
      <input ref={fileRef} type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={onFile} aria-hidden="true" />

      {stage === 'pick' && (
        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 px-6 py-12 text-center transition hover:border-ocean hover:bg-ocean/5 dark:border-slate-600"
        >
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean/10 text-ocean">
            <HiOutlineDocumentArrowUp className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">Choose a JSON or CSV file</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Fields like name, email, phone, company, jobTitle, website, tags, group are recognized.
            </p>
          </div>
        </button>
      )}

      {stage === 'reviewing' && (
        <div className="space-y-4">
          {parseError ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
              <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">Couldn't read “{fileName}”</p>
                <p className="mt-0.5">{parseError}</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reviewing <span className="font-semibold text-slate-800 dark:text-slate-100">{fileName}</span></p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-teal/10 p-3.5">
                  <p className="font-display text-2xl font-bold text-teal">{report.valid.length}</p>
                  <p className="text-xs font-medium text-slate-500">Valid contacts</p>
                </div>
                <div className="rounded-xl bg-gold/15 p-3.5">
                  <p className="font-display text-2xl font-bold text-gold-dark dark:text-gold">{report.duplicates.length}</p>
                  <p className="text-xs font-medium text-slate-500">Duplicates</p>
                </div>
                <div className="rounded-xl bg-red-500/10 p-3.5">
                  <p className="font-display text-2xl font-bold text-red-500">{report.invalid.length}</p>
                  <p className="text-xs font-medium text-slate-500">Invalid rows</p>
                </div>
              </div>

              {report.duplicates.length > 0 && (
                <div className="rounded-xl border border-gold/40 bg-gold/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-gold-dark dark:text-gold">
                    <HiOutlineExclamationTriangle className="h-4 w-4" aria-hidden="true" />
                    Possible duplicates found
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {report.duplicates.slice(0, 4).map((d) => d.name).join(', ')}
                    {report.duplicates.length > 4 && ` and ${report.duplicates.length - 4} more`} already exist by email or phone.
                  </p>
                  <div className="mt-3 space-y-1.5 text-sm">
                    {[
                      ['skip', 'Skip duplicates — only import new contacts'],
                      ['keep', 'Keep both — import everything anyway'],
                      ['replace', 'Replace existing contacts with imported ones'],
                    ].map(([value, label]) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2.5 text-slate-700 dark:text-slate-200">
                        <input type="radio" name="dup-policy" checked={dupPolicy === value} onChange={() => setDupPolicy(value)} className="h-4 w-4 accent-ocean" />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {report.invalid.length > 0 && (
                <details className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700">
                  <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">
                    {report.invalid.length} invalid entr{report.invalid.length === 1 ? 'y' : 'ies'} (will be skipped)
                  </summary>
                  <ul className="nice-scroll mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-500">
                    {report.invalid.map((inv, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span className="truncate">{inv.row}</span>
                        <span className="shrink-0 text-red-500">{inv.reason}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button onClick={() => fileRef.current?.click()} className="btn-ghost">Choose another file</button>
            {!parseError && (
              <button onClick={doImport} disabled={report.valid.length === 0} className="btn-primary">
                <HiOutlineArrowUpTray className="h-4 w-4" aria-hidden="true" />
                Import {report.valid.length > 0 ? report.valid.length : ''} contact{report.valid.length === 1 ? '' : 's'}
              </button>
            )}
          </div>
        </div>
      )}

      {stage === 'importing' && (
        <div className="flex flex-col items-center gap-4 py-10" role="status">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-ocean/20 border-t-ocean" />
          <p className="text-sm font-medium text-slate-500">Importing contacts…</p>
        </div>
      )}
    </Modal>
  )
}
