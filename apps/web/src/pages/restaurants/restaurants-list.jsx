import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/ui/spinner';
import { Star, Clock, MapPin, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';


export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const cuisine = searchParams.get('cuisine') || '';
  const [search, setSearch] = useState(q);

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', q, cuisine],
    queryFn: async () => {
      const params = {};
      if (q) params.q = q;
      if (cuisine) params.cuisine = cuisine;
      const res = await api.get('/restaurants/search', { params });
      return res.data;
    },
  });

  const restaurants = data?.data?.restaurants || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(search ? { q: search } : {});
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {cuisine ? `${cuisine} Restaurants` : 'All Restaurants'}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {q && `Search results for "${q}"`}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Cuisine chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['Pakistani', 'Chinese', 'Fast Food', 'BBQ', 'Biryani', 'Pizza'].map((c) => (
          <button
            key={c}
            onClick={() => setSearchParams(cuisine === c ? {} : { cuisine: c })}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              cuisine === c
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && <PageSpinner />}

      {!isLoading && restaurants.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No restaurants found</p>
          <Button variant="outline" className="mt-4" onClick={() => setSearchParams({})}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Restaurant Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((r) => (
          <Link key={r._id} to={`/restaurants/${r.slug}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-lg">
              {/* Cover image */}
              <div className="relative h-48 bg-muted">
                {r.coverImage ? (
                  <img src={r.coverImage} alt={r.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
                )}
                {!r.isOpen && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="rounded-full bg-destructive px-4 py-1 text-sm font-medium text-white">
                      Closed
                    </span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{r.name}</h3>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{r.description}</p>
                  </div>
                  {r.avgRating > 0 && (
                    <div className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                      <Star className="h-3 w-3 fill-current" />
                      {r.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {r.cuisine.slice(0, 3).map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {r.estimatedPrepTime} min
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.address?.area}
                  </span>
                  <span>Min: {formatPrice(r.minOrderValue)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
