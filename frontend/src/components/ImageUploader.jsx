import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import imageCompression from 'browser-image-compression'

export default function ImageUploader({ image, onImageChange, compressed }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }

  const processFile = async (file) => {
    if (!file) return

    setError('')
    setLoading(true)
    try {
      const options = { maxSizeMB: 0.6, maxWidthOrHeight: 1200, useWebWorker: true }
      const compressedFile = await imageCompression(file, options)
      const reader = new FileReader()
      reader.onload = () => {
        onImageChange(reader.result, compressedFile)
        setLoading(false)
      }
      reader.onerror = () => {
        setError(t('report.readImageError'))
        setLoading(false)
      }
      reader.readAsDataURL(compressedFile)
    } catch {
      setError(t('report.compressError'))
      setLoading(false)
    }
  }

  const handleImageSelect = async (event) => {
    await processFile(event.target.files?.[0])
    event.target.value = ''
  }

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click()
      return
    }

    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
    } catch {
      setError(t('report.cameraError', { defaultValue: 'Camera access was blocked. Please allow camera access or choose a photo from your gallery.' }))
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(async (blob) => {
      if (!blob) return
      await processFile(new File([blob], `civicx-photo-${Date.now()}.jpg`, { type: 'image/jpeg' }))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const openGallery = () => galleryInputRef.current?.click()

  return (
    <div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />

      {compressed?._size && (
        <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          {t('report.compressedSize')}: {compressedSizeLabel(compressed._size)}
        </div>
      )}

      {image ? (
        <div className="space-y-3">
          <img src={image} alt="Issue preview" className="h-56 w-full rounded-3xl object-cover" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={openCamera}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
              {loading ? t('report.compress') : t('report.replace')}
            </button>
            <button
              type="button"
              onClick={() => onImageChange('', null)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
            >
              {t('report.remove')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={openCamera}
            disabled={loading}
            className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:bg-sky-900/20"
          >
            {loading ? `⏳ ${t('report.compress')}` : `📷 ${t('report.takePhoto')}`}
          </button>
          <button
            type="button"
            onClick={openGallery}
            disabled={loading}
            className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:bg-sky-900/20"
          >
            🖼 {t('report.gallery')}
          </button>
        </div>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-label={t('report.cameraTitle', { defaultValue: 'Take a photo' })}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-4 shadow-2xl dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('report.cameraTitle', { defaultValue: 'Take a photo' })}</h2>
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-full px-3 py-1 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={t('common.cancel')}
              >
                ×
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full rounded-2xl bg-black object-cover" />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="rounded-2xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
              >
                📷 {t('report.capture', { defaultValue: 'Capture' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</div>}
    </div>
  )
}

function compressedSizeLabel(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
