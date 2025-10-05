import { buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useBoundStore } from '@/store';
import { Link } from 'react-router';
import type { Transaction } from '@/store/slices/wallet-slice';
import Analytics from '@/components/analytics';
const Page = () => {
  const wallets = useBoundStore((state) => state.wallets);
  const transactions = useBoundStore((state) => state.transactions);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime())
    .slice(0, 10);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'deposit':
        return `Deposited ${transaction.amount.toFixed(2)} ${transaction.fromCurrency}`;
      case 'swap':
        return `Swapped ${transaction.amount.toFixed(2)} ${
          transaction.fromCurrency
        } to ${transaction.convertedAmount?.toFixed(2)} ${transaction.toCurrency}`;
      case 'send':
        return `Sent ${transaction.amount.toFixed(2)} ${
          transaction.fromCurrency
        } to ${transaction.toAddress?.slice(0, 10)}...`;
      default:
        return 'Unknown transaction';
    }
  };
  return (
    <div>
      <h2 className="font-bold lg:text-4xl mb-20 ">Dashboard</h2>
      <div className="space-y-5 border py-2 px-4 rounded-sm shadow-sm mb-5 ">
        <p className="lg:text-2xl ">Balance</p>
        <div className="grid lg:grid-cols-4 gap-2.5 sm:grid-cols-2 ">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="">
              <CardHeader>
                <CardTitle>{wallet.currency}</CardTitle>
              </CardHeader>
              <CardContent>{wallet.balance}</CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="space-x-5">
        <Link
          to="/deposit"
          className={buttonVariants({
            variant: 'default',
          })}
        >
          Deposit
        </Link>
        <Link
          to="/swap"
          className={buttonVariants({
            variant: 'outline',
          })}
        >
          Swap
        </Link>
      </div>
      {recentTransactions.length > 0 && (
        <div className="border rounded-sm shadow-sm">
          <div className="p-4">
            <h3 className="font-semibold lg:text-2xl mb-4">Recent Transactions</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium capitalize">{transaction.type}</TableCell>
                  <TableCell>{getTransactionDescription(transaction)}</TableCell>
                  <TableCell className="text-sm opacity-60">
                    {formatDate(transaction.timeStamp)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        transaction.type === 'deposit'
                          ? 'text-green-600'
                          : transaction.type === 'send'
                          ? 'text-red-600'
                          : ''
                      }
                    >
                      {transaction.type === 'deposit'
                        ? '+'
                        : transaction.type === 'send'
                        ? '-'
                        : ''}
                      {transaction.amount.toFixed(2)} {transaction.fromCurrency}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {recentTransactions.length === 0 && (
        <div className="border rounded-sm shadow-sm p-8 text-center opacity-60">
          <p>No transactions yet. Start by depositing funds!</p>
        </div>
      )}
      <Analytics />
    </div>
  );
};

export default Page;
