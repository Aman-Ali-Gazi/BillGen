import { useMemo } from 'react';
import { Receipt, ReceiptStats, receiptCategories } from '@/types/receipt';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, FileText, Store, Calendar } from 'lucide-react';

interface DashboardProps {
  receipts: Receipt[];
}

export function Dashboard({ receipts }: DashboardProps) {
  const stats: ReceiptStats = useMemo(() => {
    if (receipts.length === 0) {
      return {
        totalReceipts: 0,
        totalAmount: 0,
        averageAmount: 0,
        medianAmount: 0,
        topVendor: '',
        currentMonthSpend: 0,
        lastMonthSpend: 0,
        categoryBreakdown: {},
        monthlyTrend: []
      };
    }

    // Basic aggregations
    const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
    const averageAmount = totalAmount / receipts.length;
    
    // Median calculation (optimized sorting)
    const sortedAmounts = [...receipts].sort((a, b) => a.amount - b.amount);
    const medianAmount = receipts.length % 2 === 0
      ? (sortedAmounts[receipts.length / 2 - 1].amount + sortedAmounts[receipts.length / 2].amount) / 2
      : sortedAmounts[Math.floor(receipts.length / 2)].amount;

    // Vendor frequency analysis
    const vendorCounts = receipts.reduce((acc, receipt) => {
      acc[receipt.vendor] = (acc[receipt.vendor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topVendor = Object.entries(vendorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Monthly calculations
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthSpend = receipts
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + r.amount, 0);

    const lastMonthSpend = receipts
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, r) => sum + r.amount, 0);

    // Category breakdown
    const categoryBreakdown = receipts.reduce((acc, receipt) => {
      acc[receipt.category] = (acc[receipt.category] || 0) + receipt.amount;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const monthStr = targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthSpend = receipts
        .filter(r => {
          const receiptDate = new Date(r.date);
          return receiptDate.getMonth() === targetDate.getMonth() && 
                 receiptDate.getFullYear() === targetDate.getFullYear();
        })
        .reduce((sum, r) => sum + r.amount, 0);
      
      monthlyTrend.push({ month: monthStr, amount: monthSpend });
    }

    return {
      totalReceipts: receipts.length,
      totalAmount,
      averageAmount,
      medianAmount,
      topVendor,
      currentMonthSpend,
      lastMonthSpend,
      categoryBreakdown,
      monthlyTrend
    };
  }, [receipts]);

  const monthlyChange = stats.lastMonthSpend > 0 
    ? ((stats.currentMonthSpend - stats.lastMonthSpend) / stats.lastMonthSpend) * 100 
    : 0;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue,
    className = ""
  }: {
    title: string;
    value: string;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
  }) => (
    <Card className={`p-6 shadow-card hover:shadow-elegant transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 mt-1 text-sm ${
              trend === 'up' ? 'text-accent' : 
              trend === 'down' ? 'text-destructive' : 
              'text-muted-foreground'
            }`}>
              {trend === 'up' && <TrendingUp className="h-4 w-4" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gradient-primary rounded-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Receipts"
          value={stats.totalReceipts.toString()}
          icon={FileText}
        />
        <StatCard
          title="Total Spent"
          value={`$${stats.totalAmount.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Average Amount"
          value={`$${stats.averageAmount.toFixed(2)}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Top Vendor"
          value={stats.topVendor || 'N/A'}
          icon={Store}
        />
      </div>

      {/* Monthly Comparison */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Monthly Spending</h3>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold text-primary">${stats.currentMonthSpend.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Last Month</p>
            <p className="text-2xl font-bold">${stats.lastMonthSpend.toFixed(2)}</p>
            {stats.lastMonthSpend > 0 && (
              <div className={`flex items-center space-x-1 text-sm ${
                monthlyChange > 0 ? 'text-destructive' : 
                monthlyChange < 0 ? 'text-accent' : 
                'text-muted-foreground'
              }`}>
                {monthlyChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(monthlyChange).toFixed(1)}% {monthlyChange > 0 ? 'increase' : 'decrease'}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        <div className="space-y-3">
          {Object.entries(stats.categoryBreakdown)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([category, amount]) => {
              const percentage = (amount / stats.totalAmount) * 100;
              const categoryInfo = receiptCategories[category];
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${categoryInfo?.color || 'bg-muted'}`} />
                    <span className="font-medium">{categoryInfo?.name || category}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Spending Trend */}
      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">6-Month Spending Trend</h3>
        <div className="space-y-3">
          {stats.monthlyTrend.map((month, index) => {
            const maxAmount = Math.max(...stats.monthlyTrend.map(m => m.amount));
            const barWidth = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
            
            return (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{month.month}</span>
                  <span className="text-muted-foreground">${month.amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}