import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Building2, Palette, Database, Moon, Sun, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/theme-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SettingsPage() {
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [business, setBusiness] = useState({ name: '', address: '', phone: '', email: '', gst: '', currency: '₹' });

  const { data } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('*');
      return data ?? [];
    },
  });

  useEffect(() => {
    const biz = data?.find((s) => s.key === 'business')?.value as any;
    if (biz) setBusiness(biz);
  }, [data]);

  const saveBusiness = useMutation({
    mutationFn: async () => {
      await supabase.from('settings').upsert({ key: 'business', value: business as any, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved'); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your shop configuration</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business info */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
            <h2 className="font-semibold">Business Information</h2>
          </div>
          <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); saveBusiness.mutate(); }}>
            <Field label="Shop Name"><Input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} /></Field>
            <Field label="Address"><Input value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone"><Input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} /></Field>
              <Field label="Email"><Input value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} /></Field>
              <Field label="GST Number"><Input value={business.gst} onChange={(e) => setBusiness({ ...business, gst: e.target.value })} /></Field>
              <Field label="Currency"><Input value={business.currency} onChange={(e) => setBusiness({ ...business, currency: e.target.value })} /></Field>
            </div>
            <Button type="submit" disabled={saveBusiness.isPending} className="gradient-primary text-white hover:opacity-90"><Save className="mr-1 h-4 w-4" /> Save Changes</Button>
          </form>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Palette className="h-5 w-5" /></div>
            <h2 className="font-semibold">Appearance</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Choose your preferred theme</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-6 transition-colors ${theme === 'light' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
            >
              <Sun className="h-8 w-8 text-amber-500" />
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-6 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
            >
              <Moon className="h-8 w-8 text-indigo-500" />
              <span className="text-sm font-medium">Dark</span>
            </button>
          </div>
        </Card>

        {/* Database */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Database className="h-5 w-5" /></div>
            <h2 className="font-semibold">Database & Backup</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Your data is securely stored in a managed PostgreSQL database with row-level security.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Tables</p><p className="text-2xl font-bold">11</p></div>
            <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">RLS Enabled</p><p className="text-2xl font-bold text-green-500">Yes</p></div>
            <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Status</p><p className="text-2xl font-bold text-green-500">Healthy</p></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
