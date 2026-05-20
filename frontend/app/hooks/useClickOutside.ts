import { useEffect, useRef } from 'react'

export default function useClickOutside<T extends HTMLElement = HTMLElement>(
  handleClick: () => void,
  propagation = true,
  ignoreSelector: string | null = null,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (ignoreSelector && (event.target as Element).closest(ignoreSelector)) return
        handleClick()
      }
    }

    document.addEventListener('mousedown', handleClickOutside, propagation)
    document.addEventListener('touchstart', handleClickOutside, propagation)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, propagation)
      document.removeEventListener('touchstart', handleClickOutside, propagation)
    }
  }, [handleClick, propagation, ignoreSelector])

  return ref
}
