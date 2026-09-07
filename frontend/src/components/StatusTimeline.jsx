import { useTranslation } from 'react-i18next'

const statusKeys = ['submitted', 'verified', 'assigned', 'in_progress', 'resolved']

export default function StatusTimeline({ timeline = [] }) {
  const { t } = useTranslation()
  const trackMap = new Map(timeline.map((step) => [step.status, step]))

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="space-y-4">
        {statusKeys.map((key, index) => {
          const step = trackMap.get(key)
          const isComplete = step?.completed
          const firstPendingIndex = statusKeys.findIndex((k) => !timeline.some((s) => s.status === k && s.completed))
          const isCurrent = !isComplete && index === firstPendingIndex

          return (
            <div key={key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                    isComplete
                      ? 'scale-105 border-emerald-500 bg-emerald-500 text-white'
                      : isCurrent
                        ? 'border-amber-500 bg-amber-100 text-amber-700'
                        : 'border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-700'
                  }`}
                >
                  {isComplete ? '✓' : isCurrent ? '●' : '○'}
                </div>
                {index < statusKeys.length - 1 && <div className="mt-1 h-8 w-px bg-slate-200 dark:bg-slate-700" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t(`timeline.${key}`)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{step?.time || t('timeline.pending')}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
