import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, IceCreamCone, ShoppingCart, Package, Users, Star,
  Bell, Settings, Tag, Receipt, LogOut, Menu, X, Moon, Sun, Cookie,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { cn, initials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ice-creams', label: 'Ice Creams', icon: IceCreamCone },
  { to: '/pos', label: 'POS System', icon: ShoppingCart },
  { to: '/orders', label: 'Orders', icon: Receipt },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/toppings', label: 'Toppings', icon: Cookie },
  { to: '/coupons', label: 'Offers', icon: Tag },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white shadow-lg">
          <IceCreamCone className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">IceCreamX</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5 transition-transform group-hover:scale-110', isActive && 'text-primary')} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              {initials(profile?.full_name ?? 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{profile?.full_name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{profile?.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card/50 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card lg:hidden"
          >
            <SidebarContent />
          </motion.aside>
        </>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card/50 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-base font-semibold lg:text-lg">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
