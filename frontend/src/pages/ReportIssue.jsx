import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createComplaintApi, getAIAnalysisApi, uploadComplaintImageApi, getNearbyComplaintsApi, saveAIAnalysisApi } from '../services/api'
import AIAnalysisCard from '../components/AIAnalysisCard'
import DuplicateWarning from '../components/DuplicateWarning'
import MapPicker from '../components/MapPicker'
import ImageUploader from '../components/ImageUploader'
import { useCivicContext } from '../context/CivicContext'

const issueTemplates = [
  { label: 'Pothole', value: 'pothole', emoji: '🚧' },
  { label: 'Garbage', value: 'garbage', emoji: '🗑' },
  { label: 'Water Leak', value: 'water', emoji: '💧' },
  { label: 'Streetlight', value: 'streetlight', emoji: '💡' },
  { label: 'Road Damage', value: 'road', emoji: '🛣' },
  { label: 'Drainage', value: 'drainage', emoji: '🚰' },
  { label: 'Illegal Dumping', value: 'illegal_dumping', emoji: '🗑' },
  { label: 'Other', value: 'other', emoji: '📌' },
]

export default function ReportIssue() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { addComplaint, addDraft } = useCivicContext()
  const [selectedImage, setSelectedImage] = useState('')
  const [compressedFile, setCompressedFile] = useState(null)
  const [gpsError, setGpsError] = useState('')
  const [markerPosition, setMarkerPosition] = useState([19.076, 72.8777])
  const [analysis, setAnalysis] = useState(null)
  const [duplicate, setDuplicate] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [complaintId, setComplaintId] = useState('')
  const [offlineNotice, setOfflineNotice] = useState('')
  const [recording, setRecording] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const [error, setError] = useState('')

  const { register, handleSubmit, control, setValue } = useForm({
    defaultValues: {
      description: '',
      category: 'pothole',
    },
  })

  const watchDescription = useWatch({ control, name: 'description' })
  const watchCategory = useWatch({ control, name: 'category' })

  const formattedLocation = useMemo(() => ({ lat: markerPosition[0], lng: markerPosition[1] }), [markerPosition])

  const categoryLabel = (value) => t(`report.templates.${value}`) || value

  const handleImageChange = (image, file) => {
    setSelectedImage(image)
    setCompressedFile(file)
  }

  const handleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechError(t('report.voiceNotSupported'))
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setRecording(true)
      setSpeechError('')
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setValue('description', transcript, { shouldValidate: true })
    }
    recognition.onerror = (event) => {
      setSpeechError(event.error === 'not-allowed' ? t('report.microphoneDenied') : `${t('report.voiceError')}: ${event.error}`)
    }
    recognition.onend = () => setRecording(false)

    recognition.start()
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError(t('report.geoNotSupported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition = [position.coords.latitude, position.coords.longitude]
        setMarkerPosition(nextPosition)
        setGpsError('')
      },
      () => {
        setGpsError(t('report.geoDenied'))
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleAiAnalysis = async () => {
    const result = await getAIAnalysisApi({ description: watchDescription, category: watchCategory })
    setAnalysis(result.result)

    try {
      const backendCategory = { pothole: 'POTHOLE', road: 'ROAD', garbage: 'GARBAGE', water: 'WATER_LEAKAGE', streetlight: 'STREETLIGHT', drainage: 'DRAINAGE', illegal_dumping: 'ILLEGAL_DUMPING', public_property_damage: 'PUBLIC_PROPERTY_DAMAGE', other: 'OTHER' }[watchCategory]
      const nearby = await getNearbyComplaintsApi({
        latitude: formattedLocation.lat,
        longitude: formattedLocation.lng,
        category: backendCategory,
        radiusKm: 1,
      })
      if (Array.isArray(nearby) && nearby.length > 0) {
        setDuplicate(nearby[0])
      } else {
        setDuplicate(null)
      }
    } catch {
      setDuplicate(null)
    }
  }

  const handleConfirm = async (values) => {
    const template = issueTemplates.find((item) => item.value === values.category)
    const payload = {
      title: template?.label || 'Civic Issue',
      category: values.category,
      description: values.description,
      latitude: formattedLocation.lat,
      longitude: formattedLocation.lng,
      address: 'Reported issue location',
    }

    if (!navigator.onLine) {
      const draftId = `draft-${crypto.randomUUID?.() || 'offline'}`
      setOfflineNotice(t('report.offlineSaved'))
      addDraft({ ...payload, id: draftId, status: 'submitted', department: analysis?.department, priority: analysis?.priority, image: selectedImage })
      setSubmitted(true)
      setComplaintId(draftId)
      return
    }

    setError('')
    try {
      const response = await createComplaintApi(payload)
      const newComplaint = response.complaint

      if (analysis && analysis.categoryKey) {
        try {
          await saveAIAnalysisApi(response.complaintId, {
            category: analysis.categoryKey,
            priority: analysis.priorityKey,
            department: analysis.department,
            confidence: 0.9,
            reason: 'Client-side heuristic analysis.',
          })
        } catch {
          // analysis save is best-effort
        }
      }

      if (compressedFile) {
        try {
          await uploadComplaintImageApi(response.complaintId, compressedFile)
        } catch {
          // image upload is best-effort; complaint is already created
        }
      }

      addComplaint(newComplaint)
      setComplaintId(response.complaintId)
      setSubmitted(true)
    } catch (e) {
      setError(e.response?.data?.error || t('report.submitError'))
    }
  }

  const onSubmit = async (values) => {
    if (!analysis) {
      await handleAiAnalysis()
    }
    await handleConfirm(values)
  }

  const sectionClass = 'rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-md sm:p-6 dark:border-slate-700 dark:bg-slate-800/50'
  const labelClass = 'text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400'

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-emerald-50 px-4 py-6 sm:px-6 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-5xl">
        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className={`${sectionClass} animate-fadeInUp`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600 dark:text-orange-400">{t('report.reportLabel')}</div>
                  <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{t('report.title')}</h1>
                </div>
              </div>

              <ImageUploader
                image={selectedImage}
                compressed={compressedFile}
                onImageChange={handleImageChange}
              />
            </div>

            <div className={`${sectionClass} animate-fadeInUp`}>
              <div className={`${labelClass} mb-4`}>{t('report.issueType')}</div>
              <div className="grid gap-3 sm:grid-cols-4">
                {issueTemplates.map((issue) => (
                  <label
                    key={issue.value}
                    className={`cursor-pointer rounded-2xl border p-3 transition duration-200 hover:-translate-y-0.5 ${
                      watchCategory === issue.value
                        ? 'border-sky-500 bg-sky-50 shadow-md shadow-sky-500/10 dark:bg-sky-900/30'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700/50'
                    }`}
                  >
                    <input type="radio" value={issue.value} {...register('category')} className="hidden" />
                    <div className="text-2xl transition duration-200 group-hover:scale-110">{issue.emoji}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{categoryLabel(issue.value)}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className={`${sectionClass} animate-fadeInUp`}>
              <label className={`${labelClass} mb-3 block`}>{t('report.description')}</label>
              <textarea
                rows="4"
                {...register('description', { required: t('report.requiredDescription') })}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-800 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:border-sky-400 dark:focus:bg-slate-600"
                placeholder={t('report.descriptionPlaceholder')}
              />
              <div className="mt-3 flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSpeech}
                  disabled={recording}
                  className="rounded-2xl bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition duration-200 hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                >
                  {recording ? `🎤 ${t('report.listening')}` : `🎤 ${t('report.speak')}`}
                </button>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="rounded-2xl bg-sky-100 px-4 py-2.5 text-sm font-semibold text-sky-700 transition duration-200 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50"
                >
                  📍 {t('report.getGps')}
                </button>
              </div>
              {gpsError && <div className="mt-3 text-sm text-amber-700 dark:text-amber-400">{gpsError}</div>}
              {speechError && <div className="mt-3 text-sm text-rose-600 dark:text-rose-400">{speechError}</div>}
            </div>

            <div className={`${sectionClass} animate-fadeInUp`}>
              <div className="mb-3 flex items-center justify-between">
                <div className={labelClass}>{t('report.map')}</div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {t('report.useCurrentLocation')}
                </button>
              </div>
              <MapPicker position={markerPosition} setPosition={setMarkerPosition} />
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {t('report.lat')}: <span className="font-semibold text-slate-900 dark:text-white">{formattedLocation.lat.toFixed(5)}</span> •{' '}
                {t('report.lng')}: <span className="font-semibold text-slate-900 dark:text-white">{formattedLocation.lng.toFixed(5)}</span>
              </div>
              <button
                type="button"
                onClick={() => setValue('location', formattedLocation)}
                className="mt-4 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-emerald-600"
              >
                {t('report.confirmLocation')}
              </button>
            </div>

            <div className={`${sectionClass} animate-fadeInUp`}>
              <div className="flex items-center justify-between gap-4">
                <div className={labelClass}>{t('report.aiAnalysis')}</div>
                <button
                  type="button"
                  onClick={handleAiAnalysis}
                  className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-sky-600"
                >
                  {t('report.analyzeIssue')}
                </button>
              </div>
              {analysis && (
                <div className="mt-4 animate-fadeInUp">
                  <AIAnalysisCard analysis={analysis} />
                </div>
              )}
            </div>

            <div className={`${sectionClass} animate-fadeInUp`}>
              <div className={`${labelClass} mb-4`}>{t('report.duplicateWarning')}</div>
              {duplicate ? (
                <DuplicateWarning
                  complaint={duplicate}
                  onSupport={() => navigate(`/complaints/${duplicate.id}`)}
                  onNew={() => setDuplicate(null)}
                />
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('report.duplicateHint')}</p>
              )}
            </div>

            <div className={`${sectionClass} animate-fadeInUp`}>
              <div className={`${labelClass} mb-4`}>{t('report.review')}</div>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-700/50 dark:text-slate-300">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{t('report.category')}:</span>{' '}
                  {categoryLabel(watchCategory)}
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{t('report.description')}:</span> {watchDescription}
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{t('report.location')}:</span>{' '}
                  {formattedLocation.lat.toFixed(5)}, {formattedLocation.lng.toFixed(5)}
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{t('report.priority')}:</span> {analysis?.priority || '—'}
                </div>
              </div>
              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-emerald-600 hover:shadow-lg"
                >
                  {t('report.submit')}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="animate-popIn mx-auto max-w-lg rounded-4xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="animate-float inline-block text-5xl">✅</div>
            <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{t('report.successTitle')}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t('report.complaintId')}: <span className="font-bold text-slate-900 dark:text-white">{complaintId}</span>
            </p>
            {offlineNotice && (
              <p className="mt-4 rounded-2xl bg-white px-3 py-2 text-sm text-amber-700 dark:bg-slate-800 dark:text-amber-400">
                {offlineNotice}
              </p>
            )}
            <button
              onClick={() => navigate(`/complaints/${complaintId}`)}
              className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition duration-200 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {t('report.viewComplaint')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
