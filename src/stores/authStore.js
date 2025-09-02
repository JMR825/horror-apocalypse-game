import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: (username, email) => {
        const userData = {
          id: Date.now(),
          username,
          email,
          createdAt: new Date().toISOString(),
          gamesPlayed: 0,
          bestTime: null,
          achievements: []
        }
        set({ 
          user: userData, 
          isAuthenticated: true 
        })
        return userData
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      
      updateStats: (stats) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              ...stats
            }
          })
        }
      }
    }),
    {
      name: 'horror-game-auth',
      getStorage: () => localStorage,
    }
  )
)
