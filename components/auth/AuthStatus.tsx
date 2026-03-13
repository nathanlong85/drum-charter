'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const isGuest = user?.is_anonymous;

  if (loading) return <div className="text-sm text-gray-400">Loading auth...</div>

  if (!user) {
    return (
      <div className="flex gap-4 items-center">
        <span className="text-sm text-gray-500 italic">Signed out</span>
        <a 
          href="/login" 
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Login
        </a>
      </div>
    )
  }

  return (
    <div className="flex gap-6 items-center">
      <div className="flex gap-4 items-center">
        <a 
          href="/library" 
          className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
        >
          My Library
        </a>
        <span className="w-px h-4 bg-gray-300"></span>
      </div>
      <div className="flex gap-4 items-center">
        <span className="text-sm text-gray-700">
          {isGuest ? (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              Guest Mode
            </span>
          ) : (
            <>Hi, <span className="font-semibold text-blue-600">{user.email}</span></>
          )}
        </span>
        <button 
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
