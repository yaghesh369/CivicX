import { useTranslation } from 'react-i18next'
import usePwaRegister from '../hooks/usePwaRegister'

export default function SwUpdateBanner() {
  const { t } = useTranslation()
  const { needRefresh, offlineReady, updateSW } = usePwaRegister()

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <p className="text-sm text-slate-700 dark:text-slate-200">
        {needRefresh ? t('pwaUpdate.newVersion') : t('pwaUpdate.offlineReady')}
      </p>
      {needRefresh ? (
        <button
          type="button"
          onClick={updateSW}
          className="shrink-0 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          {t('pwaUpdate.reload')}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          {t('pwaUpdate.ok')}
        </button>
      )}
    </div>
  )
}
