import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Award, Mail, Phone, Cake } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Customer, MembershipLevel } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials, formatDate } from '@/lib/utils';
import { GenericDialog } from '@/components/ui/generic-dialog';

const LEVELS: MembershipLevel[] = ['bronze', 'silver', 'gold', 'diamond'];
const LEVEL_COLORS: Record<string, string> = {
  bronze: 'bg-amber-700/15 text-amber-700 dark:text-amber-500',
  silver: 'bg-slate-400/15 text-slate-600 dark:text-slate-300',
  gold: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  diamond: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
};

const empty = { name: '', email: '', phone: '', address: '', birthday: '', favorite_flavor: '', reward_points: 0, membership_level: 'bronze' as MembershipLevel };

export function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(empty);

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      return (data ?? []) as Customer[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, reward_points: Number(form.reward_points), birthday: form.birthday || null };
      if (editing) await supabase.from('customers').update(payload).eq('id', editing.id);
      else await supabase.from('customers').insert(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success(editing ? 'Customer updated' : 'Customer added'); setOpen(false); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('customers').delete().eq('id', id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer removed'); },
  });

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, birthday: c.birthday ?? '', favorite_flavor: c.favorite_flavor, reward_points: c.reward_points, membership_level: c.membership_level });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <p className="text-sm text-muted-foreground">{customers.length} customers · {customers.filter((c) => c.reward_points > 0).length} with rewards</p>
        </div>
        <Button onClick={openNew} className="gradient-primary text-white hover:opacity-90"><Plus className="mr-1 h-4 w-4" /> Add Customer</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, email, or phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11"><AvatarFallback className="gradient-primary text-white text-sm font-semibold">{initials(c.name)}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${LEVEL_COLORS[c.membership_level]}`}>{c.membership_level}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => del.mutate(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {c.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {c.email}</div>}
                {c.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {c.phone}</div>}
                {c.birthday && <div className="flex items-center gap-2"><Cake className="h-3.5 w-3.5" /> {formatDate(c.birthday)}</div>}
                {c.favorite_flavor && <div className="flex items-center gap-2"><Award className="h-3.5 w-3.5" /> Loves {c.favorite_flavor}</div>}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Reward Points</span>
                <span className="font-bold text-primary">{c.reward_points}</span>
              </div>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="py-20 text-center text-muted-foreground col-span-full">No customers found.</p>}
      </div>

      <GenericDialog open={open} onOpenChange={setOpen} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Birthday"><Input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} /></Field>
            <Field label="Favorite Flavor"><Input value={form.favorite_flavor} onChange={(e) => setForm({ ...form, favorite_flavor: e.target.value })} /></Field>
            <Field label="Reward Points"><Input type="number" value={form.reward_points} onChange={(e) => setForm({ ...form, reward_points: Number(e.target.value) })} /></Field>
            <Field label="Membership Level">
              <select value={form.membership_level} onChange={(e) => setForm({ ...form, membership_level: e.target.value as MembershipLevel })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Address"><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
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
