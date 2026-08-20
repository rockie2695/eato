/**
 * Home Page.
 *
 * Landing page with hero section, featured items, and call-to-action.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Clock, UtensilsCrossed, Smartphone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { menuApi } from '@/lib/api';
import { formatPrice, formatPrepTime } from '@eato/shared/utils';
import type { MenuItemWithCategory } from '@eato/shared/types';

export function HomePage() {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState<MenuItemWithCategory[]>([]);

  useEffect(() => {
    menuApi.getFeatured().then(setFeaturedItems).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-orange-500/5 py-20 lg:py-32">
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              🍽️ Smart Restaurant Ordering
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Order Food{' '}
              <span className="gradient-text">Effortlessly</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Scan, order, and enjoy. Eato makes restaurant dining seamless with
              real-time order tracking, easy payments, and a beautiful menu experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" onClick={() => navigate('/menu')}>
                Browse Menu
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Eato?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a seamless restaurant experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Scan & Order</h3>
                <p className="text-muted-foreground">
                  Simply scan the QR code at your table to access the full menu and order instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
                <p className="text-muted-foreground">
                  Know exactly when your order is being prepared, ready, and served.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Payments</h3>
                <p className="text-muted-foreground">
                  Pay online with Stripe or settle up with cash when your meal is served.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="py-20">
          <div className="container px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Featured Dishes</h2>
                <p className="text-muted-foreground">
                  Our most popular items
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/menu')}>
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.slice(0, 4).map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => navigate('/menu')}
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-5xl">🍽️</span>
                    )}
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(item.price)}
                      </span>
                      {item.preparationTime && (
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatPrepTime(item.preparationTime)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container px-4 text-center">
          <UtensilsCrossed className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Order?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Experience the future of restaurant ordering. Fast, easy, and delicious.
          </p>
          <Button
            size="xl"
            variant="secondary"
            onClick={() => navigate('/menu')}
          >
            Start Ordering
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
