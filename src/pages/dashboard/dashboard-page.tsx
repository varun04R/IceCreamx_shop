import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingBag, IndianRupee, Users, Package,
  Clock, CheckCircle2, Award, Star, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { formatCurrency, timeAgo } from '@/lib/utils';

export function DashboardPage() {
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
      return data ?? [];
    },
  });
  const { data: iceCreams } = useQuery({
    queryKey: ['ice_creams'],
    queryFn: async () => {
      const { data } = await supabase.from('ice_creams').select('*');
      return data ?? [];
    },
  });
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await supabase.from('customers').select('*');
      return data ?? [];
    },
  });
  const { data: inventory } = useQuery({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data } = await supabase.from('inventory_items').select('*');
      return data ?? [];
    },
  });
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(6);
      return data ?? [];
    },
  });

  const today = new Date().toDateString();
  const todayOrders = (orders ?? []).filter((o) => new Date(o.created_at).toDateString() === today);
  const todaySales = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const monthSales = (orders ?? []).filter((o) => new Date(o.created_at).getMonth() === new Date().getMonth()).reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders = (orders ?? []).filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
  const completedOrders = (orders ?? []).filter((o) => o.status === 'delivered').length;
  const lowStock = (inventory ?? []).filter((i) => Number(i.stock) <= Number(i.min_stock)).length;
  const bestSeller = (iceCreams ?? []).find((i) => i.best_seller);
  const popularFlavor = (iceCreams ?? []).find((i) => i.featured);

  // Build last 7 days sales
  const dailyData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayOrders = (orders ?? []).filter((o) => new Date(o.created_at).toDateString() === d.toDateString());
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      sales: dayOrders.reduce((s, o) => s + Number(o.total), 0),
      orders: dayOrders.length,
    };
  });

  const monthlyData = [
    { month: 'Jan', revenue: 145000, orders: 320 },
    { month: 'Feb', revenue: 168000, orders: 380 },
    { month: 'Mar', revenue: 192000, orders: 410 },
    { month: 'Apr', revenue: 178000, orders: 395 },
    { month: 'May', revenue: 215000, orders: 480 },
    { month: 'Jun', revenue: 248000, orders: 520 },
    { month: 'Jul', revenue: 268000, orders: 560 },
  ];

  const categoryData = [
    { name: 'Cone', value: 35, color: 'hsl(346 77% 57%)' },
    { name: 'Cup', value: 28, color: 'hsl(25 95% 53%)' },
    { name: 'Sundae', value: 20, color: 'hsl(199 89% 60%)' },
    { name: 'Milkshake', value: 12, color: 'hsl(142 71% 45%)' },
    { name: 'Others', value: 5, color: 'hsl(280 65% 60%)' },
  ];

  const customerGrowth = [
    { month: 'Jan', customers: 120 },
    { month: 'Feb', customers: 145 },
    { month: 'Mar', customers: 180 },
    { month: 'Apr', customers: 210 },
    { month: 'May', customers: 260 },
    { month: 'Jun', customers: 310 },
    { month: 'Jul', customers: 380 },
  ];

  const cards = [
    { label: "Today's Sales", value: formatCurrency(todaySales), change: '+12.5%', up: true, icon: IndianRupee, gradient: 'from-rose-500 to-orange-500' },
    { label: 'Monthly Sales', value: formatCurrency(monthSales), change: '+8.2%', up: true, icon: TrendingUp, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Total Orders', value: (orders ?? []).length, change: '+5.1%', up: true, icon: ShoppingBag, gradient: 'from-green-500 to-emerald-500' },
    { label: 'Pending Orders', value: pendingOrders, change: '-3.4%', up: false, icon: Clock, gradient: 'from-amber-500 to-yellow-500' },
    { label: 'Completed Orders', value: completedOrders, change: '+9.7%', up: true, icon: CheckCircle2, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Customers', value: (customers ?? []).length, change: '+14.3%', up: true, icon: Users, gradient: 'from-pink-500 to-rose-500' },
    { label: 'Inventory Items', value: (inventory ?? []).length, change: `${lowStock} low`, up: lowStock === 0, icon: Package, gradient: 'from-teal-500 to-cyan-500' },
    { label: 'Best Seller', value: bestSeller?.name ?? '—', change: 'Featured', up: true, icon: Award, gradient: 'from-indigo-500 to-blue-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden p-5">
              <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${c.gradient} opacity-10 blur-xl`} />
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.gradient} text-white shadow`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${c.up ? 'text-green-600' : 'text-red-600'}`}>
                  {c.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {c.change}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{c.label}</p>
              <p className="mt-1 truncate text-xl font-bold">{c.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Daily Sales (Last 7 Days)" subtitle="Revenue trend">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(346 77% 57%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(346 77% 57%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
              <Area type="monotone" dataKey="sales" stroke="hsl(346 77% 57%)" strokeWidth={2} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Revenue" subtitle="This year">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
              <Bar dataKey="revenue" fill="hsl(25 95% 53%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Sales by Category" subtitle="Distribution" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
                {categoryData.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Customer Growth" subtitle="New customers per month" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={customerGrowth}>
              <defs>
                <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199 89% 60%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(199 89% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
              <Area type="monotone" dataKey="customers" stroke="hsl(199 89% 60%)" strokeWidth={2} fill="url(#custGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent orders + notifications */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Orders</h3>
            <span className="text-sm text-muted-foreground">{(orders ?? []).length} total</span>
          </div>
          <div className="mt-4 space-y-3">
            {(orders ?? []).slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="text-sm font-medium">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{(o.items as any[]).length} items · {timeAgo(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatCurrency(o.total)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
            {(orders ?? []).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No orders yet. Create one from the POS.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Live Notifications</h3>
          <div className="mt-4 space-y-3">
            {(notifications ?? []).map((n) => (
              <div key={n.id} className="flex gap-3 rounded-xl border p-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            ))}
            {(notifications ?? []).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No notifications.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = '' }: { title: string; subtitle: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    preparing: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    ready: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    out_for_delivery: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? ''}`}>{status.replace(/_/g, ' ')}</span>;
}
