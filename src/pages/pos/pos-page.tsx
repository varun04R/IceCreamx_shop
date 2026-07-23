import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, X, CreditCard, Banknote, Wallet,
  Receipt, ScanLine, Tag, Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { IceCream, OrderItem, Coupon } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';

const GST_RATE = 0.05;

export function POSPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);

  const { data: iceCreams = [] } = useQuery({
    queryKey: ['ice_creams'],
    queryFn: async () => {
      const { data } = await supabase.from('ice_creams').select('*').eq('availability', true);
      return (data ?? []) as IceCream[];
    },
  });
  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data } = await supabase.from('coupons').select('*').eq('active', true);
      return (data ?? []) as Coupon[];
    },
  });

  const filtered = iceCreams.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()) || i.barcode.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (ic: IceCream) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === ic.id);
      if (existing) return prev.map((c) => c.id === ic.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: ic.id, name: ic.name, price: Number(ic.price) * (1 - Number(ic.discount) / 100), qty: 1, image_url: ic.image_url }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0));
  };
  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const subtotal = useMemo(() => cart.reduce((s, c) => s + c.price * c.qty, 0), [cart]);
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'flat') return Math.min(appliedCoupon.value, subtotal);
    if (appliedCoupon.type === 'percentage') return (subtotal * appliedCoupon.value) / 100;
    return 0;
  }, [appliedCoupon, subtotal]);
  const taxable = subtotal - discount;
  const tax = taxable * GST_RATE;
  const total = taxable + tax;

  const applyCoupon = () => {
    const c = coupons.find((cp) => cp.code.toLowerCase() === couponCode.toLowerCase().trim());
    if (!c) { toast.error('Invalid coupon code'); return; }
    setAppliedCoupon(c);
    toast.success(`Coupon ${c.code} applied!`);
  };

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        items: cart,
        subtotal, discount, tax, total,
        payment_method: paymentMethod,
        status: 'confirmed',
        notes: appliedCoupon ? `Coupon: ${appliedCoupon.code}` : '',
      };
      const { data, error } = await supabase.from('orders').insert(payload).select().single();
      if (error) throw error;
      await supabase.from('notifications').insert({ type: 'order', title: 'New Order', message: `Order #${(data.id as string).slice(0, 8)} placed via POS — ${formatCurrency(total)}` });
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setLastReceipt({ ...data, items: cart, payment_method: paymentMethod, subtotal, discount, tax, total });
      setCart([]); setAppliedCoupon(null); setCouponCode(''); setCheckoutOpen(false);
      toast.success('Order placed successfully!');
    },
    onError: () => toast.error('Failed to place order'),
  });

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[1fr_380px]">
      {/* Product grid */}
      <div className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products, SKU, or barcode…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => toast.info('Scan a barcode to add')}><ScanLine className="h-4 w-4" /></Button>
        </div>

        <div className="mt-4 grid flex-1 gap-3 overflow-y-auto pr-1 scrollbar-thin sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ic) => (
            <motion.button
              key={ic.id}
              layout
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => addToCart(ic)}
              className="group overflow-hidden rounded-2xl border bg-card text-left shadow-sm hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                {ic.image_url ? <img src={ic.image_url} alt={ic.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" /> : <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>}
                <div className="absolute right-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-xs font-bold text-white">{formatCurrency(Number(ic.price) * (1 - Number(ic.discount) / 100))}</div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{ic.name}</p>
                <p className="text-xs text-muted-foreground">{ic.flavor} · Stock {ic.stock}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <Card className="flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Current Order</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{cart.length}</span>
          </div>
          {cart.length > 0 && <Button variant="ghost" size="sm" onClick={() => setCart([])}>Clear</Button>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <ShoppingCart className="h-10 w-10 opacity-40" />
              <p className="mt-2 text-sm">Cart is empty</p>
              <p className="text-xs">Tap a product to add it</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 rounded-xl border p-2"
                  >
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="border-t p-4">
            <div className="mb-3 flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="pl-9 uppercase" />
              </div>
              <Button variant="outline" onClick={applyCoupon}>Apply</Button>
            </div>
            {appliedCoupon && (
              <div className="mb-3 flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-1.5 text-sm text-green-700 dark:text-green-400">
                <span>Coupon {appliedCoupon.code} applied</span>
                <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              <Row label="Discount" value={`- ${formatCurrency(discount)}`} />
              <Row label="GST (5%)" value={formatCurrency(tax)} />
              <div className="flex items-center justify-between border-t pt-1.5 text-base font-bold">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Button className="mt-4 w-full gradient-primary text-white hover:opacity-90" onClick={() => setCheckoutOpen(true)}>
              <Receipt className="mr-2 h-4 w-4" /> Checkout
            </Button>
          </div>
        )}
      </Card>

      {/* Checkout modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => setCheckoutOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-6 shadow-2xl"
            >
              <h2 className="text-lg font-semibold">Payment</h2>
              <p className="text-sm text-muted-foreground">Total: {formatCurrency(total)}</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { id: 'cash', label: 'Cash', icon: Banknote },
                  { id: 'upi', label: 'UPI', icon: Wallet },
                  { id: 'card', label: 'Card', icon: CreditCard },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id)}
                    className={cn('flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors', paymentMethod === p.id ? 'border-primary bg-primary/10 text-primary' : 'hover:border-primary/50')}
                  >
                    <p.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                <Button className="flex-1 gradient-primary text-white hover:opacity-90" disabled={checkoutMutation.isPending} onClick={() => checkoutMutation.mutate()}>
                  {checkoutMutation.isPending ? 'Processing…' : <><Check className="mr-1 h-4 w-4" /> Confirm</>}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receipt modal */}
      <AnimatePresence>
        {lastReceipt && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => setLastReceipt(null)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white"><Check className="h-6 w-6" /></div>
                <h2 className="mt-3 text-lg font-semibold">Order Confirmed!</h2>
                <p className="text-sm text-muted-foreground">Order #{(lastReceipt.id as string).slice(0, 8)}</p>
              </div>
              <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                {lastReceipt.items.map((it: OrderItem) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.name} × {it.qty}</span>
                    <span>{formatCurrency(it.price * it.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(lastReceipt.subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>- {formatCurrency(lastReceipt.discount)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>GST</span><span>{formatCurrency(lastReceipt.tax)}</span></div>
                <div className="flex justify-between border-t pt-2 text-base font-bold"><span>Total</span><span>{formatCurrency(lastReceipt.total)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Payment</span><span className="uppercase">{lastReceipt.payment_method}</span></div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.print()}><Receipt className="mr-1 h-4 w-4" /> Print</Button>
                <Button className="flex-1 gradient-primary text-white hover:opacity-90" onClick={() => setLastReceipt(null)}>Done</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span>{value}</span></div>;
}
