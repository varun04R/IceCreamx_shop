import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Search, Receipt } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];

export function OrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return (data ?? []) as Order[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      await supabase.from('orders').update({ status }).eq('id', id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order status updated'); },
  });

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || (o.notes ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-sm text-muted-foreground">{orders.length} orders · {orders.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status)).length} active</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by order ID…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Receipt className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(o.created_at)} · {(o.items as any[]).length} items · {o.payment_method.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatCurrency(o.total)}</span>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value as OrderStatus })}
                    className={cn('rounded-full border-0 px-3 py-1 text-xs font-medium capitalize', statusColor(o.status))}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                {(o.items as any[]).map((it, idx) => (
                  <span key={idx} className="rounded-lg bg-muted px-2.5 py-1 text-xs">{it.name} × {it.qty}</span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="py-20 text-center text-muted-foreground">No orders found.</p>}
      </div>
    </div>
  );
}

function statusColor(s: string) {
  const m: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    preparing: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    ready: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    out_for_delivery: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  };
  return m[s] ?? '';
}
