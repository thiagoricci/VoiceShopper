import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '@/lib/auth-api'
import { setAuthToken, clearAuthToken, getAuthToken, setUserData, clearUserData, getUserData } from '@/lib/indexedDB'
import { updateCachedToken } from '@/lib/api'
import type { AuthContextType, User, LoginCredentials, RegisterCredentials } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const checkAuth = async () => {
    // Declare at function level to be accessible in catch blocks
    let token: string | null = null
    let cachedUser: User | null = null
    
    try {
      token = await getAuthToken()
      cachedUser = await getUserData()
      updateCachedToken(token)

      // If we have both token and cached user data, use it immediately
      if (token && cachedUser) {
        setUser(cachedUser)

        // Validate token in background
        try {
          const currentUser = await authApi.getCurrentUser()
          setUser(currentUser) // Update with fresh data
          setUserData(currentUser) // Update cache
        } catch (error: any) {
          // If validation fails, check if it's a network error or invalid token
          if (error.response?.status === 401) {
            // Invalid token - logout
            console.log('Token validation failed (401), logging out user')
            logout()
          } else if (!error.response) {
            // Network error (no response object) - keep user logged in with cached data
            console.warn('Network error during token validation, using cached data:', error.message || 'No response from server')
            // Keep user logged in - don't logout
          } else {
            // Other server errors - keep user logged in with cached data
            console.warn('Server error during token validation, using cached data:', error.response?.status, error.message)
            // Keep user logged in - don't logout
          }
        }
      } else if (token) {
        // Token exists but no cached user - fetch from backend
        try {
          const currentUser = await authApi.getCurrentUser()
          setUser(currentUser)
          setUserData(currentUser)
        } catch (error: any) {
          // If fetching user data fails, check if it's a network error or invalid token
          if (error.response?.status === 401) {
            // Invalid token - logout
            console.log('Token validation failed (401), logging out user')
            logout()
          } else if (!error.response) {
            // Network error - clear token to prevent infinite loop
            console.warn('Network error fetching user data, clearing token:', error.message || 'No response from server')
            clearAuthToken()
            setUser(null)
          } else {
            // Other server errors - clear token to prevent infinite loop
            console.warn('Server error fetching user data, clearing token:', error.response?.status, error.message)
            clearAuthToken()
            setUser(null)
          }
        }
      }
      // If neither exists, user is not logged in
    } catch (error) {
      console.error('Auth check failed:', error)
      // Don't auto-logout on network errors
      const errorObj = error as any
      
      // Only logout on 401 (invalid token)
      if (errorObj.response?.status === 401) {
        console.log('Auth check failed with 401, logging out user')
        logout()
      } else if (!errorObj.response) {
        // Network error - keep user logged in if we have cached data
        if (cachedUser) {
          console.warn('Network error during auth check, keeping user logged in with cached data')
          setUser(cachedUser)
        } else {
          console.warn('Network error during auth check, no cached data available')
        }
      } else {
        // Other errors - keep user logged in if we have cached data
        if (cachedUser) {
          console.warn('Server error during auth check, keeping user logged in with cached data:', errorObj.response?.status)
          setUser(cachedUser)
        } else {
          console.warn('Server error during auth check, no cached data available:', errorObj.response?.status)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    await setAuthToken(response.token)
    await setUserData(response.user)
    updateCachedToken(response.token)
    setUser(response.user)
  }

  const register = async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials)
    await setAuthToken(response.token)
    await setUserData(response.user)
    updateCachedToken(response.token)
    setUser(response.user)
  }

  const logout = async () => {
    authApi.logout()
    await clearAuthToken()
    await clearUserData()
    updateCachedToken(null)
    setUser(null)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
