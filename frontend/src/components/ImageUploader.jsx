import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import imageCompression from 'browser-image-compression'

export default function ImageUploader({ image, onImageChange, compressed }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0]
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
    event.target.value = ''
  }

  const openCamera = () => cameraInputRef.current?.click()
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
