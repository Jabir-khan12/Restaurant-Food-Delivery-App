import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Clock, UtensilsCrossed, Bike, Star } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/restaurants?q=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-32">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Delicious Food,
            <span className="text-primary"> Delivered Fast</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Order from the best local restaurants with easy, on-demand delivery.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or cuisines..."
                className="flex h-12 w-full rounded-lg border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16">
        <h2 className="text-center text-3xl font-bold">How It Works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            { icon, title: 'Choose Location', desc: 'Enter your delivery address to find nearby restaurants' },
            { icon, title: 'Pick Your Meal', desc: 'Browse menus, customize your order with add-ons' },
            { icon, title: 'Fast Delivery', desc: 'Track your rider in real-time food arrives' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular cuisines */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <h2 className="text-center text-3xl font-bold">Popular Cuisines</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {['Pakistani', 'Chinese', 'Fast Food', 'BBQ', 'Biryani', 'Pizza', 'Desserts', 'Healthy'].map(
              (cuisine) => (
                <Link
                  key={cuisine}
                  to={`/restaurants?cuisine=${encodeURIComponent(cuisine)}`}
                  className="rounded-full border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {cuisine}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-16 text-center">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon, stat: '500+', label: 'Restaurants' },
            { icon, stat: '50K+', label: 'Happy Customers' },
            { icon, stat: '30 min', label: 'Avg Delivery Time' },
          ].map(({ icon, stat, label }) => (
            <div key={label}>
              <Icon className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-3xl font-bold">{stat}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Ready to Order?</h2>
          <p className="mt-2 text-primary-foreground/80">
            Join thousands of food lovers. Sign up now!
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
