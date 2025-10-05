import { create } from 'zustand';
import walletSlice from './slices/wallet-slice';
import type { WalletProps } from './slices/wallet-slice';
import { createContactSlice } from './slices/email-slice';
import type { ContactSlice } from './slices/email-slice';
type StoreState = WalletProps & ContactSlice;
export const useBoundStore = create<StoreState>()((...a) => ({
  ...walletSlice(...a),
  ...createContactSlice(...a),
}));
