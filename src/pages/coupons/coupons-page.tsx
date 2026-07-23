import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag, Percent, IndianRupee, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Coupon, CouponType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/lib/utils';
import { GenericDialog } from '@/components/ui/generic-dialog';

const empty = { code: '', type: 'percentage' as CouponType, value: 0, active: true, expires_at: '' };

const TYPE_ICON: Record<string, typeof Percent> = { percentage: Percent, flat: IndianRupee, bogo: Gift };

export function CouponsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(empty);

  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      return (data ?? []) as Coupon[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, value: Number(form.value), expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null };
      if (editing) await supabase.from('coupons').update(payload).eq('id', editing.id);
      else await supabase.from('coupons').insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success(editing ? 'Coupon updated' : 'Coupon created'); setOpen(false); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('coupons').delete().eq('id', id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coupons'] }); toast.success('Coupon deleted'); },
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setForm({ code: c.code, type: c.type, value: Number(c.value), active: c.active, expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '' }); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Offers & Coupons</h1>
          <p className="text-sm text-muted-foreground">{coupons.length} coupons · {coupons.filter((c) => c.active).length} active</p>
        </div>
        <Button onClick={openNew} className="gradient-primary text-white hover:opacity-90"><Plus className="mr-1 h-4 w-4" /> Add Coupon</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c, i) => {
          const Icon = TYPE_ICON[c.type] ?? Tag;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="relative overflow-hidden p-5">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-white"><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="font-bold uppercase tracking-wide">{c.code}</p>
                      <p className="text-xs capitalize text-muted-foreground">{c.type === 'bogo' ? 'Buy One Get One' : c.type === 'flat' ? `₹${c.value} off` : `${c.value}% off`}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => del.mutate(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-muted-foreground">Expires {formatDate(c.expires_at)}</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <GenericDialog open={open} onOpenChange={setOpen} title={editing ? 'Edit Coupon' : 'Add Coupon'}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Field label="Code"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required /></Field>
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="percentage">Percentage</option>
              <option value="flat">Flat Amount</option>
              <option value="bogo">Buy One Get One</option>
            </select>
          </Field>
          <Field label="Value"><Input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></Field>
          <Field label="Expiry Date"><Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></Field>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Active</span>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending} className="gradient-primary text-white hover:opacity-90">{save.isPending ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </GenericDialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
