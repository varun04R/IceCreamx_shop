import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Cookie } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Topping } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, cn } from '@/lib/utils';
import { GenericDialog } from '@/components/ui/generic-dialog';

const empty = { name: '', price: 0, image_url: '', available: true };

export function ToppingsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Topping | null>(null);
  const [form, setForm] = useState(empty);

  const { data: toppings = [] } = useQuery({
    queryKey: ['toppings'],
    queryFn: async () => {
      const { data } = await supabase.from('toppings').select('*').order('name');
      return (data ?? []) as Topping[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, price: Number(form.price) };
      if (editing) await supabase.from('toppings').update(payload).eq('id', editing.id);
      else await supabase.from('toppings').insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['toppings'] }); toast.success(editing ? 'Topping updated' : 'Topping added'); setOpen(false); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('toppings').delete().eq('id', id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['toppings'] }); toast.success('Topping deleted'); },
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (t: Topping) => { setEditing(t); setForm({ name: t.name, price: Number(t.price), image_url: t.image_url, available: t.available }); setOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Toppings</h1>
          <p className="text-sm text-muted-foreground">{toppings.length} toppings · {toppings.filter((t) => t.available).length} available</p>
        </div>
        <Button onClick={openNew} className="gradient-primary text-white hover:opacity-90"><Plus className="mr-1 h-4 w-4" /> Add Topping</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {toppings.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Cookie className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm font-semibold text-primary">{formatCurrency(t.price)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => del.mutate(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Available</span>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', t.available ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                  {t.available ? 'Yes' : 'No'}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <GenericDialog open={open} onOpenChange={setOpen} title={editing ? 'Edit Topping' : 'Add Topping'}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="Price (₹)"><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
          <Field label="Image URL"><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></Field>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">Available</span>
            <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
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
