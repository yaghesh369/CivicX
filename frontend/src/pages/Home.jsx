import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCivicContext } from '../context/CivicContext'
import ComplaintCard from '../components/ComplaintCard'

const issueTypes = [
  { key: 'road', emoji: '🚧' },
  { key: 'garbage', emoji: '🗑' },
  { key: 'water', emoji: '💧' },
  { key: 'streetlight', emoji: '💡' },
]

export default function Home() {
  const { t } = useTranslation()
  const { user, complaints } = useCivicContext()

  const stats = [
    { icon: '✅', label: t('home.resolvedLabel'), value: complaints.filter((c) => c.status === 'resolved').length, color: 'text-emerald-500' },
    { icon: '⏳', label: t('home.inProgressLabel'), value: complaints.filter((c) => c.status === 'in_progress').length, color: 'text-amber-500' },
    { icon: '📋', label: t('home.totalLabel'), value: complaints.length, color: 'text-sky-500' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-emerald-50 px-4 py-8 sm:px-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="animate-fadeInUp mb-8">
          <div className="text-sm font-semibold text-sky-600 dark:text-sky-400">
            {t('home.welcomeBack')}
            {user?.name?.split(' ')[0] || 'Citizen'}! 👋
          </div>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('home.makeCommunityBetter')}{' '}
            <span className="bg-linear-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
              {t('home.communityBetter')}
            </span>
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{t('home.homeSubtitle')}</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="animate-fadeInUp rounded-3xl border border-slate-200/50 bg-white p-6 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
                  <div className={`mt-2 text-3xl font-black ${stat.color}`}>{stat.value}</div>
                </div>
                <div className="text-3xl transition duration-300 hover:scale-110">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Report Section */}
        <section className="relative mb-8 overflow-hidden rounded-4xl bg-linear-to-br from-sky-500 via-cyan-500 to-emerald-500 p-8 text-white shadow-2xl shadow-sky-500/30 sm:p-10">
          <div className="animate-float absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight">{t('home.reportPrompt')}</h2>
              <p className="mt-2 text-sky-100">{t('home.quickReportSubtitle')}</p>
            </div>

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {issueTypes.map((issue, i) => (
                <Link
                  key={issue.key}
                  to="/report"
                  className="group animate-fadeInUp rounded-3xl border-2 border-white/30 bg-white/10 p-6 text-center backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/50 hover:bg-white/20"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-5xl transition duration-300 group-hover:scale-125 group-hover:rotate-6">
                    {issue.emoji}
                  </div>
                  <div className="mt-3 text-sm font-bold">{t(`issueTypes.${issue.key}`)}</div>
                </Link>
              ))}
            </div>

            <Link
              to="/report"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-base font-bold text-sky-600 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="font-black transition-transform duration-300 group-hover:rotate-90">+</span> {t('home.reportNew')}
            </Link>
          </div>
        </section>

        {/* My Complaints Section */}
        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('home.myComplaints')}</h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">{t('home.tracking')}</p>
            </div>
            <Link
              to="/complaints"
              className="group rounded-full bg-sky-500 px-4 py-2 text-sm font-bold text-white transition duration-300 hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/30"
            >
              {t('home.viewAll')} <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {complaints.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {complaints.slice(0, 6).map((complaint, i) => (
                <div key={complaint.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 80}ms` }}>
                  <ComplaintCard complaint={complaint} />
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-popIn rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-800">
              <div className="animate-float inline-block text-5xl">📝</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{t('home.noComplaints')}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{t('home.noComplaintsSub')}</p>
              <Link
                to="/report"
                className="mt-6 inline-block rounded-2xl bg-sky-500 px-6 py-2 font-bold text-white transition duration-300 hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/30"
              >
                {t('home.reportNow')}
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
