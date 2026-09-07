import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCivicContext } from '../context/CivicContext'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import InstallButton from './InstallButton'

const tabs = [
  { path: '/home', label: 'home' },
  { path: '/complaints', label: 'complaints' },
  { path: '/notifications', label: 'notifications' },
  { path: '/profile', label: 'profile' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const { user, theme, setTheme } = useCivicContext()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Logo to="/home" textClassName="text-slate-900 dark:text-white" />

        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 md:flex dark:border-slate-700 dark:bg-slate-800">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                }`
              }
            >
              {t(`common.${tab.label}`)}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <InstallButton />
          </span>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:scale-[1.02] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>

          <LanguageSwitcher variant="dropdown" align="right" />

          {user ? (
            <Link
              to="/profile"
              className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:block dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            >
              {user.name ? user.name.split(' ')[0] : 'Citizen'}
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="animate-fadeInUp border-t border-slate-200 bg-slate-50 px-4 py-3 md:hidden dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-3 py-2.5 text-center text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-white text-slate-600 shadow-sm dark:bg-slate-700 dark:text-slate-200'
                  }`
                }
              >
                {t(`common.${tab.label}`)}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
