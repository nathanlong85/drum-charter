'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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
    <div className="flex gap-4 items-center">
      <span className="text-sm text-gray-700">
        Hi, <span className="font-semibold text-blue-600">{user.email}</span>
      </span>
      <button 
        onClick={handleLogout}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
      >
        Sign Out
      </button>
    </div>
  )
}
