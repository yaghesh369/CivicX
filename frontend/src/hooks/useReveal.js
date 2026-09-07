import { useEffect, useRef, useState } from 'react'

export default function useReveal(options = {}) {
  const { threshold = 0.12, once = true, delay = 0 } = options
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(node)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, once])

  return { ref, visible, style: { transitionDelay: `${delay}ms` } }
}
