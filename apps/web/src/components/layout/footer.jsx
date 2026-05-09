import { UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">FlavourFleet</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Delicious food delivered fast to your doorstep.
            </p>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Company</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link>
              <Link to="/careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            </nav>
          </div>

          {/* For Restaurants */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">For Restaurants</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/partner" className="text-sm text-muted-foreground hover:text-foreground">Partner With Us</Link>
              <Link to="/owner/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Restaurant Dashboard</Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Support</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FlavourFleet. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
