import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useCivicContext } from '../context/CivicContext'
import Logo from '../components/Logo'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useCivicContext()
  const [serverMessage, setServerMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    setServerMessage('')

    const result = await login(values)

    if (result.success) {
      navigate('/home')
      return
    }

    setServerMessage(result.error || t('login.serverError'))
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_42%,#ecfeff_100%)] px-4 py-8 dark:bg-slate-950">
      <div className="animate-float absolute -right-16 top-10 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="animate-float-slow absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Logo to="/" textClassName="text-slate-900 dark:text-white" />
          <LanguageSwitcher variant="dropdown" align="right" />
        </div>

        <div className="animate-popIn rounded-4xl border border-slate-200 bg-white/80 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 sm:p-7">
          <div className="mb-7">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600 dark:text-sky-400">CivicConnect</div>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{t('login.title')}</h1>
          </div>

          <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">{t('login.subtitle')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('login.email')}</label>
              <input
                {...register('email', {
                  required: t('login.emptyEmail'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('login.invalidEmail'),
                  },
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-400"
                placeholder="citizen@example.com"
              />
              {errors.email && <div className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.email.message}</div>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{t('login.password')}</label>
              <input
                type="password"
                {...register('password', {
                  required: t('login.emptyPassword'),
                  minLength: { value: 6, message: t('login.wrongPassword') },
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-400"
                placeholder="••••••"
              />
              {errors.password && <div className="mt-2 text-xs text-red-600 dark:text-red-400">{errors.password.message}</div>}
            </div>

            {serverMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                {serverMessage}
              </div>
            )}

            <button
              type="submit"
              className="group w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:shadow-slate-950 dark:hover:bg-slate-200"
            >
              {t('common.login')}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>{t('login.noAccount')}</span>
            <Link to="/register" className="font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400">
              {t('login.registerNow')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
