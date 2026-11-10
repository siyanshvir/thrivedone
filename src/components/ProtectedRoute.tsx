import React from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const adminEmail = String(import.meta.env.VITE_ADMIN_EMAIL ?? '').trim().toLowerCase()

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminEmail && String(user?.email ?? '').toLowerCase() !== adminEmail) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
