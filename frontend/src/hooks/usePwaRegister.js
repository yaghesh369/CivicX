import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export default function usePwaRegister() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)

  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onOfflineReady() {
        setOfflineReady(true)
      },
    })

    return () => {
      updateSW?.(false)
    }
  }, [])

  return {
    needRefresh,
    offlineReady,
    updateSW: () => window.location.reload(),
  }
}
