import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Bell, ShoppingCart, Package, CreditCard, UserPlus, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { timeAgo, cn } from '@/lib/utils';

const ICONS: Record<string, typeof Bell> = {
  order: ShoppingCart, inventory: Package, payment: CreditCard, customer: UserPlus,
};

export function NotificationsPage() {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      return (data ?? []) as Notification[];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => { await supabase.from('notifications').update({ read: true }).eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markAllRead = useMutation({
    mutationFn: async () => { await supabase.from('notifications').update({ read: true }).neq('id', '00000000-0000-0000-0000-000000000000'); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
  });
  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('notifications').delete().eq('id', id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">{notifications.length} total · {unread} unread</p>
        </div>
        {unread > 0 && <Button variant="outline" onClick={() => markAllRead.mutate()}><Check className="mr-1 h-4 w-4" /> Mark all read</Button>}
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const Icon = ICONS[n.type] ?? Bell;
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={cn('flex items-center gap-4 p-4', !n.read && 'border-primary/40 bg-primary/5')}>
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', n.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">{timeAgo(n.created_at)}</p>
                </div>
                <div className="flex gap-1">
                  {!n.read && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markRead.mutate(n.id)}><Check className="h-4 w-4" /></Button>}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => del.mutate(n.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
        {notifications.length === 0 && <p className="py-20 text-center text-muted-foreground">No notifications.</p>}
      </div>
    </div>
  );
}
