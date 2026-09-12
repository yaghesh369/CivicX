import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '../components/Logo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import InstallButton from '../components/InstallButton'
import useReveal from '../hooks/useReveal'

function Reveal({ children, className = '', delay = 0 }) {
  const { ref, visible, style } = useReveal({ delay })
  return (
    <div ref={ref} style={style} className={`reveal ${visible ? 'revealed' : ''} ${className}`}>
      {children}
    </div>
  )
}

const features = [
  { key: 'feature1', icon: '📍' },
  { key: 'feature2', icon: '🤖' },
  { key: 'feature3', icon: '📊' },
  { key: 'feature4', icon: '🌐' },
  { key: 'feature5', icon: '📱' },
  { key: 'feature6', icon: '🔔' },
]

const steps = [
  { key: 'step1' },
  { key: 'step2' },
  { key: 'step3' },
  { key: 'step4' },
]

const benefits = [
  { key: 'benefit1', icon: '⚡' },
  { key: 'benefit2', icon: '🔒' },
  { key: 'benefit3', icon: '👥' },
  { key: 'benefit4', icon: '📈' },
]

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo to="/" textClassName="text-white" />
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher variant="dropdown" align="right" />
            <span className="hidden sm:block">
              <InstallButton variant="dark" />
            </span>
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white sm:px-4"
            >
              {t('landing.signIn')}
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-linear-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:shadow-sky-500/50"
            >
              {t('landing.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="animate-float absolute -top-24 right-0 h-96 w-96 rounded-full bg-linear-to-br from-sky-500/25 to-transparent blur-3xl" />
        <div className="animate-float-slow absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-linear-to-tr from-emerald-500/25 to-transparent blur-3xl" />
        <div className="animate-spin-slow absolute left-1/2 top-1/3 h-72 w-72 rounded-full border border-sky-500/20 opacity-40" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="animate-popIn mb-6 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm font-semibold text-sky-300">{t('landing.badge')}</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mb-6 text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              <span className="animate-gradient bg-linear-to-r from-sky-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                {t('landing.heroTitle1')}
              </span>
              <br />
              {t('landing.heroTitle2')}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl">
              {t('landing.heroSubtitle')}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="group rounded-xl bg-linear-to-r from-sky-500 to-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-sky-500/40 transition hover:shadow-sky-500/60"
              >
                {t('landing.startReporting')}
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition hover:border-slate-500 hover:bg-slate-700/50"
              >
                {t('landing.learnMore')}
              </a>
            </div>
          </Reveal>

          {/* Hero Stats */}
          <div className="mt-20 grid gap-6 sm:grid-cols-3">
            {[
              { value: '12.5K', label: t('landing.issuesResolved'), color: 'text-emerald-400' },
              { value: '98%', label: t('landing.satisfactionRate'), color: 'text-sky-400' },
              { value: '48h', label: t('landing.avgResolution'), color: 'text-purple-400' },
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-sky-500/40 hover:bg-white/10">
                  <div className={`text-4xl font-black ${stat.color} transition group-hover:scale-110`}>{stat.value}</div>
                  <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-white sm:text-5xl">{t('landing.featuresTitle')}</h2>
            <p className="text-lg text-slate-400">{t('landing.featuresSubtitle')}</p>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.key} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-transparent p-8 backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:border-sky-500/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-sky-500/10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-cyan-500 text-2xl shadow-lg transition duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {f.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{t(`landing.${f.key}Title`)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{t(`landing.${f.key}Desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black text-white sm:text-5xl">{t('landing.howTitle')}</h2>
            <p className="text-lg text-slate-400">{t('landing.howSubtitle')}</p>
          </Reveal>

          <div className="space-y-6">
            {steps.map((step, i) => {
              const stepsCompleted = steps.length
              return (
                <Reveal key={step.key} delay={i * 100}>
                  <div className="group relative flex gap-6">
                    {i < stepsCompleted - 1 && (
                      <div className="absolute left-[39px] top-20 h-[calc(100%-2rem)] w-px bg-linear-to-b from-sky-500/50 to-emerald-500/50" />
                    )}
                    <div className="flex shrink-0 items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-cyan-500 text-2xl font-black text-white shadow-lg transition duration-300 group-hover:scale-110 group-hover:rotate-3">
                        {i + 1}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition duration-300 group-hover:border-emerald-500/40 group-hover:bg-white/10 sm:p-8">
                      <h3 className="text-xl font-bold text-white">{t(`landing.${step.key}Title`)}</h3>
                      <p className="mt-2 leading-relaxed text-slate-400">{t(`landing.${step.key}Desc`)}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-white/5 to-transparent p-8 backdrop-blur-sm sm:p-12 lg:p-16">
              <Reveal className="mb-12">
                <h2 className="text-4xl font-black text-white sm:text-5xl">{t('landing.whyTitle')}</h2>
              </Reveal>

              <div className="grid gap-8 md:grid-cols-2">
                {benefits.map((b, i) => (
                  <Reveal key={b.key} delay={i * 100}>
                    <div className="group flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl transition duration-300 group-hover:scale-110 group-hover:bg-white/20">
                        {b.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{t(`landing.${b.key}Title`)}</h3>
                        <p className="mt-1 text-slate-400">{t(`landing.${b.key}Desc`)}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="animate-float absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="mb-6 text-4xl font-black text-white sm:text-5xl">
              <span className="animate-gradient bg-linear-to-r from-sky-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
                {t('landing.ctaTitle')}
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">{t('landing.ctaSubtitle')}</p>
          </Reveal>

          <Reveal delay={150}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="group rounded-xl bg-linear-to-r from-sky-500 to-emerald-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-sky-500/40 transition hover:shadow-sky-500/60"
              >
                {t('landing.getStartedFree')}
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-600 bg-slate-800/50 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition hover:border-slate-500 hover:bg-slate-700/50"
              >
                {t('landing.signIn')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div>
              <Logo to="/" textClassName="text-white" />
              <p className="mt-3 text-sm text-slate-400">{t('landing.footerTagline')}</p>
            </div>

            {[
              { title: t('landing.product'), items: [t('landing.features'), t('landing.pricing'), t('landing.security')] },
              { title: t('landing.company'), items: [t('landing.about'), t('landing.blog'), t('landing.contact')] },
              { title: t('landing.legal'), items: [t('landing.privacy'), t('landing.terms'), t('landing.cookies')] },
              { title: t('landing.social'), items: [t('landing.twitter'), t('landing.github'), t('landing.linkedin')] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white">{col.title}</h4>
                <ul className="mt-4 space-y-2">
                  {col.items.map((item) => (
                    <li key={item}>
                      <span className="text-sm text-slate-400">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-400 sm:flex-row">
            <p>
              &copy; 2026 CivicX. {t('landing.rights')}
            </p>
            <InstallButton variant="dark" />
          </div>
        </div>
      </footer>
    </div>
  )
}
