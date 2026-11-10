import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  user: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsAuthenticated(true)
          setUser(session.user)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsAuthenticated(true)
          setUser(session.user)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error:', error)
        return false
      }

      if (data.user) {
        setIsAuthenticated(true)
        setUser(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  )
}

// Simple password check for demo (in production, use proper auth)
export const checkEmployeeAccess = (email: string, password: string): boolean => {
  // For demo purposes, allow any email with "employee" in it and password "employee123"
  // In production, you'd use proper Supabase auth with role-based access
  return email.includes('employee') && password === 'employee123'
}
