import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageSpinner, Spinner } from '@/components/ui/spinner';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

const statusSteps = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const order = data?.order;

  // Real-time updates via socket
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    socket.emit('order:join', id);

    socket.on('order:status_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    });

    socket.on('rider:location', () => {
      // Future: update map marker
    });

    return () => {
      socket.emit('order:leave', id);
      socket.off('order:status_updated');
      socket.off('rider:location');
    };
  }, [id, queryClient]);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/orders/${id}/cancel`, { reason: 'Changed my mind' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!order) return <div className="container py-20 text-center text-muted-foreground">Order not found</div>;

  const currentStepIndex = statusSteps.indexOf(order.status);
  const canCancel = ['placed', 'confirmed'].includes(order.status);

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNo}</h1>
          <p className="text-sm text-muted-foreground">
            Placed on {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <Badge
          variant={
            order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'destructive' : 'default'
          }
          className="text-sm"
        >
          {order.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Status Tracker */}
      {order.status !== 'cancelled' && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => {
                const reached = i <= currentStepIndex;
                return (
                  <div key={step} className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {reached ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className="mt-1 text-[10px] capitalize text-muted-foreground">
                      {step.replace(/_/g, ' ')}
                    </span>
                    {i < statusSteps.length - 1 && (
                      <div className="absolute" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.pricing?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatPrice(order.pricing?.deliveryFee || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(order.pricing?.taxAmount || 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.pricing?.grandTotal || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p>{order.deliveryAddress?.street}</p>
                <p className="text-muted-foreground">
                  {order.deliveryAddress?.area}, {order.deliveryAddress?.city}
                </p>
              </div>
            </div>
            {order.estimatedDeliveryAt && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Estimated: {format(new Date(order.estimatedDeliveryAt), 'h:mm a')}
                </span>
              </div>
            )}
            {order.specialInstructions && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="font-medium text-xs text-muted-foreground mb-1">Special Instructions</p>
                {order.specialInstructions}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Timeline */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.statusTimeline?.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {i < order.statusTimeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium capitalize">{entry.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                  </p>
                  {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {canCancel && (
        <div className="mt-6">
          <Button
            variant="destructive"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? <Spinner size="sm" className="mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
            Cancel Order
          </Button>
        </div>
      )}
    </div>
  );
}
