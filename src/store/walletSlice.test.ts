/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';
import type { StoreApi, UseBoundStore } from 'zustand';
import walletSlice from './slices/wallet-slice';
import type { WalletProps } from './slices/wallet-slice';

describe('Wallet Slice - Unit Tests', () => {
  let store: UseBoundStore<StoreApi<WalletProps>>;
  beforeEach(() => {
    store = create<WalletProps>(walletSlice);
  });

  describe('createWallet', () => {
    it('should create 4 wallets with zero balance', () => {
      const { createWallet, wallets } = store.getState();

      expect(wallets).toHaveLength(0);

      createWallet();

      const updatedWallets = store.getState().wallets;
      expect(updatedWallets).toHaveLength(4);
      expect(updatedWallets[0]).toEqual({
        id: '1',
        currency: 'USD',
        balance: 0,
        address: expect.any(String),
      });
    });

    it('should create wallets with correct currencies', () => {
      const { createWallet } = store.getState();

      createWallet();

      const currencies = store.getState().wallets.map((w) => w.currency);
      expect(currencies).toEqual(['USD', 'NGN', 'EUR', 'GBP']);
    });
  });

  describe('deposit', () => {
    beforeEach(() => {
      store.getState().createWallet();
    });

    it('should add funds to the correct wallet', () => {
      const { deposit } = store.getState();

      deposit('USD', 100);

      const wallet = store.getState().wallets.find((w) => w.currency === 'USD');
      expect(wallet?.balance).toBe(100);
    });

    it('should accumulate multiple deposits', () => {
      const { deposit } = store.getState();

      deposit('USD', 50);
      deposit('USD', 30);
      deposit('USD', 20);

      const wallet = store.getState().wallets.find((w) => w.currency === 'USD');
      expect(wallet?.balance).toBe(100);
    });

    it('should not affect other wallets', () => {
      const { deposit } = store.getState();

      deposit('USD', 100);

      const ngnWallet = store.getState().wallets.find((w) => w.currency === 'NGN');
      expect(ngnWallet?.balance).toBe(0);
    });

    it('should record transaction', () => {
      const { deposit } = store.getState();

      deposit('USD', 50);

      const transactions = store.getState().transactions;
      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toMatchObject({
        type: 'deposit',
        fromCurrency: 'USD',
        amount: 50,
      });
    });
  });

  describe('swap', () => {
    beforeEach(() => {
      store.getState().createWallet();
      store.getState().deposit('USD', 100);
    });

    it('should throw error without exchange rate', () => {
      const { swap } = store.getState();

      expect(() => swap('USD', 'NGN', 10)).toThrow('Exchange rate not available');
    });

    it('should swap currencies with correct conversion', () => {
      const { swap } = store.getState();

      store.setState({ exchangeRates: { NGN: 1500 } });

      swap('USD', 'NGN', 10);

      const usdWallet = store.getState().wallets.find((w) => w.currency === 'USD');
      const ngnWallet = store.getState().wallets.find((w) => w.currency === 'NGN');

      expect(usdWallet?.balance).toBe(90);
      expect(ngnWallet?.balance).toBe(15000);
    });

    it('should record swap transaction with conversion details', () => {
      const { swap } = store.getState();

      store.setState({ exchangeRates: { EUR: 0.92 } });

      swap('USD', 'EUR', 20);

      const transactions = store.getState().transactions;
      const swapTransaction = transactions.find((t) => t.type === 'swap');

      expect(swapTransaction).toMatchObject({
        type: 'swap',
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 20,
        convertedAmount: 18.4,
      });
    });

    it('should handle decimal amounts correctly', () => {
      const { swap } = store.getState();

      store.setState({ exchangeRates: { GBP: 0.79 } });

      swap('USD', 'GBP', 15.5);

      const usdWallet = store.getState().wallets.find((w) => w.currency === 'USD');
      const gbpWallet = store.getState().wallets.find((w) => w.currency === 'GBP');

      expect(usdWallet?.balance).toBe(84.5);
      expect(gbpWallet?.balance).toBe(12.245);
    });
  });

  describe('send', () => {
    beforeEach(() => {
      store.getState().createWallet();
      store.getState().deposit('USD', 100);
    });

    it('should deduct funds from sender wallet', () => {
      const { send } = store.getState();

      send('USD', '0xRecipientAddress', 25);

      const wallet = store.getState().wallets.find((w) => w.currency === 'USD');
      expect(wallet?.balance).toBe(75);
    });

    it('should record send transaction with recipient', () => {
      const { send } = store.getState();

      send('USD', '0xRecipient123', 30);

      const transactions = store.getState().transactions;
      const sendTransaction = transactions.find((t) => t.type === 'send');

      expect(sendTransaction).toMatchObject({
        type: 'send',
        fromCurrency: 'USD',
        toAddress: '0xRecipient123',
        amount: 30,
      });
    });

    it('should handle multiple sends', () => {
      const { send } = store.getState();

      send('USD', '0xAddress1', 20);
      send('USD', '0xAddress2', 30);

      const wallet = store.getState().wallets.find((w) => w.currency === 'USD');
      expect(wallet?.balance).toBe(50);

      const transactions = store.getState().transactions;
      const sendTransactions = transactions.filter((t) => t.type === 'send');
      expect(sendTransactions).toHaveLength(2);
    });
  });

  describe('fetchExchangeRates', () => {
    it('should set loading state', async () => {
      const { fetchExchangeRates } = store.getState();

      const fetchPromise = fetchExchangeRates('USD');

      expect(store.getState().isLoadingRates).toBe(true);

      await fetchPromise;
    });

    it('should update exchange rates on success', async () => {
      const { fetchExchangeRates } = store.getState();

      // Mock successful fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              conversion_rates: { NGN: 1500, EUR: 0.92, GBP: 0.79 },
            }),
        })
      ) as any;

      await fetchExchangeRates('USD');

      const rates = store.getState().exchangeRates;
      expect(rates).toEqual({ NGN: 1500, EUR: 0.92, GBP: 0.79 });
      expect(store.getState().isLoadingRates).toBe(false);
    });

    it('should handle fetch errors gracefully', async () => {
      const { fetchExchangeRates } = store.getState();

      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;

      await fetchExchangeRates('USD');

      expect(store.getState().isLoadingRates).toBe(false);
    });
  });
});
