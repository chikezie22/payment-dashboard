import type { StateCreator } from 'zustand';
export interface ContactSlice {
  email: string | null;
  setEmail: (email: string) => void;
}

export const createContactSlice: StateCreator<ContactSlice> = (set) => ({
  email: null,
  setEmail: (email) => set({ email }),
});
