import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCivicContext } from '../context/CivicContext'
import ComplaintCard from '../components/ComplaintCard'

const filters = [
  { value: 'all', icon: '📋' },
  { value: 'submitted', icon: '📤' },
  { value: 'in_progress', icon: '⏳' },
  { value: 'resolved', icon: '✅' },
]

export default function Complaints() {
  const { t } = useTranslation()
  const { complaints } = useCivicContext()
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredComplaints =
    activeFilter === 'all'
      ? complaints
      : complaints.filter((item) => item.status === activeFilter)

  const labels = {
    all: t('complaints.allIssues'),
    submitted: t('complaints.submitted'),
    in_progress: t('complaints.inProgress'),
    resolved: t('complaints.resolved'),
  }

  const stats = [
    { label: t('complaints.total'), count: complaints.length, icon: '📋' },
    { label: t('complaints.submitted'), count: complaints.filter((c) => c.status === 'submitted').length, icon: '📤' },
    { label: t('complaints.inProgress'), count: complaints.filter((c) => c.status === 'in_progress').length, icon: '⏳' },
    { label: t('complaints.resolved'), count: complaints.filter((c) => c.status === 'resolved').length, icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-emerald-50 px-4 py-8 sm:px-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="animate-fadeInUp mb-10">
          <div className="text-sm font-semibold text-sky-600 dark:text-sky-400">{t('complaints.manageTrack')}</div>
          <h1 className="mt-2 text-4xl font-black text-slate-900 dark:text-white">
            {t('complaints.title')}{' '}
            <span className="bg-linear-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
              {t('complaints.titleHighlight')}
            </span>
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{t('complaints.subtitle')}</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition duration-300 ${
                activeFilter === filter.value
                  ? 'bg-linear-to-r from-sky-500 to-emerald-500 text-white shadow-lg shadow-sky-500/30'
                  : 'border border-slate-200/50 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <span>{filter.icon}</span>
              {labels[filter.value]}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="animate-fadeInUp rounded-2xl border border-slate-200/50 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stat.count}</div>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Complaints Grid */}
        {filteredComplaints.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredComplaints.map((complaint, i) => (
              <div key={complaint.id} className="animate-fadeInUp" style={{ animationDelay: `${(i % 6) * 70}ms` }}>
                <ComplaintCard complaint={complaint} />
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-popIn rounded-4xl border-2 border-dashed border-slate-300 bg-white p-16 text-center dark:border-slate-600 dark:bg-slate-800">
            <div className="animate-float inline-block text-5xl">📭</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{t('complaints.noIssues')}</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{t('complaints.noIssuesSub')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
