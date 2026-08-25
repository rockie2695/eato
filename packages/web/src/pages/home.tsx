/**
 * Home Page.
 *
 * Premium landing page with hero, features, carousel, how-it-works, and CTA.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  Clock,
  UtensilsCrossed,
  Smartphone,
  ChefHat,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  QrCode,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HomeSkeleton } from '@/components/ui/home-skeleton';
import { menuApi } from '@/lib/api';
import { formatPrice, formatPrepTime } from '@eato/shared/utils';
import type { MenuItemWithCategory } from '@eato/shared/types';

const STATS = [
  { label: 'Dishes', value: '500+' },
  { label: 'Orders', value: '10k+' },
  { label: 'Rating', value: '4.9' },
];

const FEATURES = [
  {
    icon: QrCode,
    title: 'Scan & Order',
    description:
      'Scan the QR code at your table to instantly access the full menu and place your order.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Real-time order tracking so you know exactly when your meal is being prepared and served.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description:
      'Pay online with Stripe or settle with cash — flexible, safe, and hassle-free.',
  },
];

const STEPS = [
  {
    icon: Smartphone,
    title: 'Scan QR Code',
    description: 'Open your camera and scan the table QR code to start ordering.',
  },
  {
    icon: ChefHat,
    title: 'Choose Your Meal',
    description: 'Browse our curated menu and add your favorites to the cart.',
  },
  {
    icon: MapPin,
    title: 'Enjoy & Pay',
    description: 'We bring the food to you. Pay seamlessly when you\'re ready.',
  },
];

const FLOATING_EMOJIS = ['🍕', '🍔', '🍣', '🌮', '🥗', '🍜'];

export function HomePage() {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState<MenuItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    menuApi
      .getFeatured()
      .then(setFeaturedItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const amount = 340;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="flex flex-col">
      {/* ─── Hero Section ─── */}
      <section className="hero-gradient relative overflow-hidden bg-background py-24 lg:py-36">
        {/* Floating food emojis */}
        {FLOATING_EMOJIS.map((emoji, i) => (
          <span
            key={i}
            className="pointer-events-none absolute select-none text-4xl lg:text-5xl opacity-20 animate-float"
            style={{
              top: `${10 + Math.random() * 50}%`,
              left: `${5 + (i * 15)}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${5 + i * 0.5}s`,
            }}
          >
            {emoji}
          </span>
        ))}

        {/* Blurred orbs */}
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-orange-500/8 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

        <div className="container relative z-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in-down">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Smart Restaurant Ordering
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
              Delicious Food,{' '}
              <span className="gradient-text-animated">Delivered Fast</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              Scan, order, and enjoy. Eato makes restaurant dining seamless with
              real-time tracking, easy payments, and a beautiful menu.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button size="xl" variant="gradient" onClick={() => navigate('/menu')}>
                Browse Menu
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="xl" variant="outline" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex justify-center gap-10 lg:gap-16 mt-14 stagger-children">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-1.5">
                <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              Why Choose{' '}
              <span className="gradient-text">Eato</span>?
            </h2>
            <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-primary to-orange-400 mb-4 animate-draw-line" />
            <p className="text-muted-foreground max-w-lg mx-auto">
              Everything you need for a seamless restaurant experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 shadow-lg hover-lift text-center group"
              >
                <CardContent className="p-8">
                  <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Dishes Carousel ─── */}
      {featuredItems.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="container px-4">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Featured <span className="gradient-text">Dishes</span>
                </h2>
                <p className="text-muted-foreground mt-2">
                  Our most popular items, curated for you
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => scrollCarousel('left')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={() => scrollCarousel('right')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
            >
              {featuredItems.map((item, idx) => (
                <Card
                  key={item.id}
                  className="min-w-[280px] max-w-[300px] flex-shrink-0 snap-start cursor-pointer hover-lift group overflow-hidden border-0 shadow-lg"
                  onClick={() => navigate('/menu')}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="relative h-52 bg-gradient-to-br from-primary/10 to-orange-500/10 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-125 transition-transform duration-500">
                          🍽️
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                    {item.preparationTime && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium glass-dark rounded-full px-2.5 py-1">
                        <Clock className="h-3 w-3" />
                        {formatPrepTime(item.preparationTime)}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary whitespace-nowrap">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <Button variant="outline" size="lg" onClick={() => navigate('/menu')}>
                View All Dishes
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─── How It Works ─── */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3">
              How It <span className="gradient-text">Works</span>
            </h2>
            <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-primary to-orange-400 mb-4" />
            <p className="text-muted-foreground max-w-lg mx-auto">
              Ordering in three simple steps
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-10 stagger-children">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-400 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>

            {STEPS.map((step, idx) => (
              <div key={step.title} className="relative text-center z-10">
                {/* Step number circle */}
                <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow-lg animate-bounce-in" style={{ animationDelay: `${idx * 0.2}s` }}>
                  {idx + 1}
                </div>
                <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="food-gradient relative overflow-hidden py-20 lg:py-28">
        {/* Floating decorative elements */}
        <span className="absolute top-8 left-[10%] text-5xl opacity-30 animate-float" style={{ animationDelay: '0s' }}>🍕</span>
        <span className="absolute top-16 right-[12%] text-4xl opacity-25 animate-float" style={{ animationDelay: '1s' }}>🍔</span>
        <span className="absolute bottom-12 left-[18%] text-4xl opacity-20 animate-float-slow" style={{ animationDelay: '0.5s' }}>🍣</span>
        <span className="absolute bottom-8 right-[20%] text-5xl opacity-25 animate-float-slow" style={{ animationDelay: '1.5s' }}>🌮</span>

        <div className="container relative z-10 px-4 text-center">
          <UtensilsCrossed className="h-14 w-14 text-white mx-auto mb-6 animate-bounce-in" />
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4 animate-fade-in-up">
            Ready to Order?
          </h2>
          <p className="text-white/80 mb-10 max-w-lg mx-auto text-lg animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            Experience the future of restaurant ordering. Fast, easy, and delicious.
          </p>
          <Button
            size="xl"
            variant="secondary"
            className="animate-fade-in-up glow-lg text-base font-semibold"
            style={{ animationDelay: '0.3s' }}
            onClick={() => navigate('/menu')}
          >
            Start Ordering Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}
