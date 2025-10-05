import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { useBoundStore } from '@/store';
// import { resetStore, setupWallets, mockExchangeRates } from '@/test/integration-helpers';
import { Deposit, Swap, Send, Dashboard } from '@/pages';

// / Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Wallet Flow - Integration Tests', () => {
  beforeEach(() => {
    // Reset store to initial state
    useBoundStore.setState({
      wallets: [],
      exchangeRates: {},
      isLoadingRates: false,
      transactions: [],
    });

    // Create wallets
    useBoundStore.getState().createWallet();

    // Clear mocks
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Deposit Flow', () => {
    it('should complete full deposit flow with dialog interaction', async () => {
      const user = userEvent.setup();
      render(<Deposit />);

      // Verify initial state
      expect(screen.getByRole('heading', { name: 'Deposit' })).toBeInTheDocument();
      expect(screen.getByText(/For testing purposes/i)).toBeInTheDocument();

      // Verify USD tab is selected by default
      const usdTab = screen.getByText('USD');
      expect(usdTab).toHaveClass('bg-white/50');

      // Click deposit button
      const depositButton = screen.getByRole('button', { name: /^deposit$/i });
      await user.click(depositButton);

      // Verify dialog opened
      await waitFor(() => {
        expect(screen.getByText('Add via Stable Coin')).toBeInTheDocument();
      });

      // Submit deposit
      const allDepositButtons = screen.getAllByRole('button', { name: /deposit/i });
      await user.click(allDepositButtons[allDepositButtons.length - 1]);

      // Verify depositing state
      expect(screen.getByText('Depositing...')).toBeInTheDocument();

      // Wait for deposit to complete
      await waitFor(
        () => {
          const state = useBoundStore.getState();
          const usdWallet = state.wallets.find((w) => w.currency === 'USD');
          expect(usdWallet?.balance).toBe(10);
        },
        { timeout: 6000 }
      );

      // Verify transaction recorded
      const state = useBoundStore.getState();
      expect(state.transactions).toHaveLength(1);
      expect(state.transactions[0].type).toBe('deposit');
    });

    it('should not show deposit button for non-USD currencies', async () => {
      const user = userEvent.setup();
      render(<Deposit />);

      // Click on NGN tab
      const ngnTab = screen.getByText('NGN');
      await user.click(ngnTab);

      // Verify NGN is selected
      expect(ngnTab).toHaveClass('bg-white/50');

      // Deposit button should not be visible
      expect(screen.queryByRole('button', { name: /^deposit$/i })).not.toBeInTheDocument();
    });

    it('should display correct balance after switching currencies', async () => {
      const user = userEvent.setup();

      useBoundStore.getState().deposit('USD', 50);
      useBoundStore.getState().deposit('NGN', 100);

      render(<Deposit />);

      // Check USD balance
      expect(screen.getByText(/USD.*50\.00/)).toBeInTheDocument();

      // Switch to NGN
      await user.click(screen.getByText('NGN'));

      // Check NGN balance
      expect(screen.getByText(/NGN.*100\.00/)).toBeInTheDocument();
    });
  });

  describe('Swap Flow', () => {
    it('should show loading state while fetching rates', () => {
      useBoundStore.setState({ isLoadingRates: true });

      render(<Swap />);

      expect(screen.getByText('Loading exchange rates...')).toBeInTheDocument();

      const swapButton = screen.getByRole('button', { type: 'submit' });
      expect(swapButton).toBeDisabled();
    });
  });

  describe('Send Flow', () => {
    it('should complete full send flow and navigate to dashboard', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      useBoundStore.getState().deposit('USD', 100);

      render(<Send />);

      // Verify page loaded
      expect(screen.getByRole('heading', { name: 'Send' })).toBeInTheDocument();

      // Enter recipient address
      const recipientInput = screen.getByPlaceholderText('0x...');
      await user.type(recipientInput, '0xRecipientAddress123456789');

      // Enter amount
      const amountInput = screen.getByPlaceholderText('Enter amount');
      await user.type(amountInput, '25');

      // Submit send
      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      // Wait for send to complete
      await waitFor(
        () => {
          const state = useBoundStore.getState();
          const usdWallet = state.wallets.find((w) => w.currency === 'USD');
          expect(usdWallet?.balance).toBe(75);
        },
        { timeout: 3000 }
      );

      // Verify success alert
      expect(alertSpy).toHaveBeenCalledWith('Transfer successful!');

      // Verify navigation to dashboard
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

      alertSpy.mockRestore();
    });

    it('should validate recipient address length', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      useBoundStore.getState().deposit('USD', 50);

      render(<Send />);

      const recipientInput = screen.getByPlaceholderText('0x...');
      await user.type(recipientInput, '0x123');

      const amountInput = screen.getByPlaceholderText('Enter amount');
      await user.type(amountInput, '10');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      await waitFor(
        () => {
          expect(alertSpy).toHaveBeenCalledWith('Please enter a valid recipient address');
        },
        { timeout: 500 }
      );

      alertSpy.mockRestore();
    });

    it('should validate insufficient balance', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      useBoundStore.getState().deposit('USD', 5);

      render(<Send />);

      const recipientInput = screen.getByPlaceholderText('0x...');
      await user.type(recipientInput, '0xRecipientAddress123456789');

      const amountInput = screen.getByPlaceholderText('Enter amount');
      await user.type(amountInput, '10');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      await waitFor(
        () => {
          expect(alertSpy).toHaveBeenCalledWith('Insufficient balance');
        },
        { timeout: 500 }
      );

      alertSpy.mockRestore();
    });

    it('should clear form after successful send', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      useBoundStore.getState().deposit('USD', 50);

      render(<Send />);

      const recipientInput = screen.getByPlaceholderText('0x...');
      await user.type(recipientInput, '0xRecipientAddress123');

      const amountInput = screen.getByPlaceholderText('Enter amount');
      await user.type(amountInput, '10');

      const sendButton = screen.getByRole('button', { type: 'submit' });
      await user.click(sendButton);

      await waitFor(
        () => {
          expect(recipientInput).toHaveValue('');
          expect(amountInput).toHaveValue(null);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Dashboard Integration', () => {
    it('should display all wallets with correct balances', () => {
      useBoundStore.getState().deposit('USD', 50);
      useBoundStore.getState().deposit('NGN', 100);

      render(<Dashboard />);

      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();

      // Check all wallet cards displayed
      expect(screen.getByText('USD')).toBeInTheDocument();
      expect(screen.getByText('NGN')).toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
      expect(screen.getByText('GBP')).toBeInTheDocument();
    });

    it('should show no transactions message when empty', () => {
      render(<Dashboard />);

      expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument();
      expect(screen.queryByText('Recent Transactions')).not.toBeInTheDocument();
    });

    it('should display recent transactions after deposits', () => {
      useBoundStore.getState().deposit('USD', 50);
      useBoundStore.getState().deposit('EUR', 30);

      render(<Dashboard />);

      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();

      // Check for deposit transaction descriptions
      expect(screen.getByText(/Deposited 50.00 USD/i)).toBeInTheDocument();
      expect(screen.getByText(/Deposited 30.00 EUR/i)).toBeInTheDocument();
    });

    it('should display swap transactions with conversion details', () => {
      useBoundStore.setState({ exchangeRates: { NGN: 1500 } });
      useBoundStore.getState().deposit('USD', 100);
      useBoundStore.getState().swap('USD', 'NGN', 10);

      render(<Dashboard />);

      expect(screen.getByText('swap')).toBeInTheDocument();
      expect(screen.getByText(/Swapped 10.00 USD to 15000.0+ NGN/i)).toBeInTheDocument();
    });

    it('should display send transactions with truncated address', () => {
      useBoundStore.getState().deposit('USD', 100);
      useBoundStore.getState().send('USD', '0xRecipientAddress123456789', 25);

      render(<Dashboard />);

      expect(screen.getByText('send')).toBeInTheDocument();
      expect(screen.getByText(/Sent 25.00 USD to 0xRecipien/i)).toBeInTheDocument();
    });

    it('should limit transactions to 10 most recent', () => {
      // Add 15 transactions
      for (let i = 0; i < 15; i++) {
        useBoundStore.getState().deposit('USD', 1);
      }

      render(<Dashboard />);

      const rows = screen.getAllByRole('row');
      // 1 header + 10 data rows = 11
      expect(rows).toHaveLength(11);
    });

    it('should color-code transaction amounts', () => {
      useBoundStore.getState().deposit('USD', 50);
      useBoundStore.getState().send('USD', '0xAddress123', 10);

      render(<Dashboard />);

      const depositAmount = screen.getByText(/\+50.00 USD/i);
      expect(depositAmount).toHaveClass('text-green-600');

      const sendAmount = screen.getByText(/-10.00 USD/i);
      expect(sendAmount).toHaveClass('text-red-600');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across multiple operations', async () => {
      // Perform multiple operations
      useBoundStore.getState().deposit('USD', 100);
      useBoundStore.getState().deposit('EUR', 50);

      useBoundStore.setState({ exchangeRates: { NGN: 1500, GBP: 0.79 } });
      useBoundStore.getState().swap('USD', 'NGN', 20);
      useBoundStore.getState().swap('EUR', 'GBP', 10);

      useBoundStore.getState().send('USD', '0xAddr1', 15);
      useBoundStore.getState().send('NGN', '0xAddr2', 5000);

      const state = useBoundStore.getState();

      // Verify transaction count
      expect(state.transactions).toHaveLength(6);

      // Verify balances
      const usdWallet = state.wallets.find((w) => w.currency === 'USD');
      const eurWallet = state.wallets.find((w) => w.currency === 'EUR');
      const ngnWallet = state.wallets.find((w) => w.currency === 'NGN');
      const gbpWallet = state.wallets.find((w) => w.currency === 'GBP');

      expect(usdWallet?.balance).toBe(65); // 100 - 20 - 15
      expect(eurWallet?.balance).toBe(40); // 50 - 10
      expect(ngnWallet?.balance).toBe(25000); // 20 * 1500 - 5000
      expect(gbpWallet?.balance).toBeCloseTo(7.9, 1); // 10 * 0.79

      // Verify transaction types
      expect(state.transactions.filter((t) => t.type === 'deposit')).toHaveLength(2);
      expect(state.transactions.filter((t) => t.type === 'swap')).toHaveLength(2);
      expect(state.transactions.filter((t) => t.type === 'send')).toHaveLength(2);
    });
  });
});
