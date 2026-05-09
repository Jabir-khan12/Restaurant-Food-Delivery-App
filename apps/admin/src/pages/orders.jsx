import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export default function AdminOrdersPage() {
  const { data } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      // This would typically use a separate admin endpoint
      const res = await api.get('/orders/stats');
      return res.data.data;
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold">Orders Management</h2>
      <p className="mt-1 text-muted-foreground">View and manage all orders across the platform</p>

      <div className="mt-6 rounded-lg border bg-card">
        <div className="p-6">
          <p className="text-muted-foreground">
            Order management table with search, filter by status, date range, and restaurant.
            Connects to the existing orders API endpoints.
          </p>
          {data?.stats?.byStatus && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.stats.byStatus.map((s) => (
                <div key={s._id} className="rounded-md border p-4">
                  <p className="text-sm capitalize text-muted-foreground">{s._id.replace(/_/g, ' ')}</p>
                  <p className="mt-1 text-2xl font-bold">{s.count}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
