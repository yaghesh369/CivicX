import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export default function usePwaRegister() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const updateSWRef = useRef(null)

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
    updateSWRef.current = updateSW

    return () => {
      updateSW?.(false)
      updateSWRef.current = null
    }
  }, [])

  return {
    needRefresh,
    offlineReady,
    updateSW: () => updateSWRef.current?.(true),
  }
}
