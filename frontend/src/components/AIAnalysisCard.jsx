import { useTranslation } from 'react-i18next'

export default function AIAnalysisCard({ analysis }) {
  const { t } = useTranslation()

  if (!analysis) return null

  const items = [
    { label: t('ai.category'), value: analysis.category },
    { label: t('ai.department'), value: analysis.department },
    { label: t('ai.priority'), value: analysis.priority },
    { label: t('ai.confidence'), value: `${analysis.confidence}%` },
  ]

  return (
    <div className="rounded-3xl border border-sky-200 bg-sky-50 p-4 shadow-sm dark:border-sky-800 dark:bg-sky-900/20">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-lg text-white">🤖</div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('ai.title')}</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-3 dark:bg-slate-800">
            <div className="text-slate-500 dark:text-slate-400">{item.label}</div>
            <div className="mt-1 font-bold text-slate-900 dark:text-white">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
