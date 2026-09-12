import { useTranslation } from 'react-i18next'
import { useCivicContext } from '../context/CivicContext'
import { Link } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher'
import InstallButton from '../components/InstallButton'

export default function Profile() {
  const { t } = useTranslation()
  const { user, complaints, logout } = useCivicContext()

  const resolved = complaints.filter((item) => item.status === 'resolved' || item.status === 'citizen_verified').length
  const active = complaints.filter((item) => item.status !== 'resolved' && item.status !== 'citizen_verified').length

  const resolvedComplaints = complaints.filter(
    (item) => (item.status === 'resolved' || item.status === 'citizen_verified') && item.createdAt && item.resolvedAt,
  )
  const avgResolveHours = (() => {
    if (resolvedComplaints.length === 0) return null
    const totalMs = resolvedComplaints.reduce((sum, item) => {
      const start = new Date(item.createdAt).getTime()
      const end = new Date(item.resolvedAt).getTime()
      return sum + (end - start)
    }, 0)
    return Math.max(1, Math.round((totalMs / resolvedComplaints.length) / (1000 * 60 * 60)))
  })()

  const handleLogout = () => {
    logout()
  }

  const total = complaints.length
  const resolveRate = total > 0 ? (resolved / total) * 100 : 0

  const achievements = [
    {
      icon: '🌟',
      label: t('profile.ach1Label'),
      desc: t('profile.ach1Desc'),
      earned: total >= 1,
      progress: `${Math.min(total, 1)}/1`,
    },
    {
      icon: '⚡',
      label: t('profile.ach2Label'),
      desc: t('profile.ach2Desc'),
      earned: total >= 5,
      progress: `${Math.min(total, 5)}/5`,
    },
    {
      icon: '🏆',
      label: t('profile.ach3Label'),
      desc: t('profile.ach3Desc'),
      earned: total >= 10,
      progress: `${Math.min(total, 10)}/10`,
    },
    {
      icon: '✅',
      label: t('profile.ach4Label'),
      desc: t('profile.ach4Desc'),
      earned: resolved >= 1 && resolveRate >= 50,
      progress: `${Math.round(resolveRate)}%`,
    },
  ]

  const stats = [
    { icon: '📋', label: t('profile.totalIssues'), value: total, sub: `${t('profile.since')} ${user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : t('profile.sinceUnknown')}` },
    { icon: '⏳', label: t('profile.inProgress'), value: active, sub: t('profile.awaitingResolution') },
    { icon: '✅', label: t('profile.resolved'), value: resolved, sub: `${Math.round(resolveRate) || 0}% ${t('profile.completion')}` },
    { icon: '⚡', label: t('profile.avgResolution'), value: avgResolveHours ? `${avgResolveHours}h` : '—', sub: t('profile.timeToResolve') },
  ]

  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Citizen'

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-emerald-50 px-4 py-8 sm:px-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-5xl">
        {/* Profile Header */}
        <div className="animate-popIn mb-8 overflow-hidden rounded-4xl bg-linear-to-br from-violet-500 to-sky-500 p-8 text-white shadow-2xl shadow-violet-500/30 sm:p-10">
          <div className="relative">
            <div className="animate-float absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-4xl font-black backdrop-blur-sm transition duration-300 hover:scale-105">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-violet-100">{t('profile.welcomeBack', { name: firstName })}</div>
                <h1 className="mt-1 text-4xl font-black">{user?.name || 'Citizen User'}</h1>
                <p className="mt-1 text-violet-100">{user?.email || 'citizen@example.com'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="animate-fadeInUp rounded-3xl border border-slate-200/50 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/50"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="mb-3 text-3xl">{stat.icon}</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
              <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Settings card with language */}
        <div className="mb-8 rounded-3xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50">
          <h2 className="mb-4 text-2xl font-black text-slate-900 dark:text-white">{t('profile.settings')}</h2>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-xl dark:bg-sky-900/40">🌐</div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{t('profile.language')}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('common.language')}</div>
              </div>
            </div>
            <LanguageSwitcher variant="dropdown" align="right" />
          </div>
          <div className="my-5 border-t border-slate-200/60 dark:border-slate-700/60" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-xl dark:bg-emerald-900/40">📲</div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{t('profile.installApp')}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{t('pwa.installSub')}</div>
              </div>
            </div>
            <InstallButton />
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-black text-slate-900 dark:text-white">{t('profile.achievements')} 🏅</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement, idx) => (
              <div
                key={idx}
                className={`animate-fadeInUp rounded-3xl border p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  achievement.earned
                    ? 'border-amber-200/70 bg-linear-to-br from-white to-amber-50 shadow-amber-100 dark:border-amber-500/30 dark:from-slate-800 dark:to-amber-900/20'
                    : 'border-slate-200/50 bg-white dark:border-slate-700/50 dark:bg-slate-800/50'
                }`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="relative mb-3 inline-block text-4xl">
                  <span className={`inline-block transition duration-300 hover:scale-125 ${achievement.earned ? '' : 'opacity-40 grayscale'}`}>{achievement.icon}</span>
                  {!achievement.earned && (
                    <span className="absolute -right-3 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-sm dark:bg-slate-600" title={t('profile.locked')}>
                      🔒
                    </span>
                  )}
                </div>
                <h3 className={`font-bold ${achievement.earned ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{achievement.label}</h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{achievement.desc}</p>
                <p className={`mt-3 text-xs font-semibold ${achievement.earned ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {achievement.earned ? t('profile.earned') : `${t('profile.progress')} ${achievement.progress}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/report"
            className="group flex items-center justify-center gap-2 rounded-3xl bg-sky-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="inline-block transition-transform duration-300 group-hover:rotate-90">+</span> {t('profile.reportNew')}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-3xl border-2 border-red-500 px-6 py-4 text-lg font-bold text-red-500 transition duration-300 hover:-translate-y-0.5 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span>🚪</span> {t('profile.signOut')}
          </button>
        </div>
      </div>
    </div>
  )
}
