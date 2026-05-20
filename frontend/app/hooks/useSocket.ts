'use client'

import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL!

export function useSocket(): Socket | null {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const socketRef = useRef<Socket | null>(null)
  const tokenRef = useRef<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!token) {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect()
      }
      socketRef.current = null
      tokenRef.current = null
      setSocket(null)
      return
    }

    // If token changed, disconnect old socket
    if (tokenRef.current && tokenRef.current !== token && socketRef.current?.connected) {
      socketRef.current.disconnect()
      socketRef.current = null
      tokenRef.current = null
    }

    // Create socket if it doesn't exist
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
      return
    }

    if (!socketRef.current.connected) {
      socketRef.current.connect()
    }
  }, [token])

  return socket
}
