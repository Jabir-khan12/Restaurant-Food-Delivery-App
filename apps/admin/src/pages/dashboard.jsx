import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { cn, formatPrice } from '@/lib/utils';
import { ShoppingBag, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/orders/stats');
      return res.data.data;
    },
  });

  const stats = data?.stats;

  const cards = [
    {
      label: 'Total Revenue',
      value: stats?.revenue?.[0]?.total ? formatPrice(stats.revenue[0].total) : 'Rs. 0',
      icon,
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    {
      label: 'Total Orders',
      value: String(stats?.revenue?.[0]?.count || 0),
      icon,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    {
      label: 'Avg Order Value',
      value: stats?.revenue?.[0]?.averageOrderValue
        ? formatPrice(Math.round(stats.revenue[0].averageOrderValue))
        : 'Rs. 0',
      icon,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
    {
      label: 'Cancel Rate',
      value: stats?.cancellationRate?.[0]
        ? `${((stats.cancellationRate[0].cancelledCount / stats.cancellationRate[0].totalCount) * 100).toFixed(1)}%`
        : '0%',
      icon,
      color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    },
  ];

  const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#06b6d4', '#f97316', '#22c55e', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-bold">{isLoading ? '...' : card.value}</p>
              </div>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', card.color)}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Orders by Status</h3>
          {stats?.byStatus && stats.byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.byStatus.map((s) => ({ name: s._id, value: s.count }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.byStatus.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-muted-foreground">No order data yet</p>
          )}
        </div>

        {/* Daily Revenue */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Daily Revenue (Last 30 Days)</h3>
          {stats?.dailyRevenue && stats.dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100).toFixed(0)}`} />
                <Tooltip formatter={(v) => formatPrice(v)} />
                <Bar dataKey="revenue" fill="hsl(222.2, 47.4%, 11.2%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-muted-foreground">No revenue data yet</p>
          )}
        </div>
      </div>

      {/* Top Items */}
      {stats?.topItems && stats.topItems.length > 0 && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Top Ordered Items</h3>
          <div className="space-y-3">
            {stats.topItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">{item._id}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
