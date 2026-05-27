import { useCallback, useRef } from 'react'

const LONG_PRESS_MS = 500

export function useLongPress(onLongPress: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const didFire = useRef(false)

  const start = useCallback(() => {
    didFire.current = false
    timerRef.current = setTimeout(() => {
      didFire.current = true
      onLongPress()
    }, LONG_PRESS_MS)
  }, [onLongPress])

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  // Prevent the native context menu that fires after long press on mobile
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    if (didFire.current) e.preventDefault()
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onContextMenu,
  }
}
