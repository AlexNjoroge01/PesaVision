import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppStore {
  selectedStatementId: string | null
  setSelectedStatement: (id: string | null) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      selectedStatementId: null,
      setSelectedStatement: (id) => set({ selectedStatementId: id }),
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'pesavision-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
