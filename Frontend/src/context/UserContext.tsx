import React, { createContext, useState } from 'react'
import { UserProps } from '../types/Database'

interface UserContextType {
  user: UserProps | null
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>
}

const UserContext = createContext<UserContextType | null>(null)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProps | null>(null)

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = React.useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
