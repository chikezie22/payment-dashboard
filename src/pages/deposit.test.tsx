/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useBoundStore } from '@/store';
import { Deposit as Page } from '.';

// Mock Zustand store
vi.mock('@/store', () => ({
  useBoundStore: vi.fn(),
}));

describe('Deposit Page', () => {
  const mockDeposit = vi.fn();
  const mockWallets = [
    { id: '1', currency: 'USD', balance: 0, address: '0x123' },
    { id: '2', currency: 'NGN', balance: 0, address: '0x456' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useBoundStore as any).mockImplementation((selector: any) =>
      selector({
        wallets: mockWallets,
        deposit: mockDeposit,
      })
    );
  });

  it('renders Deposit title and info text', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { name: 'Deposit' })).toBeInTheDocument();
    expect(screen.getByText(/you can only deposit stable coin via USD alone/i)).toBeInTheDocument();
  });

  it('displays wallet tabs (USD, NGN)', () => {
    render(<Page />);

    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('NGN')).toBeInTheDocument();
  });

  it('shows balance for the selected currency', () => {
    render(<Page />);

    expect(screen.getByText('Available balance')).toBeInTheDocument();
    expect(screen.getByText(/USD 0.00/)).toBeInTheDocument();
  });

  it('opens deposit dialog when Deposit button is clicked (USD only)', async () => {
    const user = userEvent.setup();
    render(<Page />);

    const depositBtn = screen.getByRole('button', { name: 'Deposit' });
    await user.click(depositBtn);

    expect(await screen.findByText('Add via Stable Coin')).toBeInTheDocument();
    expect(screen.getByText(/Fund Your Account in USDT funds would arrive/i)).toBeInTheDocument();
  });

  it('does NOT open deposit dialog when NGN is selected', async () => {
    const user = userEvent.setup();
    render(<Page />);

    const ngnTab = screen.getByText('NGN');
    await user.click(ngnTab);

    // Try clicking deposit — should not open dialog for NGN
    const depositBtn = screen.queryByRole('button', { name: 'Deposit' });
    if (depositBtn) await user.click(depositBtn);

    expect(screen.queryByText('Add via Stable Coin')).not.toBeInTheDocument();
  });

  it('shows "Depositing..." while waiting, then calls deposit()', async () => {
    const user = userEvent.setup();
    render(<Page />);

    const depositBtn = screen.getByRole('button', { name: 'Deposit' });
    await user.click(depositBtn);

    // Wait for dialog to open fully
    await waitFor(() => {
      expect(screen.getByText('Add via Stable Coin')).toBeInTheDocument();
    });

    // Click the Deposit button inside the dialog
    const dialog = await screen.findByRole('dialog');
    const dialogDepositBtn = within(dialog).getByRole('button', { name: 'Deposit' });
    await user.click(dialogDepositBtn);

    // Verify loading state
    expect(screen.getByText('Depositing...')).toBeInTheDocument();

    // Wait until deposit() is called
    await waitFor(
      () => {
        expect(mockDeposit).toHaveBeenCalledWith('USD', 10);
      },
      { timeout: 10000 }
    );
  });
});
