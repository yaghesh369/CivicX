import { useEffect, useState, useCallback } from 'react'

function getStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function detectPlatform() {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || ''
  const hasTouch = navigator.maxTouchPoints > 0
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && hasTouch)) {
    return 'ios'
  }
  if (/android/i.test(ua)) {
    if (/wv\b|webview|daydream|fbav|instagram|messenger/i.test(ua)) return 'inapp'
    return 'android'
  }
  return 'desktop'
}

function isInAppBrowser() {
  return detectPlatform() === 'inapp'
}

const isIos = () => detectPlatform() === 'ios'

export default function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(() => getStandalone())
  const [hasPrompt, setHasPrompt] = useState(() => 'beforeinstallprompt' in window)
  const [helpOpen, setHelpOpen] = useState(false)
  const platform = detectPlatform()

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
      setHasPrompt(true)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setHasPrompt(false)
    }

    const handleAppInstalled = () => setIsInstalled(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('installed', handleInstalled)

    const handleDisplayMode = (event) => {
      if (event.matches) setIsInstalled(true)
    }
    const media = window.matchMedia('(display-mode: standalone)')
    if (media.addEventListener) {
      media.addEventListener('change', handleDisplayMode)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('installed', handleInstalled)
      if (media.removeEventListener) {
        media.removeEventListener('change', handleDisplayMode)
      }
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const result = await installPrompt.userChoice
      if (result.outcome === 'accepted') {
        setInstallPrompt(null)
        setIsInstalled(true)
        setHasPrompt(false)
      }
      return result.outcome === 'accepted'
    }
    setHelpOpen(true)
    return false
  }, [installPrompt])

  const openHelp = useCallback(() => setHelpOpen(true), [])
  const closeHelp = useCallback(() => setHelpOpen(false), [])

  return {
    canInstall: !isInstalled,
    isInstalled,
    hasPrompt,
    isIos,
    isInAppBrowser,
    platform,
    promptInstall,
    openHelp,
    helpOpen,
    closeHelp,
  }
}