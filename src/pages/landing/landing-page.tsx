import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IceCreamCone, Star, ArrowRight, Menu, X, Moon, Sun, ShoppingBag,
  Award, Truck, Heart, Sparkles, Quote, ChevronDown, MapPin, Phone, Mail,
  CheckCircle2, TrendingUp, Users, Package,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/context/theme-context';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const featured = [
  { name: 'Belgian Chocolate Delight', flavor: 'Chocolate', price: 180, rating: 4.9, img: 'https://images.pexels.com/photos/1352273/pexels-photo-1352273.jpeg?auto=compress&cs=tinysrgb&w=600', tag: 'Best Seller' },
  { name: 'Strawberry Bliss', flavor: 'Strawberry', price: 170, rating: 4.8, img: 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=600', tag: 'Seasonal' },
  { name: 'Vanilla Bean Classic', flavor: 'Vanilla', price: 160, rating: 4.9, img: 'https://images.pexels.com/photos/2133904/pexels-photo-2133904.jpeg?auto=compress&cs=tinysrgb&w=600', tag: 'Classic' },
  { name: 'Mango Sorbet', flavor: 'Mango', price: 190, rating: 4.7, img: 'https://images.pexels.com/photos/5946616/pexels-photo-5946616.jpeg?auto=compress&cs=tinysrgb&w=600', tag: "Today's Special" },
  { name: 'Salted Caramel Swirl', flavor: 'Caramel', price: 195, rating: 4.9, img: 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=600', tag: 'Featured' },
  { name: 'Pistachio Royale', flavor: 'Pistachio', price: 210, rating: 4.8, img: 'https://images.pexels.com/photos/4109743/pexels-photo-4109743.jpeg?auto=compress&cs=tinysrgb&w=600', tag: 'Premium' },
];

const flavors = ['Chocolate', 'Strawberry', 'Vanilla', 'Mango', 'Butterscotch', 'Pistachio', 'Coffee', 'Blueberry', 'Mint', 'Caramel', 'Cookies & Cream', 'Black Currant'];

const specials = [
  { name: 'Brownie Sundae Extreme', desc: 'Warm brownie topped with vanilla ice cream, hot fudge & whipped cream', price: 250, img: 'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Fruit Sundae Medley', desc: 'Seasonal fruits over scoops of strawberry & vanilla ice cream', price: 220, img: 'https://images.pexels.com/photos/1352276/pexels-photo-1352276.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Mango Falooda', desc: 'Mango ice cream with vermicelli, basil seeds & rose syrup', price: 240, img: 'https://images.pexels.com/photos/1352272/pexels-photo-1352272.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

const reviews = [
  { name: 'Aarav Sharma', text: 'Best chocolate ice cream in the city! The Belgian Chocolate Delight is unreal.', rating: 5, avatar: 'AS' },
  { name: 'Priya Patel', text: 'Love the loyalty program — earned a free family pack just by being a regular!', rating: 5, avatar: 'PP' },
  { name: 'Rohan Mehta', text: 'The POS checkout is so fast and the staff is friendly. Highly recommend.', rating: 4, avatar: 'RM' },
  { name: 'Ananya Iyer', text: 'Mango sorbet tastes like pure summer. Will come back every week!', rating: 5, avatar: 'AI' },
];

const stats = [
  { label: 'Happy Customers', value: '12K+', icon: Users },
  { label: 'Flavors Crafted', value: '48+', icon: IceCreamCone },
  { label: 'Daily Orders', value: '850+', icon: ShoppingBag },
  { label: 'Years of Scooping', value: '15+', icon: Award },
];

const steps = [
  { num: '01', title: 'Browse & Discover', desc: 'Explore our seasonal menu of handcrafted flavors and specials.', icon: Sparkles },
  { num: '02', title: 'Order & Pay', desc: 'Add to cart, apply coupons, and pay with UPI, card, or cash.', icon: ShoppingBag },
  { num: '03', title: 'We Prepare', desc: 'Our chefs craft your order fresh with premium ingredients.', icon: Package },
  { num: '04', title: 'Delivered or Pickup', desc: 'Track your order live or grab it from the counter.', icon: Truck },
];

const gallery = [
  'https://images.pexels.com/photos/1352273/pexels-photo-1352273.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2133904/pexels-photo-2133904.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5946616/pexels-photo-5946616.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/4109743/pexels-photo-4109743.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1352276/pexels-photo-1352276.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const faqs = [
  { q: 'Do you offer vegan options?', a: 'Yes! Our fruit sorbets and frozen yogurt are 100% vegan, made with plant-based ingredients.' },
  { q: 'How does the loyalty program work?', a: 'Earn 10 points for every ₹100 spent. Climb through Bronze, Silver, Gold, and Diamond tiers to unlock bigger rewards.' },
  { q: 'Can I order for delivery?', a: 'Absolutely. Place an order online and track it in real-time until it arrives at your door.' },
  { q: 'Do you cater events?', a: 'We offer family packs and ice cream cakes for parties. Contact us for bulk orders and custom flavors.' },
  { q: 'Are your ingredients locally sourced?', a: 'We partner with local dairy farms and fruit growers to ensure freshness and support the community.' },
];

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-strong mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8"
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white shadow-lg">
              <IceCreamCone className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">IceCreamX</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {['Featured', 'Flavors', 'Specials', 'Reviews', 'Gallery', 'FAQs', 'Contact'].map((s) => (
              <a key={s} href={`#${s.toLowerCase()}`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {s}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Link to="/auth"><Button variant="ghost" className="hidden sm:flex">Sign In</Button></Link>
            <Link to="/auth"><Button className="gradient-primary text-white hover:opacity-90">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </motion.div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong mx-auto mt-2 max-w-7xl rounded-2xl p-4 md:hidden">
            {['Featured', 'Flavors', 'Specials', 'Reviews', 'Gallery', 'FAQs', 'Contact'].map((s) => (
              <a key={s} href={`#${s.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                {s}
              </a>
            ))}
          </motion.div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" /> AI-powered flavor recommendations
              </div>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight lg:text-6xl">
                Scoop happiness, <br /><span className="gradient-text">one cone at a time.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">
                IceCreamX is the all-in-one platform to run your ice cream shop — from POS and inventory to loyalty programs and real-time analytics.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth"><Button size="lg" className="gradient-primary text-white hover:opacity-90">Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <a href="#featured"><Button size="lg" variant="outline">Explore Flavors</Button></a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> 14-day trial</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cancel anytime</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative">
              <div className="relative mx-auto aspect-square max-w-md">
                <motion.img
                  src="https://images.pexels.com/photos/1352273/pexels-photo-1352273.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Ice cream"
                  className="rounded-3xl object-cover shadow-2xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -right-4 top-12 glass-strong rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Today's Sales</p>
                      <p className="font-bold">₹24,580</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -left-4 bottom-16 glass-strong rounded-2xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Rating</p>
                      <p className="font-bold">4.9 / 5.0</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-card/40 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section id="featured" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Handpicked for you" title="Featured Ice Creams" subtitle="Our most-loved flavors, crafted with premium ingredients." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="group overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.img} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow">{p.tag}</span>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {p.rating}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.flavor} flavor</p>
                    </div>
                    <p className="font-bold text-primary">₹{p.price}</p>
                  </div>
                  <Link to="/auth"><Button variant="outline" className="mt-4 w-full">Order Now</Button></Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Flavors */}
      <section id="flavors" className="bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Crowd favorites" title="Popular Flavors" subtitle="Explore the rainbow of flavors our customers can't stop scooping." />
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {flavors.map((f, i) => (
              <motion.span
                key={f}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-default rounded-full border bg-background px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:border-primary hover:text-primary"
              >
                {f}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Specials */}
      <section id="specials" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Fresh today" title="Today's Specials" subtitle="Limited-time creations from our master chefs." />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {specials.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group overflow-hidden rounded-3xl border bg-card shadow-sm hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={s.img} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-primary">₹{s.price}</p>
                    <Link to="/auth"><Button size="sm" className="gradient-primary text-white hover:opacity-90">Order</Button></Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Loved by thousands" title="Customer Reviews" subtitle="Don't just take our word for it — hear from our happy customers." />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl border bg-background p-6 shadow-sm"
              >
                <Quote className="h-8 w-8 text-primary/30" />
                <p className="mt-3 text-sm leading-relaxed">{r.text}</p>
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-semibold text-white">{r.avatar}</div>
                  <p className="font-medium">{r.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Simple & delightful" title="How It Works" subtitle="From craving to cone in four easy steps." />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-bold text-primary/60">{s.num}</p>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="A feast for the eyes" title="Gallery" subtitle="A glimpse into the world of IceCreamX." />
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {gallery.map((g, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group aspect-square overflow-hidden rounded-2xl"
              >
                <img src={g} alt="Gallery" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-primary p-10 text-center text-white shadow-2xl lg:p-16"
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="relative">
              <Heart className="mx-auto h-10 w-10" />
              <h2 className="mt-4 text-3xl font-bold lg:text-4xl">Ready to scoop success?</h2>
              <p className="mx-auto mt-3 max-w-md text-white/80">Join 1,200+ ice cream shops growing with IceCreamX. Start your free trial today.</p>
              <Link to="/auth"><Button size="lg" variant="secondary" className="mt-6">Get Started Now <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="bg-card/40 py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <SectionHeader eyebrow="Got questions?" title="FAQs" subtitle="Everything you need to know about IceCreamX." />
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border bg-background px-5 [&[data-state=open]]:shadow-sm">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Get in touch" title="Contact Us" subtitle="We'd love to hear from you — reach out anytime." />
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              {[
                { icon: MapPin, label: 'Visit us', value: '42 Scoop Street, Dessert District, Mumbai 400001' },
                { icon: Phone, label: 'Call us', value: '+91 98765 43210' },
                { icon: Mail, label: 'Email us', value: 'hello@icecreamx.com' },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                    <p className="font-medium">{c.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm"
              onSubmit={(e) => { e.preventDefault(); }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Your name" />
                <input className="rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Email" />
              </div>
              <input className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Subject" />
              <textarea rows={4} className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Your message" />
              <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">Send Message</Button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/40 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-white"><IceCreamCone className="h-5 w-5" /></div>
                <span className="text-lg font-bold">IceCreamX</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">The modern operating system for ice cream shops. Scoop happiness, manage with ease.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'POS System', 'Analytics'] },
              { title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Licenses'] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-foreground">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2026 IceCreamX. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Made with <Heart className="h-4 w-4 fill-primary text-primary" /> for ice cream lovers
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
