import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Phone,
  UtensilsCrossed,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores';

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
const strengthColors = [
  '',
  'bg-destructive',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-green-400',
  'bg-green-500',
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (password !== confirmPassword) return;
    try {
      await register({ email, password, name, phone: phone || undefined });
      setSuccess(true);
      setTimeout(() => navigate('/menu'), 600);
    } catch {
      // Error handled by store
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-orange-400 via-primary to-amber-500">
        <div className="absolute inset-0 food-gradient opacity-90" />

        {/* Floating food illustrations */}
        <div className="absolute top-[10%] left-[12%] text-6xl animate-float select-none opacity-80 drop-shadow-lg">
          🍣
        </div>
        <div className="absolute top-[28%] right-[12%] text-5xl animate-float-slow select-none opacity-80 drop-shadow-lg" style={{ animationDelay: '0.8s' }}>
          🥘
        </div>
        <div className="absolute bottom-[28%] left-[10%] text-5xl animate-float select-none opacity-80 drop-shadow-lg" style={{ animationDelay: '1.8s' }}>
          🍝
        </div>
        <div className="absolute bottom-[12%] right-[18%] text-6xl animate-float-slow select-none opacity-80 drop-shadow-lg" style={{ animationDelay: '0.3s' }}>
          🍩
        </div>
        <div className="absolute top-[52%] left-[38%] text-4xl animate-float select-none opacity-70 drop-shadow-lg" style={{ animationDelay: '2.2s' }}>
          🥑
        </div>
        <div className="absolute top-[6%] right-[32%] text-4xl animate-float-slow select-none opacity-60 drop-shadow-lg" style={{ animationDelay: '1.2s' }}>
          🫕
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
            Join the flavor
            <br />
            revolution
          </h2>
          <p className="text-lg text-white/80 text-center max-w-sm animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            Create your account and explore a world of culinary delights, delivered fresh to your door.
          </p>
        </div>

        {/* Decorative glow circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-background overflow-y-auto">
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

            {/* Heading */}
            <div className="text-center mb-7 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Join Eato to start ordering
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium animate-wiggle flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  icon={<User className="h-4 w-4" />}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 rounded-xl focus-visible:ring-primary/30 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                />
              </div>

              {/* Email */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
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

              {/* Phone */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
                <Input
                  label="Phone (optional)"
                  type="tel"
                  placeholder="+1 234 567 890"
                  icon={<Phone className="h-4 w-4" />}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl focus-visible:ring-primary/30 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                />
              </div>

              {/* Password + strength */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-11 rounded-xl pr-11 focus-visible:ring-primary/30 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength ? strengthColors[strength] : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    error={passwordsMismatch ? 'Passwords do not match' : undefined}
                    className={`h-11 rounded-xl pr-11 focus-visible:ring-primary/30 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] ${
                      passwordsMatch ? 'border-green-500 focus-visible:ring-green-500/30' : ''
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors p-0.5"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    {passwordsMatch ? (
                      <span className="text-green-500 flex items-center gap-1 animate-fade-in">
                        <Check className="h-3 w-3" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-1 animate-wiggle">
                        <X className="h-3 w-3" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  loading={isLoading}
                  disabled={success || passwordsMismatch}
                >
                  {success ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 animate-bounce-in" />
                      Account created
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </form>

            {/* Footer link */}
            <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors relative inline-block group"
              >
                Sign in
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
