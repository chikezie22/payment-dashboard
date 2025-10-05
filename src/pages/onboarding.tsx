import { ModeToggle } from '@/components/mode-toggle';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBoundStore } from '@/store';
import { useState } from 'react';
import { Link } from 'react-router';

const Page = () => {
  const [email, setEmail] = useState('');
  const creatWallet = useBoundStore((state) => state.createWallet);
  const createEmail = useBoundStore((state) => state.setEmail);

  return (
    <div className="relative p-4">
      <ModeToggle />
      <div className="min-h-screen grid place-items-center ">
        <div className="max-w-4xl  mx-auto  text-center">
          <form className="space-y-3">
            <h1 className="font-bold lg:text-4xl text-2xl"> Create Your Wallet</h1>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Link
              onClick={() => {
                createEmail(email);
                creatWallet();
              }}
              to="/dashboard"
              className={buttonVariants({
                variant: 'default',
              })}
            >
              Create Wallet
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
