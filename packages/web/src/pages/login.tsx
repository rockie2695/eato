import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  UtensilsCrossed,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDemos, setShowDemos] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      setSuccess(true);
      setTimeout(() => navigate('/menu'), 600);
    } catch {
      // Error handled by store
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary via-orange-400 to-amber-400">
        <div className="absolute inset-0 food-gradient opacity-90" />

        {/* Floating food illustrations */}
        <div className="absolute top-[12%] left-[15%] text-6xl animate-float select-none opacity-80 drop-shadow-lg">
          🍕
        </div>
        <div className="absolute top-[30%] right-[10%] text-5xl animate-float-slow select-none opacity-80 drop-shadow-lg" style={{ animationDelay: '1s' }}>
          🍔
        </div>
        <div className="absolute bottom-[25%] left-[8%] text-5xl animate-float select-none opacity-80 drop-shadow-lg" style={{ animationDelay: '2s' }}>
          🍜
        </div>
        <div className="absolute bottom-[15%] right-[20%] text-6xl animate-float-slow select-none opacity-80 drop-shadow-lg" style={{ animationDelay: '0.5s' }}>
          🥗
        </div>
        <div className="absolute top-[55%] left-[40%] text-4xl animate-float select-none opacity-70 drop-shadow-lg" style={{ animationDelay: '1.5s' }}>
          🍣
        </div>
        <div className="absolute top-[8%] right-[35%] text-4xl animate-float-slow select-none opacity-60 drop-shadow-lg" style={{ animationDelay: '3s' }}>
          🌮
        </div>

        {/* Tagline */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <UtensilsCrossed className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">Eato</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight text-center mb-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Delicious food,
            <br />
            delivered to you
          </h2>
          <p className="text-lg text-white/80 text-center max-w-sm animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            From local favorites to gourmet dishes — your next meal is just a tap away.
          </p>
        </div>

        {/* Decorative glow circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold gradient-text">Eato</span>
            </div>
          </div>

          {/* Glass card */}
          <div
            className="glass-strong rounded-2xl p-8 shadow-float animate-scale-in"
            style={{ animationDelay: '0.1s' }}
          >
            {/* Logo bounce-in */}
            <div className="flex justify-center mb-5 animate-bounce-in">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg glow">
                <UtensilsCrossed className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* Heading fade-in */}
            <div className="text-center mb-7 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Sign in to your Eato account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error with shake */}
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium animate-wiggle flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl focus-visible:ring-primary/30 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                />
              </div>

              {/* Password */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl pr-11 focus-visible:ring-primary/30 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  loading={isLoading}
                  disabled={success}
                >
                  {success ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 animate-bounce-in" />
                      Signed in
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </form>

            {/* Footer link */}
            <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary hover:text-primary/80 transition-colors relative inline-block group"
              >
                Sign up
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>

            {/* Demo credentials */}
            <div className="mt-5 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
              <button
                type="button"
                onClick={() => setShowDemos(!showDemos)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-xs text-muted-foreground transition-colors"
              >
                <span className="font-medium">Demo credentials</span>
                {showDemos ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: showDemos ? '120px' : '0', opacity: showDemos ? 1 : 0 }}
              >
                <div className="mt-2 p-3 rounded-xl bg-muted/40 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-mono text-foreground">customer@eato.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admin</span>
                    <span className="font-mono text-foreground">admin@eato.com</span>
                  </div>
                  <p className="text-muted-foreground/70 pt-1 border-t border-border/50">
                    Password: Customer123! / Admin123!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
