import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useCartStore } from '@/stores/cart.store';
import { api } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

const checkoutSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  area: z.string().min(1, 'Area is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional(),
  specialInstructions: z.string().optional(),
});


export default function CheckoutPage() {
  const { items, restaurantId, subtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const total = subtotal();
  const deliveryFee = total > 200000 ? 0 : 15000;
  const tax = Math.round(total * 0.16);
  const grandTotal = total + deliveryFee + tax;

  const {
    register,
    handleSubmit,
    formState,
  } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/orders', {
        restaurantId,
        deliveryAddress,
        paymentMethod: 'cod',
        specialInstructions: data.specialInstructions,
      });
      return res.data;
    },
    onSuccess: (data) => {
      clearCart();
      navigate(`/orders/${data.data.order._id}`, { replace: true });
    },
  });

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-1 text-muted-foreground">Confirm your delivery details and place order</p>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="mt-8 space-y-6">
        {mutation.isError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {(mutation.error)?.response?.data?.error?.message || 'Failed to place order. Please try again.'}
          </div>
        )}

        {/* Delivery Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input id="street" placeholder="123 Main Street, Apt 4B" {...register('street')} />
              {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="area">Area / Locality</Label>
                <Input id="area" placeholder="Clifton" {...register('area')} />
                {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Karachi" {...register('city')} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code (optional)</Label>
              <Input id="postalCode" placeholder="74000" {...register('postalCode')} />
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              {...register('specialInstructions')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Any special requests for the restaurant or rider..."
            />
          </CardContent>
        </Card>

        {/* Payment (COD for now) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-md border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                ₹
              </div>
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.itemId} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(grandTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? <Spinner size="sm" className="mr-2" /> : null}
          Place Order — {formatPrice(grandTotal)}
        </Button>
      </form>
    </div>
  );
}
