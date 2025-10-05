import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useBoundStore } from '@/store';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';

const Analytics = () => {
  const wallets = useBoundStore((state) => state.wallets);
  const transactions = useBoundStore((state) => state.transactions);
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
  // transactions last 7days
  const getVolumeOverTime = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const dayTransactions = transactions.filter((t) => t.timeStamp.split('T')[0] === date);
      const volume = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: parseFloat(volume.toFixed(2)),
      };
    });
  };
  //  Transaction Breakdown by Type
  const getTransactionBreakdown = () => {
    const breakdown = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  };

  //  Wallet Balances
  const getBalanceData = () => {
    return wallets.map((wallet) => ({
      currency: wallet.currency,
      balance: parseFloat(wallet.balance.toFixed(2)),
    }));
  };

  //  Most Active Swap Pairs
  const getSwapPairs = () => {
    const swapTransactions = transactions.filter((t) => t.type === 'swap');
    const pairs = swapTransactions.reduce((acc, t) => {
      if (t.fromCurrency && t.toCurrency) {
        const pair = `${t.fromCurrency}/${t.toCurrency}`;
        acc[pair] = (acc[pair] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(pairs)
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const volumeData = getVolumeOverTime();
  const breakdownData = getTransactionBreakdown();
  const balanceData = getBalanceData();
  const swapPairs = getSwapPairs();

  if (transactions.length === 0) {
    return (
      <div className="border rounded-sm shadow-sm p-8 text-center opacity-60">
        <p>No transaction data available yet. Start trading to see analytics!</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h3 className="font-bold lg:text-3xl mb-6">FX Analytics</h3>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Transaction Volume Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Volume (USD)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const { name, percent } = props;
                    return `${name}: ${((percent as number) * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {breakdownData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wallet Balances */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balances by Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={balanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="currency" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="balance" fill="#3b82f6" name="Balance" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Active Swap Pairs */}
        {swapPairs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Most Active Swap Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={swapPairs} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="pair" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Swaps" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm opacity-60">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm opacity-60">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {transactions.filter((t) => t.type === 'deposit').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm opacity-60">Total Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {transactions.filter((t) => t.type === 'swap').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm opacity-60">Total Sends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {transactions.filter((t) => t.type === 'send').length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
