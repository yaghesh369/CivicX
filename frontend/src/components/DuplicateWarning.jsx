import { useTranslation } from 'react-i18next'

export default function DuplicateWarning({ complaint, onSupport, onNew }) {
  const { t } = useTranslation()

  if (!complaint) return null

  return (
    <div className="animate-fadeInUp rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
      <div className="mb-3 flex items-center gap-2">
        <div className="text-2xl">⚠</div>
        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300">{t('duplicate.title')}</h3>
      </div>

      <div className="rounded-2xl bg-white p-3 dark:bg-slate-800">
        <div className="text-sm font-bold text-slate-900 dark:text-white">{complaint.id}</div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{complaint.title}</div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('duplicate.status')}:{' '}
          <span className="font-semibold text-amber-700 dark:text-amber-400">{t('duplicate.inProgress')}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={onSupport}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {t('duplicate.supportExisting')}
        </button>
        <button
          onClick={onNew}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          {t('duplicate.createNew')}
        </button>
      </div>
    </div>
  )
}
