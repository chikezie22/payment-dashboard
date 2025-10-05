import type { StateCreator } from 'zustand';

interface Wallet {
  id: string;
  currency: string;
  balance: number;
  address: string;
}

interface ExchangeRates {
  [key: string]: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'swap' | 'send';
  fromCurrency?: string;
  toCurrency?: string;
  amount: number;
  convertedAmount?: number;
  toAddress?: string;
  timeStamp: string;
}

export interface WalletProps {
  isLoadingRates: boolean;
  wallets: Wallet[];
  transactions: Transaction[];
  exchangeRates: ExchangeRates;
  createWallet: () => void;
  deposit: (currency: string, amount: number) => void;
  fetchExchangeRates: (baseCurrency: string) => Promise<void>;
  swap: (fromCurrency: string, toCurrency: string, amount: number) => void;
  send: (fromCurrency: string, toAddress: string, amount: number) => void;
  saveOfflineData: () => void;
  loadOfflineData: () => void;
}

const apiKey = import.meta.env.VITE_API_KEY;

const walletSlice: StateCreator<WalletProps> = (set, get) => ({
  isLoadingRates: false,
  exchangeRates: {},
  wallets: JSON.parse(localStorage.getItem('wallets') || '[]'),
  transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
  saveOfflineData: () => {
    const { wallets, transactions } = get();
    localStorage.setItem('wallets', JSON.stringify(wallets));
    localStorage.setItem('transactions', JSON.stringify(transactions));
  },

  loadOfflineData: () => {
    const savedWallets = localStorage.getItem('wallets');
    const savedTransactions = localStorage.getItem('transactions');

    if (savedWallets) set({ wallets: JSON.parse(savedWallets) });
    if (savedTransactions) set({ transactions: JSON.parse(savedTransactions) });
  },
  createWallet: () =>
    set(() => ({
      wallets: [
        { id: '1', currency: 'USD', balance: 0, address: '0xE536aF7A65B20d6d4CAfA25e05A7906D0' },
        { id: '2', currency: 'NGN', balance: 0, address: '0xE536aF7A65B20d6d4CAfA25e05A7906D0' },
        { id: '3', currency: 'EUR', balance: 0, address: '0xE536aF7A65B20d6d4CAfA25e05A7906D0' },
        { id: '4', currency: 'GBP', balance: 0, address: '0xE536aF7A65B20d6d4CAfA25e05A7906D0' },
      ],
    })),

  deposit: (currency, amount) =>
    set((state) => {
      const updatedWallets = state.wallets.map((wallet) =>
        wallet.currency === currency ? { ...wallet, balance: wallet.balance + amount } : wallet
      );

      const updatedTransactions = [
        ...state.transactions,
        {
          id: Date.now().toString(),
          type: 'deposit',
          fromCurrency: currency,
          amount,
          timeStamp: new Date().toISOString(),
        },
      ];

      // ✅ Save instantly for offline access
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

      return { wallets: updatedWallets, transactions: updatedTransactions } as Partial<WalletProps>;
    }),

  fetchExchangeRates: async (baseCurrency: string) => {
    set({ isLoadingRates: true });
    try {
      const response = await fetch(
        ` https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data = await response.json();
      set({
        exchangeRates: data.conversion_rates,
        isLoadingRates: false,
      });
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      set({ isLoadingRates: false });
    }
  },

  swap: (fromCurrency: string, toCurrency: string, amount: number) => {
    const { exchangeRates } = get();
    const rate = exchangeRates[toCurrency];
    if (!rate) throw new Error('Exchange rate not available');

    const convertedAmount = parseFloat((amount * rate).toFixed(3));

    set((state) => {
      const updatedWallets = state.wallets.map((wallet) =>
        wallet.currency === fromCurrency
          ? { ...wallet, balance: wallet.balance - amount }
          : wallet.currency === toCurrency
          ? { ...wallet, balance: wallet.balance + convertedAmount }
          : wallet
      );

      const updatedTransactions = [
        ...state.transactions,
        {
          id: Date.now().toString(),
          type: 'swap',
          fromCurrency,
          toCurrency,
          amount,
          convertedAmount,
          timeStamp: new Date().toISOString(),
        },
      ];

      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

      return { wallets: updatedWallets, transactions: updatedTransactions } as Partial<WalletProps>;
    });
  },
  send: (fromCurrency: string, toAddress: string, amount: number) =>
    set((state) => {
      const updatedWallets = state.wallets.map((wallet) =>
        wallet.currency === fromCurrency ? { ...wallet, balance: wallet.balance - amount } : wallet
      );

      const updatedTransactions = [
        ...state.transactions,
        {
          id: Date.now().toString(),
          type: 'send',
          fromCurrency,
          toAddress,
          amount,
          timeStamp: new Date().toISOString(),
        },
      ];

      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

      return { wallets: updatedWallets, transactions: updatedTransactions }as Partial<WalletProps>;
    }),
});
export default walletSlice;
