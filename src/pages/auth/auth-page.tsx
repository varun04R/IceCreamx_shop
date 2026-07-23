import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { IceCreamCone, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
});
const signUpSchema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
  role: z.enum(['admin', 'manager', 'cashier', 'employee', 'customer']).default('customer'),
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const signInForm = useForm<SignInForm>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });
  const signUpForm = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema), defaultValues: { fullName: '', email: '', password: '', role: 'customer' } });

  const onSignIn = async (data: SignInForm) => {
    const { error } = await signIn(data.email, data.password);
    if (error) { toast.error(error); return; }
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  const onSignUp = async (data: SignUpForm) => {
    const { error } = await signUp(data.email, data.password, data.fullName, data.role);
    if (error) { toast.error(error); return; }
    toast.success('Account created! You can sign in now.');
    setMode('signin');
    signInForm.setValue('email', data.email);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden gradient-primary lg:block">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <IceCreamCone className="h-8 w-8" />
            <span className="text-2xl font-bold">IceCreamX</span>
          </div>
          <div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold leading-tight">
              The modern operating system for ice cream shops.
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-white/80">
              POS, inventory, customers, loyalty, analytics — all in one beautifully crafted platform.
            </motion.p>
            <div className="mt-8 flex items-center gap-2 text-sm text-white/70">
              <Sparkles className="h-4 w-4" /> Loved by 1,200+ scoop shops worldwide
            </div>
          </div>
          <div className="text-sm text-white/60">© 2026 IceCreamX. All rights reserved.</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white">
              <IceCreamCone className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">IceCreamX</span>
          </Link>

          <h2 className="text-2xl font-bold">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'signin' ? 'Sign in to your dashboard' : 'Start managing your shop today'}
          </p>

          <div className="mt-8 flex rounded-xl bg-muted p-1">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === m ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {mode === m && (
                  <motion.div layoutId="auth-pill" className="absolute inset-0 rounded-lg bg-card shadow-sm" transition={{ type: 'spring', damping: 25, stiffness: 300 }} />
                )}
                <span className="relative">{m === 'signin' ? 'Sign In' : 'Sign Up'}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === 'signin' ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={signInForm.handleSubmit(onSignIn)}
                className="mt-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@icecreamx.com" className="pl-9" {...signInForm.register('email')} />
                  </div>
                  {signInForm.formState.errors.email && <p className="text-xs text-destructive">{signInForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...signInForm.register('password')} />
                  </div>
                  {signInForm.formState.errors.password && <p className="text-xs text-destructive">{signInForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90" disabled={signInForm.formState.isSubmitting}>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={signUpForm.handleSubmit(onSignUp)}
                className="mt-6 space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="fullName" placeholder="Aarav Sharma" className="pl-9" {...signUpForm.register('fullName')} />
                  </div>
                  {signUpForm.formState.errors.fullName && <p className="text-xs text-destructive">{signUpForm.formState.errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@icecreamx.com" className="pl-9" {...signUpForm.register('email')} />
                  </div>
                  {signUpForm.formState.errors.email && <p className="text-xs text-destructive">{signUpForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...signUpForm.register('password')} />
                  </div>
                  {signUpForm.formState.errors.password && <p className="text-xs text-destructive">{signUpForm.formState.errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select id="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...signUpForm.register('role')}>
                    <option value="customer">Customer</option>
                    <option value="cashier">Cashier</option>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90" disabled={signUpForm.formState.isSubmitting}>
                  Create Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="font-medium text-primary hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
