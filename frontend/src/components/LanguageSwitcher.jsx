import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCivicContext } from '../context/CivicContext'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
]

export default function LanguageSwitcher({ variant = 'select', align = 'right' }) {
  const { i18n } = useTranslation()
  const { setLanguage } = useCivicContext()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'select') {
    return (
      <div className="relative" ref={ref}>
        <select
          aria-label="Language selector"
          value={i18n.language}
          onChange={(event) => setLanguage(event.target.value)}
          className="cursor-pointer appearance-none rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:scale-[1.02] focus:ring-2 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">▾</span>
      </div>
    )
  }

  const current = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="uppercase">{current.code}</span>
        <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl dark:border-slate-700 dark:bg-slate-800 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition ${
                lang.code === i18n.language
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
