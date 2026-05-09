import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageSpinner } from '@/components/ui/spinner';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/lib/utils';
import { Star, Clock, Plus } from 'lucide-react';
import { useState } from 'react';


export default function RestaurantDetailPage() {
  const { slug } = useParams();
  const addItem = useCartStore((s) => s.addItem);

  const { data: restaurantData, isLoading: loadingRestaurant } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const res = await api.get(`/restaurants/slug/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  const restaurant = restaurantData?.restaurant;

  const { data: categoriesData } = useQuery({
    queryKey: ['menu-categories', restaurant?._id],
    queryFn: async () => {
      const res = await api.get(`/menu/${restaurant._id}/categories`);
      return res.data.data;
    },
    enabled: !!restaurant?._id,
  });

  const { data: menuData } = useQuery({
    queryKey: ['menu-items', restaurant?._id],
    queryFn: async () => {
      const res = await api.get(`/menu/${restaurant._id}/items`);
      return res.data.data;
    },
    enabled: !!restaurant?._id,
  });

  const categories = categoriesData?.categories || [];
  const menuItems = menuData?.items || [];
  const [activeCategory, setActiveCategory] = useState(null);

  const filteredItems = activeCategory
    ? menuItems.filter((item) => item.categoryId === activeCategory)
    : menuItems;

  const handleAddToCart = (item) => {
    if (!restaurant) return;
    addItem(restaurant._id, restaurant.name, {
      itemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      modifiers: [],
    });
  };

  if (loadingRestaurant) return <PageSpinner />;
  if (!restaurant) return <div className="container py-20 text-center text-muted-foreground">Restaurant not found</div>;

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 bg-muted md:h-80">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container pb-6 text-white">
          <h1 className="text-3xl font-bold md:text-4xl">{restaurant.name}</h1>
          <p className="mt-1 text-white/80">{restaurant.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {restaurant.avgRating > 0 && (
              <Badge variant="success" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                {restaurant.avgRating.toFixed(1)} ({restaurant.totalReviews})
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {restaurant.estimatedPrepTime} min
            </Badge>
            {restaurant.cuisine.map((c) => (
              <Badge key={c} variant="outline" className="border-white/30 text-white">
                {c}
              </Badge>
            ))}
            {!restaurant.isOpen && <Badge variant="destructive">Closed</Badge>}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <h3 className="mb-3 font-semibold">Menu</h3>
            <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              <button
                onClick={() => setActiveCategory(null)}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${
                  !activeCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveCategory(cat._id)}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    activeCategory === cat._id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Menu Items Grid */}
          <div className="lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredItems.map((item) => (
                <Card key={item._id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}>
                  <CardContent className="flex gap-4 p-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                      )}
                      <p className="mt-2 font-semibold text-primary">{formatPrice(item.price)}</p>
                      {item.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                      )}
                      <Button
                        size="sm"
                        disabled={!item.isAvailable || !restaurant.isOpen}
                        onClick={() => handleAddToCart(item)}
                        className="mt-2"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <p className="py-10 text-center text-muted-foreground">No items in this category</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
