import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBoundStore } from '@/store';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

const Page = () => {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSending, setIsSending] = useState(false);

  const wallets = useBoundStore((state) => state.wallets);
  const send = useBoundStore((state) => state.send);
  const navigate = useNavigate();

  const selectedWallet = wallets.find((w) => w.currency === currency);

  async function handleSend(e: { preventDefault: () => void }) {
    e.preventDefault();
    const sendAmount = parseFloat(amount);

    if (!sendAmount || sendAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!selectedWallet || selectedWallet.balance < sendAmount) {
      alert('Insufficient balance');
      return;
    }

    if (!recipientAddress || recipientAddress.length < 10) {
      alert('Please enter a valid recipient address');
      return;
    }

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      send(currency, recipientAddress, sendAmount);
      setAmount('');
      setRecipientAddress('');
      alert('Transfer successful!');
      navigate('/dashboard');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Transfer failed');
    }

    setIsSending(false);
  }

  return (
    <div className="grid place-items-center">
      <h2 className="font-bold lg:text-4xl mb-10">Send</h2>
      <h3 className="font-medium lg:text-xl mb-10 opacity-60">
        Send funds cross-border to another wallet
      </h3>

      <form onSubmit={handleSend} className="max-w-md space-y-6">
        <div className="space-y-3">
          <Label>Currency</Label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
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
          <Label>Recipient Address</Label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            className="w-full p-2 border rounded-sm"
          />
          <p className="text-sm opacity-60">Enter the wallet address of the recipient</p>
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
          {selectedWallet && (
            <p className="text-sm opacity-60">
              Available: {selectedWallet.balance.toFixed(2)} {currency}
            </p>
          )}
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="p-3 bg-amber-100 rounded-sm space-y-2">
            <p className="text-sm opacity-60">Transaction Summary</p>
            <p className="font-medium">
              Sending: {parseFloat(amount).toFixed(2)} {currency}
            </p>
            <p className="text-sm">To: {recipientAddress || '...'}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send'}
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
