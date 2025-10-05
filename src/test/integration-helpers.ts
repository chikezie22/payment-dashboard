import { useBoundStore } from '@/store';

export const resetStore = () => {
  useBoundStore.setState({
    wallets: [],
    exchangeRates: {},
    isLoadingRates: false,
    transactions: [],
  });
};

export const setupWallets = () => {
  const { createWallet } = useBoundStore.getState();
  createWallet();
};

export const depositFunds = (currency: string, amount: number) => {
  const { deposit } = useBoundStore.getState();
  deposit(currency, amount);
};
export const mockExchangeRates = (rates: Record<string, number>) => {
  useBoundStore.setState({ exchangeRates: rates });
};
