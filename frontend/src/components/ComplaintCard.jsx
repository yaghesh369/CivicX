import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const statusStyles = {
  submitted: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  verified: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  citizen_verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  reopened: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  assigned: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
}

const priorityStyles = {
  High: 'text-red-600 dark:text-red-400',
  Medium: 'text-amber-600 dark:text-amber-400',
  Low: 'text-emerald-600 dark:text-emerald-400',
}

export default function ComplaintCard({ complaint }) {
  const { t } = useTranslation()

  const categoryEmojis = {
    'Pothole': '🚧',
    'Garbage': '🗑',
    'Water': '💧',
    'Streetlight': '💡',
    'Road': '🛣',
    'Waste': '🗑',
    'Lighting': '💡',
  }

  const done = complaint.timeline?.filter((item) => item.completed).length || 0
  const total = complaint.timeline?.length || 0
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Link
      to={`/complaints/${complaint.id}`}
      className="group block overflow-hidden rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl dark:border-slate-700/50 dark:from-slate-800 dark:to-slate-900/50"
    >
      {/* Header with image and status */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-400 to-emerald-400 pb-40">
        <img
          src={complaint.image}
          alt={complaint.title}
          className="h-full w-full object-cover opacity-40 transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute right-4 top-4">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusStyles[complaint.status]}`}>
            {t(`status.${complaint.status}`)}
          </span>
        </div>

        {/* Priority indicator */}
        <div className="absolute left-4 top-4">
          <div className={`flex items-center gap-1 text-sm font-bold ${priorityStyles[complaint.priority] || priorityStyles.Medium}`}>
            ⭐ {complaint.priority}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* ID and Icon */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {complaint.complaintNumber || complaint.id}
          </div>
          <div className="text-2xl transition duration-300 group-hover:scale-110">{categoryEmojis[complaint.category] || '📌'}</div>
        </div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">{complaint.title}</h3>

        {/* Category and Department */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
            {complaint.category}
          </span>
          {complaint.department ? (
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {complaint.department}
            </span>
          ) : null}
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{complaint.description}</p>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-1.5 rounded-full bg-linear-to-r from-sky-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-medium">
            {done}/{total}
          </span>
        </div>
      </div>
    </Link>
  )
}
