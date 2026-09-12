import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import StatusTimeline from '../components/StatusTimeline'
import { getComplaintApi, reopenComplaintApi, submitFeedbackApi } from '../services/api'

export default function ComplaintDetails() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [resolutionState, setResolutionState] = useState('pending')
  const [reason, setReason] = useState('')
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchComplaint() {
      try {
        const response = await getComplaintApi(id)
        setComplaint(response.complaint)
      } catch (requestError) {
        setError(requestError.response?.data?.error || t('details.loadError', { defaultValue: 'Unable to load this complaint.' }))
      } finally {
        setLoading(false)
      }
    }

    fetchComplaint()
  }, [id, t])

  const handleVerify = (verified) => {
    if (!verified) {
      setResolutionState('reopened')
      return
    }
    setResolutionState('verified')
  }

  const handleReopen = async () => {
    setError('')
    try {
      await reopenComplaintApi({ id, reason })
      setResolutionState('reopened')
    } catch (e) {
      setError(e.response?.data?.error || t('details.reopenError'))
    }
  }

  const handleFeedbackSubmit = async () => {
    setError('')
    if (!rating) {
      setError(t('details.selectRating'))
      return
    }
    try {
      await submitFeedbackApi({ id, rating, comment: feedbackText })
      setResolutionState('feedback-submitted')
    } catch (e) {
      setError(e.response?.data?.error || t('details.feedbackError'))
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500 dark:text-slate-400">
        {t('details.loading')}
      </div>
    )
  }

  if (!complaint) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-rose-600 dark:text-rose-400">{error}</div>
  }

  const statusLabel = complaint.status === 'in_progress' ? t('status.in_progress') : t(`status.${complaint.status}`)

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-emerald-50 px-4 py-6 sm:px-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="animate-fadeInUp rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">
                {complaint.complaintNumber || complaint.id}
              </div>
              <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{complaint.title}</h1>
            </div>
            <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {statusLabel}
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {complaint.image ? (
                <img
                  src={complaint.image}
                  alt={complaint.title}
                  className="h-72 w-full rounded-[28px] object-cover transition duration-300 hover:scale-[1.01]"
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center rounded-[28px] bg-linear-to-br from-sky-400 to-emerald-400 text-7xl" aria-hidden="true">
                  {complaint.categoryEmoji || '📌'}
                </div>
              )}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {t('details.description')}
                </div>
                <p className="text-base text-slate-700 dark:text-slate-300">{complaint.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {t('details.location')}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  {t('report.lat')}: {complaint.location?.lat ?? '19.076'}
                  <br />
                  {t('report.lng')}: {complaint.location?.lng ?? '72.8777'}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {t('details.status')}
                </div>
                <StatusTimeline timeline={complaint.timeline || []} />
              </div>
            </div>
          </div>

          {complaint.status === 'resolved' && (
            <div className="mt-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 sm:p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
              {error && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}
              {resolutionState === 'pending' && (
                <div className="animate-fadeInUp">
                  <div className="mb-4 text-lg font-black text-slate-900 dark:text-white">{t('details.wasFixed')}</div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVerify(true)}
                      className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-emerald-700 hover:shadow-lg"
                    >
                      {t('details.yes')}
                    </button>
                    <button
                      onClick={() => handleVerify(false)}
                      className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-rose-700 hover:shadow-lg"
                    >
                      {t('details.no')}
                    </button>
                  </div>
                </div>
              )}

              {resolutionState === 'reopened' && (
                <div className="animate-fadeInUp space-y-3">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{t('details.whyNotFixed')}</div>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-rose-500"
                    rows="3"
                    placeholder={t('details.reasonPlaceholder')}
                  />
                  <button
                    onClick={handleReopen}
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    {t('details.reopen')}
                  </button>
                </div>
              )}

              {resolutionState === 'verified' && (
                <div className="animate-fadeInUp space-y-4">
                  <div className="text-lg font-black text-slate-900 dark:text-white">{t('details.rateResolution')}</div>
                  <div className="flex gap-2 text-3xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition duration-200 hover:scale-125 ${
                          star <= rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedbackText}
                    onChange={(event) => setFeedbackText(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-emerald-500"
                    rows="3"
                    placeholder={t('details.feedbackPlaceholder')}
                  />
                  <button
                    onClick={handleFeedbackSubmit}
                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-emerald-700 hover:shadow-lg"
                  >
                    {t('details.submitFeedback')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
