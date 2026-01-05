import { create } from 'zustand'

interface UIState {
  // Contact Modal
  isContactModalOpen: boolean
  openContactModal: () => void
  closeContactModal: () => void
  toggleContactModal: () => void
  
  // Admin Login Modal (เพิ่มส่วนนี้)
  isAdminLoginOpen: boolean
  openAdminLogin: () => void
  closeAdminLogin: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // Contact
  isContactModalOpen: false,
  openContactModal: () => set({ isContactModalOpen: true }),
  closeContactModal: () => set({ isContactModalOpen: false }),
  toggleContactModal: () => set((state) => ({ isContactModalOpen: !state.isContactModalOpen })),

  // Admin (เพิ่มส่วนนี้)
  isAdminLoginOpen: false,
  openAdminLogin: () => set({ isAdminLoginOpen: true }),
  closeAdminLogin: () => set({ isAdminLoginOpen: false }),
}))