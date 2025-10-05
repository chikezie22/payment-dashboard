import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

import { Label } from '@/components/ui/label';
import { useBoundStore } from '@/store';
import { PopcornIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

const Page = () => {
  const [curr, setCurr] = useState('USD');
  const [open, setOpen] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const wallets = useBoundStore((state) => state.wallets);
  const deposit = useBoundStore((state) => state.deposit);
  async function handleDeposit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setIsDepositing(true);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    deposit(curr, 10);
    setIsDepositing(false);
    setOpen(false);
  }
  return (
    <div>
      <h2 className="font-bold lg:text-4xl mb-10 ">Deposit</h2>
      <h3 className="font-medium lg:text-xl mb-10 opacity-60">
        For testing purposes you can only deposit stable coin via USD alone
      </h3>
      <Alert className="mb-10">
        <PopcornIcon />
        <AlertTitle>Click the Deposit button under the usd tab to get started.</AlertTitle>
      </Alert>
      <div className="flex justify-between items-center  bg-green-400 p-2 rounded-sm">
        {wallets.map((wallet) => (
          <>
            <div
              onClick={() => setCurr(wallet.currency)}
              className={`p-2 rounded-sm flex-1 text-center ${
                wallet.currency === curr ? 'bg-white/50' : ''
              }`}
              key={wallet.id}
            >
              {wallet.currency}
            </div>
          </>
        ))}
      </div>
      {/* Show selected wallet balance */}
      <div className="mt-4 grid place-items-center gap-5 w-full">
        {wallets
          .filter((wallet) => wallet.currency === curr)
          .map((wallet) => (
            <div key={wallet.id} className="space-y-2 text-center">
              <h3 className="opacity-75">Available balance</h3>
              <h3>
                {' '}
                {wallet.currency} {wallet.balance.toFixed(2)}
              </h3>
            </div>
          ))}
        <div className="flex justify-between items-center gap-5">
          <Dialog open={open && curr === 'USD'} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              {curr === 'USD' && <Button variant="outline">Deposit</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <form onSubmit={handleDeposit}>
                <DialogHeader>
                  <DialogTitle>Add via Stable Coin</DialogTitle>
                  <DialogDescription>
                    Fund Your Account in USDT funds would arrive your US account within 5 - 10 mins
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label>Network</Label>
                    <p>BEP 20</p>
                  </div>
                  <div className="grid gap-3">
                    <Label>USDT Address</Label>
                    <p>0xE536aF7A65B20d6d4CAfA25e05A7906D09E2724b</p>
                    <Label>Fee</Label>
                    <h4>A 0.8% instant funding fee applies (minimum $2, maximum $10)</h4>
                    <Label>Demo</Label>
                    <h4>Hitting Deposit would add $10 to your US account</h4>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>{isDepositing ? 'Depositing...' : 'Deposit'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Link to="/swap" className={buttonVariants({ variant: 'secondary' })}>
            Swap
          </Link>
          <Link to="/send" className={buttonVariants({ variant: 'default' })}>
            Send
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Page;
