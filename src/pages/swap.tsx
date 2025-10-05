import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBoundStore } from '@/store';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';

const Page = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [amount, setAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const wallets = useBoundStore((state) => state.wallets);
  const exchangeRates = useBoundStore((state) => state.exchangeRates);
  const isLoadingRates = useBoundStore((state) => state.isLoadingRates);
  const fetchExchangeRates = useBoundStore((state) => state.fetchExchangeRates);
  const swap = useBoundStore((state) => state.swap);
  const fromWallet = wallets.find((w) => w.currency === fromCurrency);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExchangeRates(fromCurrency);
  }, [fromCurrency, fetchExchangeRates]);
  const rate = exchangeRates[toCurrency] || 0;
  const convertedAmount = amount ? (parseFloat(amount) * rate).toFixed(2) : '0.00';
  async function handleSwap(e: { preventDefault: () => void }) {
    e.preventDefault();
    const swapAmount = parseFloat(amount);

    if (!swapAmount || swapAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!fromWallet || fromWallet.balance < swapAmount) {
      alert('Insufficient balance');
      return;
    }

    if (fromCurrency === toCurrency) {
      alert('Please select different currencies');
      return;
    }

    if (!rate) {
      alert('Exchange rate not available');
      return;
    }

    setIsSwapping(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      swap(fromCurrency, toCurrency, swapAmount);
      setAmount('');
      navigate('/dashboard');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Swap failed');
    }

    setIsSwapping(false);
  }
  return (
    <div className="grid place-items-center">
      <h2 className="font-bold lg:text-4xl mb-10">Swap</h2>
      <h3 className="font-medium lg:text-xl mb-10 opacity-60">
        Exchange between your available currencies at live rates
      </h3>

      <form onSubmit={handleSwap} className="max-w-md space-y-6">
        <div className="space-y-3">
          <Label>From</Label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full p-2 border rounded-sm"
          >
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.currency}>
                {wallet.currency} - Balance: {wallet.balance.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <Label>Amount</Label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border rounded-sm"
          />
          {fromWallet && (
            <p className="text-sm opacity-60">Available: {fromWallet.balance.toFixed(2)}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label>To</Label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full p-2 border rounded-sm"
          >
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.currency}>
                {wallet.currency} - Balance: {wallet.balance.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {isLoadingRates ? (
          <p className="text-sm opacity-60">Loading exchange rates...</p>
        ) : rate ? (
          <div className="p-3 bg-amber-100 rounded-sm space-y-2">
            <p className="text-sm">
              Exchange Rate: 1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </p>
            <p className="font-medium">
              You will receive: {convertedAmount} {toCurrency}
            </p>
          </div>
        ) : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSwapping || isLoadingRates}>
            {isSwapping ? 'Swapping...' : 'Swap'}
          </Button>
          <Link to="/deposit" className={buttonVariants({ variant: 'outline' })}>
            Back to Deposit
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Page;
