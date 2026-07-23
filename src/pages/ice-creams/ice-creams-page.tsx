import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Star, Snowflake, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { IceCream, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, cn } from '@/lib/utils';
import { IceCreamDialog } from '@/pages/ice-creams/ice-cream-dialog';

export function IceCreamsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editing, setEditing] = useState<IceCream | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: iceCreams = [] } = useQuery({
    queryKey: ['ice_creams'],
    queryFn: async () => {
      const { data } = await supabase.from('ice_creams').select('*').order('created_at', { ascending: false });
      return (data ?? []) as IceCream[];
    },
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      return (data ?? []) as Category[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await supabase.from('ice_creams').delete().eq('id', id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ice_creams'] }); toast.success('Ice cream deleted'); },
  });

  const filtered = iceCreams.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.flavor.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || i.category_id === categoryFilter;
    return matchSearch && matchCat;
  });

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (ic: IceCream) => { setEditing(ic); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ice Cream Management</h1>
          <p className="text-sm text-muted-foreground">{iceCreams.length} products in catalog</p>
        </div>
        <Button onClick={openNew} className="gradient-primary text-white hover:opacity-90">
          <Plus className="mr-1 h-4 w-4" /> Add Ice Cream
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, flavor, or SKU…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {filtered.map((ic) => {
            const cat = categories.find((c) => c.id === ic.category_id);
            const finalPrice = ic.price * (1 - ic.discount / 100);
            return (
              <motion.div
                key={ic.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="group overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {ic.image_url ? (
                      <img src={ic.image_url} alt={ic.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                    )}
                    <div className="absolute left-2 top-2 flex flex-col gap-1">
                      {ic.best_seller && <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white"><Star className="h-3 w-3 fill-white" /> Best</span>}
                      {ic.featured && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">Featured</span>}
                      {ic.seasonal && <span className="flex items-center gap-1 rounded-full bg-cyan-500 px-2 py-0.5 text-xs font-medium text-white"><Snowflake className="h-3 w-3" /> Seasonal</span>}
                    </div>
                    <div className="absolute right-2 top-2">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ic.availability ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}>
                        {ic.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{ic.name}</h3>
                        <p className="text-xs text-muted-foreground">{cat?.name ?? 'Uncategorized'} · {ic.flavor}</p>
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ic.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        {ic.discount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-primary">{formatCurrency(finalPrice)}</span>
                            <span className="text-xs text-muted-foreground line-through">{formatCurrency(ic.price)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-primary">{formatCurrency(ic.price)}</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">Stock: {ic.stock}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(ic)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(ic.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <Flame className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No ice creams found.</p>
        </div>
      )}

      <IceCreamDialog open={dialogOpen} onOpenChange={setDialogOpen} iceCream={editing} categories={categories} />
    </div>
  );
}
