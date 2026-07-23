import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { IceCream, Category, Size } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_SIZES: { value: Size; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'family', label: 'Family Pack' },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  iceCream: IceCream | null;
  categories: Category[];
}

const empty = {
  name: '', category_id: '', flavor: '', description: '', ingredients: '',
  calories: 0, price: 0, discount: 0, stock: 0, sku: '', barcode: '', image_url: '',
  sizes: [] as Size[], availability: true, seasonal: false, featured: false, best_seller: false,
};

export function IceCreamDialog({ open, onOpenChange, iceCream, categories }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (iceCream) {
      setForm({
        name: iceCream.name, category_id: iceCream.category_id ?? '', flavor: iceCream.flavor,
        description: iceCream.description, ingredients: iceCream.ingredients.join(', '),
        calories: iceCream.calories, price: iceCream.price, discount: iceCream.discount,
        stock: iceCream.stock, sku: iceCream.sku, barcode: iceCream.barcode, image_url: iceCream.image_url,
        sizes: iceCream.sizes, availability: iceCream.availability, seasonal: iceCream.seasonal,
        featured: iceCream.featured, best_seller: iceCream.best_seller,
      });
    } else {
      setForm(empty);
    }
  }, [iceCream, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        category_id: form.category_id || null,
        flavor: form.flavor,
        description: form.description,
        ingredients: form.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        calories: Number(form.calories),
        price: Number(form.price),
        discount: Number(form.discount),
        stock: Number(form.stock),
        sku: form.sku,
        barcode: form.barcode,
        image_url: form.image_url,
        sizes: form.sizes,
        availability: form.availability,
        seasonal: form.seasonal,
        featured: form.featured,
        best_seller: form.best_seller,
      };
      if (iceCream) {
        await supabase.from('ice_creams').update(payload).eq('id', iceCream.id);
      } else {
        await supabase.from('ice_creams').insert(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ice_creams'] });
      toast.success(iceCream ? 'Ice cream updated' : 'Ice cream created');
      onOpenChange(false);
    },
    onError: () => toast.error('Something went wrong'),
  });

  const toggleSize = (s: Size) => {
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)} />
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl scrollbar-thin"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{iceCream ? 'Edit Ice Cream' : 'New Ice Cream'}</h2>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
            </div>

            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
                <Field label="Flavor"><Input value={form.flavor} onChange={(e) => setForm({ ...form, flavor: e.target.value })} /></Field>
                <Field label="Category">
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Uncategorized</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="SKU"><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
                <Field label="Barcode"><Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></Field>
                <Field label="Image URL"><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" /></Field>
                <Field label="Calories"><Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} /></Field>
                <Field label="Stock"><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></Field>
                <Field label="Price (₹)"><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required /></Field>
                <Field label="Discount (%)"><Input type="number" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Description"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
              <Field label="Ingredients (comma-separated)"><Input value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} /></Field>

              <Field label="Available Sizes">
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((s) => (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() => toggleSize(s.value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${form.sizes.includes(s.value) ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Toggle label="Available" checked={form.availability} onChange={(v) => setForm({ ...form, availability: v })} />
                <Toggle label="Seasonal" checked={form.seasonal} onChange={(v) => setForm({ ...form, seasonal: v })} />
                <Toggle label="Featured" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
                <Toggle label="Best Seller" checked={form.best_seller} onChange={(v) => setForm({ ...form, best_seller: v })} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending} className="gradient-primary text-white hover:opacity-90">
                  {saveMutation.isPending ? 'Saving…' : iceCream ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
