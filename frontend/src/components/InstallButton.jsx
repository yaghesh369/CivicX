import { useTranslation } from 'react-i18next'
import usePwaInstall from '../hooks/usePwaInstall'

export default function InstallButton({ variant = 'navbar' }) {
  const { t } = useTranslation()
  const {
    canInstall,
    isInstalled,
    hasPrompt,
    platform,
    isInAppBrowser,
    promptInstall,
    openHelp,
    closeHelp,
    helpOpen,
  } = usePwaInstall()

  if (isInstalled || !canInstall) return null
  if (isInAppBrowser()) return null

  const handleClick = () => {
    if (hasPrompt) {
      promptInstall()
    } else {
      openHelp()
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={buttonClass(variant)}>
        <span>📲</span> {t('pwa.install')}
      </button>

      {helpOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center"
          onClick={closeHelp}
        >
          <div
            className="animate-fadeInUp max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('pwa.helpTitle')}</h3>
              <button
                type="button"
                onClick={closeHelp}
                aria-label="Close"
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-500 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t(`pwa.help.${platform}`)}</p>
            <button
              type="button"
              onClick={closeHelp}
              className="mt-5 w-full rounded-2xl bg-slate-900 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function buttonClass(variant) {
  if (variant === 'float') {
    return 'animate-popIn flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-linear-to-r from-emerald-500 to-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-2xl shadow-sky-500/40 ring-1 ring-white/40 transition hover:scale-105 dark:ring-white/20'
  }
  if (variant === 'hero') {
    return 'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition hover:border-slate-500 hover:bg-slate-700/50'
  }
  if (variant === 'dark') {
    return 'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:scale-[1.02] hover:bg-white/20'
  }
  return 'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:scale-[1.02] hover:bg-emerald-600'
}