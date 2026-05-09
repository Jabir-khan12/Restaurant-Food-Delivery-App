import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSpinner } from '@/components/ui/spinner';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { Package } from 'lucide-react';

const statusColors = {
  placed: 'warning',
  confirmed: 'default',
  preparing: 'default',
  ready: 'secondary',
  picked_up: 'default',
  on_the_way: 'default',
  delivered: 'success',
  cancelled: 'destructive',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/my');
      return res.data;
    },
  });

  const orders = data?.data?.orders || [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <p className="mt-1 text-muted-foreground">Track and view your order history</p>

      {orders.length === 0 && (
        <div className="flex flex-col items-center py-20">
          <Package className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">No Orders Yet</h2>
          <p className="mt-2 text-muted-foreground">Your order history will appear here</p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <Link key={order._id} to={`/orders/${order._id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{order.orderNo}</h3>
                    <Badge variant={statusColors[order.status] || 'secondary'}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.items?.length || 0} items &bull;{' '}
                    {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {formatPrice(order.pricing?.grandTotal || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
