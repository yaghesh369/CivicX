import { useTranslation } from 'react-i18next'
import { useCivicContext } from '../context/CivicContext'
import Notification from '../components/Notification'
import { markAllNotificationsReadApi, markNotificationReadApi } from '../services/api'

export default function Notifications() {
  const { t } = useTranslation()
  const { notifications, setNotifications } = useCivicContext()

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    try {
      await markAllNotificationsReadApi()
    } catch {
      // best-effort; local state already updated
    }
  }

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
    try {
      await markNotificationReadApi(id)
    } catch {
      // best-effort; local state already updated
    }
  }

  const stats = [
    { label: t('notifications.total'), count: notifications.length, icon: '📬' },
    { label: t('notifications.unread'), count: notifications.filter((n) => !n.read).length, icon: '📭' },
    { label: t('notifications.read'), count: notifications.filter((n) => n.read).length, icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-emerald-50 px-4 py-8 sm:px-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="animate-fadeInUp mb-10">
          <div className="text-sm font-semibold text-violet-600 dark:text-violet-400">{t('notifications.stayUpdated')}</div>
          <h1 className="mt-2 text-4xl font-black text-slate-900 dark:text-white">{t('notifications.title')}</h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{t('notifications.subtitle')}</p>
        </div>

        {/* Notification Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="animate-fadeInUp rounded-2xl border border-slate-200/50 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stat.count}</div>
            </div>
          ))}
        </div>

        {/* Mark all read */}
        {notifications.some((n) => !n.read) && (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={markAllRead}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {t('notifications.markAllRead')}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((item, i) => (
              <div key={item.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 70}ms` }}>
                <Notification notification={item} onMarkRead={markAsRead} />
              </div>
            ))
          ) : (
            <div className="animate-popIn rounded-4xl border-2 border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-600 dark:bg-slate-800">
              <div className="animate-float inline-block text-5xl">🔕</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{t('notifications.none')}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{t('notifications.noneSub')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
