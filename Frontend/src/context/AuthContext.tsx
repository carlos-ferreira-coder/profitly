import React, { createContext, useState } from 'react'
import { AuthProps } from '../types/Database'

interface AuthContextType {
  auth: AuthProps | null
  setAuth: React.Dispatch<React.SetStateAction<AuthProps | null>>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthProps | null>(null)

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within a UserProvider')
  }
  return context
}
