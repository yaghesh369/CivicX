import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useCivicContext } from '../context/CivicContext'
import Logo from '../components/Logo'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: registerUser } = useCivicContext()
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()

  const password = useWatch({ control, name: 'password' })

  const onSubmit = async (values) => {
    setMessage('')
    const result = await registerUser(values)

    if (result.success) {
      navigate('/home')
      return
    }

    setMessage(result.error || t('register.serverError'))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#ecfeff_0%,#f8fafc_40%,#fef3c7_100%)] px-4 py-8 dark:bg-slate-950">
      <div className="animate-float absolute -right-16 top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="animate-float-slow absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Logo to="/" textClassName="text-slate-900 dark:text-white" />
          <LanguageSwitcher variant="dropdown" align="right" />
        </div>

        <div className="animate-popIn rounded-4xl border border-slate-200 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 sm:p-7">
          <div className="mb-7">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
              {t('register.joinus')}
            </div>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{t('register.title')}</h1>
          </div>

          <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">{t('register.subtitle')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('register.name')}</label>
              <input
                {...register('name', { required: t('register.emptyName') })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-400"
                placeholder="Aarav Mehta"
              />
              {errors.name && <div className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.name.message}</div>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('register.email')}</label>
              <input
                {...register('email', {
                  required: t('register.emptyEmail'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('register.invalidEmail'),
                  },
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-400"
                placeholder="you@example.com"
              />
              {errors.email && <div className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.email.message}</div>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('register.password')}</label>
              <input
                type="password"
                {...register('password', {
                  required: t('register.weakPassword'),
                  minLength: { value: 8, message: t('register.weakPassword') },
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-400"
                placeholder="••••••"
              />
              {errors.password && <div className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.password.message}</div>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('register.confirmPassword')}</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  validate: (value) => value === password || t('register.passwordMismatch'),
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-400"
                placeholder="••••••"
              />
              {errors.confirmPassword && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword.message}</div>
              )}
            </div>

            {message && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:shadow-slate-950 dark:hover:bg-slate-200"
            >
              {t('register.createAccount')}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>{t('register.alreadyHaveAccount')}</span>
            <Link to="/login" className="font-semibold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400">
              {t('register.loginNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
