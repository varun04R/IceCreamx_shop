import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { InventoryItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate, cn } from '@/lib/utils';
import { GenericDialog } from '@/components/ui/generic-dialog';

const empty = { name: '', unit: 'pcs', stock: 0, supplier: '', purchase_date: '', expiry_date: '', min_stock: 0, category: 'general' };

export function InventoryPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(empty);

  const { data: items = [] } = useQuery({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data } = await supabase.from('inventory_items').select('*').order('name');
      return (data ?? []) as InventoryItem[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, stock: Number(form.stock), min_stock: Number(form.min_stock), purchase_date: form.purchase_date || null, expiry_date: form.expiry_date || null, updated_at: new Date().toISOString() };
      if (editing) await supabase.from('inventory_items').update(payload).eq('id', editing.id);
      else await supabase.from('inventory_items').insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory_items'] }); toast.success(editing ? 'Item updated' : 'Item added'); setOpen(false); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('inventory_items').delete().eq('id', id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory_items'] }); toast.success('Item deleted'); },
  });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (it: InventoryItem) => {
    setEditing(it);
    setForm({ name: it.name, unit: it.unit, stock: Number(it.stock), supplier: it.supplier, purchase_date: it.purchase_date ?? '', expiry_date: it.expiry_date ?? '', min_stock: Number(it.min_stock), category: it.category });
    setOpen(true);
  };

  const lowStock = items.filter((i) => Number(i.stock) <= Number(i.min_stock));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">{items.length} items · {lowStock.length} low stock</p>
        </div>
        <Button onClick={openNew} className="gradient-primary text-white hover:opacity-90"><Plus className="mr-1 h-4 w-4" /> Add Item</Button>
      </div>

      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-800 dark:text-amber-300">{lowStock.length} items are at or below minimum stock: {lowStock.map((i) => i.name).join(', ')}</p>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => {
          const low = Number(it.stock) <= Number(it.min_stock);
          return (
            <motion.div key={it.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', low ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary')}><Package className="h-5 w-5" /></div>
                    <div>
                      <p className="font-medium">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{it.category} · {it.supplier || 'No supplier'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(it)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => del.mutate(it.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Stock</p><p className={cn('font-semibold', low && 'text-red-500')}>{it.stock} {it.unit}</p></div>
                  <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Min Stock</p><p className="font-semibold">{it.min_stock} {it.unit}</p></div>
                  <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Purchased</p><p className="font-semibold">{formatDate(it.purchase_date)}</p></div>
                  <div className="rounded-lg bg-muted p-2"><p className="text-xs text-muted-foreground">Expires</p><p className="font-semibold">{formatDate(it.expiry_date)}</p></div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <GenericDialog open={open} onOpenChange={setOpen} title={editing ? 'Edit Item' : 'Add Item'}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Unit"><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>
            <Field label="Stock"><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></Field>
            <Field label="Min Stock"><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} /></Field>
            <Field label="Supplier"><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Purchase Date"><Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></Field>
            <Field label="Expiry Date"><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></Field>
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
