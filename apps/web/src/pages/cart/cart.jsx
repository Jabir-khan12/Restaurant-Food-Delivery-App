import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, restaurantName, updateQuantity, removeItem, clearCart, subtotal, itemCount } =
    useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const total = subtotal();
  const deliveryFee = total > 200000 ? 0 : 15000; // Free above 2000 PKR
  const tax = Math.round(total * 0.16);
  const grandTotal = total + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold">Your Cart is Empty</h2>
        <p className="mt-2 text-muted-foreground">Looks like you haven't added anything yet</p>
        <Button asChild className="mt-6">
          <Link to="/restaurants">Browse Restaurants</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <h1 className="text-3xl font-bold">Your Cart</h1>
      <p className="mt-1 text-muted-foreground">
        From <span className="font-medium text-foreground">{restaurantName}</span>
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const modifierTotal = item.modifiers.reduce((s, m) => s + m.price, 0);
            const lineTotal = (item.price + modifierTotal) * item.quantity;
            return (
              <Card key={item.itemId}>
                <CardContent className="flex items-center gap-4 p-4">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {item.modifiers.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-semibold text-primary">{formatPrice(lineTotal)}</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.itemId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          <Button variant="outline" size="sm" onClick={clearCart} className="text-destructive">
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({itemCount()} items)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (16%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </CardContent>
            <CardFooter>
              {isAuthenticated ? (
                <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout
                </Button>
              ) : (
                <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                  Sign in to Checkout
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
