'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL!

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null)
  const tokenRef = useRef<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    function sync() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        if (socketRef.current?.connected) socketRef.current.disconnect()
        socketRef.current = null
        tokenRef.current = null
        setSocket(null)
        return
      }

      // Token changed — disconnect old socket
      if (tokenRef.current && tokenRef.current !== token && socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        tokenRef.current = null
      }

      if (!socketRef.current) {
        const newSocket = io(SOCKET_URL, {
          auth: { token },
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })
        socketRef.current = newSocket
        tokenRef.current = token
        setSocket(newSocket)
      }
    }

    sync()

    // Re-sync on login/logout (same tab) and storage changes (other tabs)
    window.addEventListener('token-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('token-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export function useSocket(): Socket | null {
  return useContext(SocketContext)
}
