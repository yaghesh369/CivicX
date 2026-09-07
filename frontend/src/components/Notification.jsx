import { useTranslation } from 'react-i18next'

const typeStyles = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: '✅',
    color: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: '⚠️',
    color: 'text-amber-700 dark:text-amber-300',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-900/30',
    border: 'border-sky-200 dark:border-sky-800',
    icon: 'ℹ️',
    color: 'text-sky-700 dark:text-sky-300',
  },
}

export default function Notification({ notification, onMarkRead }) {
  const { t } = useTranslation()
  const style = typeStyles[notification.type] || typeStyles.info

  return (
    <div
      className={`group cursor-pointer rounded-3xl border-2 p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${style.bg} ${style.border}`}
      onClick={() => onMarkRead?.(notification.id)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 text-3xl transition duration-300 group-hover:scale-110">{style.icon}</div>
        <div className="flex-1">
          <p className={`font-semibold ${style.color}`}>{notification.text}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {notification.read ? `✓ ${t('notifications.readStatus')}` : `• ${t('notifications.unreadStatus')}`}
          </p>
        </div>
        {!notification.read && (
          <div className="mt-2 h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
        )}
      </div>
    </div>
  )
}
