import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ShoppingBag, Phone, User, Users, Truck, ShieldCheck, Check, X, Minus, Plus, Menu, Leaf,
} from "lucide-react";
import logo from "@/assets/logo.jpg.asset.json";
import hero from "@/assets/hero.png";
import onion from "@/assets/onion.jpg";
import tomato from "@/assets/tomato.jpg";
import potato from "@/assets/potato.jpg";
import chilli from "@/assets/chilli.jpg";
import coriander from "@/assets/coriander.jpg";
import fruits from "@/assets/fruits.jpg";
import lemon from "@/assets/lemon.jpg";

// Replace with your real WhatsApp number (country code + number, digits only)
const WHATSAPP_NUMBER = "919999999999";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GreenBasketFresh — Farm Fresh Vegetables & Fruits Delivered" },
      { name: "description", content: "Order farm-fresh vegetables, seasonal fruits and herbs from GreenBasketFresh. Same-day delivery, order on WhatsApp." },
      { property: "og:title", content: "GreenBasketFresh — Farm Freshness, Delivered" },
      { property: "og:description", content: "Farm-fresh vegetables, fruits and herbs delivered to your doorstep. Order on WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Cat = "Vegetables" | "Fruits" | "Herbs & Spices";
type Product = { id: string; name: string; local: string; img: string; cat: Cat; options: { size: string; price: number }[] };

const PRODUCTS: Product[] = [
  { id: "onion", name: "Onion", local: "Pyaj", img: onion, cat: "Vegetables", options: [{ size: "500 gm", price: 35 }, { size: "1 kg", price: 70 }] },
  { id: "chilli", name: "Green Chilli", local: "Hari Mirch", img: chilli, cat: "Vegetables", options: [{ size: "100 gm", price: 10 }, { size: "250 gm", price: 20 }] },
  { id: "tomato", name: "Tomato", local: "Tamatar", img: tomato, cat: "Vegetables", options: [{ size: "500 gm", price: 30 }, { size: "1 kg", price: 60 }] },
  { id: "potato", name: "Potato", local: "Aloo", img: potato, cat: "Vegetables", options: [{ size: "1 kg", price: 40 }, { size: "2 kg", price: 75 }] },
  { id: "coriander", name: "Coriander", local: "Dhaniya Patti", img: coriander, cat: "Herbs & Spices", options: [{ size: "100 gm", price: 20 }, { size: "250 gm", price: 45 }] },
  { id: "lemon", name: "Lemon", local: "Nimbu", img: lemon, cat: "Fruits", options: [{ size: "250 gm", price: 60 }, { size: "500 gm", price: 110 }] },
  { id: "fruits", name: "Banana & Apple Combo", local: "Kela & Seb", img: fruits, cat: "Fruits", options: [{ size: "1 kg", price: 120 }, { size: "2 kg", price: 230 }] },
];

const TICKER = ["🍋 Seasonal Fruits Available", "🌶️ Premium Quality Produce", "🚚 Same Day Delivery", "🌿 Zero Pesticides", "🥬 Fresh Every Morning"];

type CartItem = { key: string; name: string; local: string; img: string; size: string; price: number; qty: number };

function Index() {
  const [filter, setFilter] = useState<"All Items" | Cat>("All Items");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", pincode: "" });

  const list = filter === "All Items" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);

  const add = (p: Product, o: { size: string; price: number }) => {
    const key = `${p.id}-${o.size}`;
    setCart((c) => {
      const ex = c.find((i) => i.key === key);
      if (ex) return c.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { key, name: p.name, local: p.local, img: p.img, size: o.size, price: o.price, qty: 1 }];
    });
    toast.success(`${p.name} (${o.size}) added`);
  };
  const changeQty = (key: string, d: number) =>
    setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));

  const detectLocation = () => {
    if (form.address || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setForm((f) => (f.address ? f : { ...f, address: `Location: https://maps.google.com/?q=${latitude},${longitude}` }));
    });
  };

  const order = (): void => {
    if (!cart.length) { toast.error("Your cart is empty"); return; }
    if (!form.name || !form.phone || !form.address || !form.pincode) { toast.error("Please fill your details before placing the order."); return; }
    const lines = cart.map((i) => `• ${i.name} (${i.local}) ${i.size} — ₹${i.price} × ${i.qty} = ₹${i.price * i.qty}`).join("\n");
    const msg = `🛒 *New Order — GreenBasketFresh*\n\n${lines}\n\n*Total: ₹${total}*\n\n👤 ${form.name}\n📞 ${form.phone}\n📍 ${form.address}\n🔢 ${form.pincode}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Ticker */}
      <div className="overflow-hidden bg-primary py-2 text-primary-foreground">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-sm font-semibold">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-secondary" />{t}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <a href="#top" className="flex items-center"><img src={logo.url} alt="GreenBasketFresh logo" className="h-14 w-auto" /></a>
          <nav className="hidden gap-8 font-display font-semibold text-primary md:flex">
            <a href="#products">Products</a><a href="#about">About</a><a href={`https://wa.me/${WHATSAPP_NUMBER}`}>Contact</a>
          </nav>
          <button className="text-primary md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu"><Menu className="size-8" /></button>
        </div>
        {menu && (
          <nav className="flex flex-col gap-3 border-t border-border px-6 py-4 font-display font-semibold text-primary md:hidden">
            <a href="#products" onClick={() => setMenu(false)}>Products</a>
            <a href="#about" onClick={() => setMenu(false)}>About</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`}>Contact on WhatsApp</a>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-8 pb-10 md:grid-cols-2 md:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 font-display text-xs font-bold tracking-widest text-primary">
            <span className="size-2 rounded-full bg-primary" /><Leaf className="size-4" /> FRESH EVERY MORNING
          </span>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight md:text-6xl">
            FARM FRESH VEGETABLES & FRUITS
            <span className="mt-1 block w-fit border-b-4 border-secondary text-3xl text-secondary md:text-4xl">FOR A HEALTHY LIFE</span>
          </h1>
          <p className="mt-4 font-display text-xl font-bold text-primary">Farm Freshness, Delivered to Your Doorstep.</p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            We deliver <b className="text-foreground">premium vegetables, seasonal fruits & aromatic herbs</b> straight from farms every single morning. No middlemen, no compromise — just pure, natural freshness your family deserves.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-display font-semibold text-primary">
            {["Zero Pesticides", "Same Day Delivery", "Fresh Daily"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="size-5" />{t}</li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
            <a href="#products" className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display font-bold text-primary-foreground shadow-soft"><ShoppingBag className="size-5" />Shop Now</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card py-4 font-display font-bold text-primary"><Phone className="size-5" />WhatsApp Us</a>
          </div>
        </div>
        <div className="relative">
          <img src={hero} alt="Basket of fresh vegetables" width={1024} height={1024} className="mx-auto w-full max-w-lg" />
          <div className="absolute top-4 right-4 flex size-24 flex-col items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground shadow-soft">
            <span className="font-display text-2xl font-black">100%</span><span className="text-[10px] font-bold tracking-wider">NATURAL</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="about" className="dots-bg bg-primary py-14 text-primary-foreground">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-12 px-4 text-center md:grid-cols-4">
          {[
            { i: User, n: "10+", l: "Varieties Daily" },
            { i: Users, n: "500+", l: "Happy Customers" },
            { i: Truck, n: "50+", l: "Daily Deliveries" },
            { i: ShieldCheck, n: "100%", l: "Quality Guarantee" },
          ].map(({ i: Icon, n, l }) => (
            <div key={l} className="flex flex-col items-center gap-2">
              <Icon className="size-12 opacity-70" strokeWidth={1.5} />
              <span className="font-display text-5xl font-black">{n}</span>
              <span className="opacity-80">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center font-display text-3xl font-black md:text-4xl">Our Fresh <span className="text-secondary">Products</span></h2>
        <p className="mt-2 text-center text-lg text-muted-foreground">100% farm fresh — harvested daily, delivered to your door.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {(["All Items", "Vegetables", "Fruits", "Herbs & Spices"] as const).map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`rounded-full border-2 px-5 py-2 font-display font-semibold transition ${filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <div key={p.id} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <img src={p.img} alt={p.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover" />
              <div className="flex flex-1 flex-col p-3 text-center">
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.local}</p>
                <div className="mt-3 flex flex-col gap-2">
                  {p.options.map((o) => (
                    <div key={o.size} className="rounded-2xl border border-border bg-muted p-2">
                      <p className="font-display font-semibold">{o.size} <span className="ml-1 text-primary">₹{o.price}</span></p>
                      <button onClick={() => add(p, o)} className="mt-2 w-full rounded-xl border-2 border-primary bg-card py-1.5 font-display font-bold text-primary transition hover:bg-primary hover:text-primary-foreground">+ Add</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card px-4 py-10 pb-28 text-center">
        <img src={logo.url} alt="GreenBasketFresh" className="mx-auto h-24 w-auto" loading="lazy" />
        <p className="mt-4 text-sm text-muted-foreground">© {new Date().getFullYear()} GreenBasketFresh. All rights reserved.</p>
      </footer>

      {/* Floating cart */}
      <button onClick={() => setOpen(true)} className="fixed right-4 bottom-5 z-40 flex items-center gap-3 rounded-full bg-primary py-3 pr-3 pl-5 font-display font-bold text-primary-foreground shadow-soft">
        <ShoppingBag className="size-6" />Cart
        <span className="flex size-9 items-center justify-center rounded-full bg-card text-primary">{count}</span>
      </button>

      {/* Cart sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 md:items-center" onClick={() => setOpen(false)}>
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-background md:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-2xl font-black">🛒 Your Cart</h2>
              <button onClick={() => setOpen(false)} className="rounded-full bg-card p-2 shadow-soft" aria-label="Close"><X /></button>
            </div>
            <div className="overflow-y-auto">
              <div className="bg-card px-5 py-3">
                {cart.length === 0 && <p className="py-6 text-center text-muted-foreground">Your cart is empty.</p>}
                {cart.map((i) => (
                  <div key={i.key} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
                    <img src={i.img} alt={i.name} className="size-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-display font-bold">{i.name} <span className="text-sm font-normal text-muted-foreground">({i.local})</span></p>
                      <p className="text-sm text-muted-foreground">{i.size}</p>
                      <p className="font-display font-bold text-primary">₹{i.price} × {i.qty} = ₹{i.price * i.qty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeQty(i.key, -1)} className="rounded-full border-2 border-primary p-1 text-primary" aria-label="Decrease"><Minus className="size-4" /></button>
                      <span className="w-5 text-center font-bold">{i.qty}</span>
                      <button onClick={() => changeQty(i.key, 1)} className="rounded-full border-2 border-primary p-1 text-primary" aria-label="Increase"><Plus className="size-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 px-5 py-5">
                {([
                  ["name", "👤 YOUR NAME", "Enter your full name..."],
                  ["phone", "📞 PHONE NUMBER", "Enter your mobile number..."],
                  ["address", "📍 DELIVERY ADDRESS", "Tap here — your location will be detected automatically..."],
                  ["pincode", "🔢 PINCODE", "Enter your pincode..."],
                ] as const).map(([k, label, ph]) => (
                  <label key={k} className="block">
                    <span className="font-display text-sm font-bold tracking-wider text-primary">{label}</span>
                    {k === "address" ? (
                      <textarea rows={2} value={form.address} onFocus={detectLocation} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder={ph}
                        className="mt-1 w-full rounded-xl border-2 border-border bg-card px-4 py-3 outline-none focus:border-primary" />
                    ) : (
                      <input value={form[k]} inputMode={k === "name" ? "text" : "numeric"} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph}
                        className="mt-1 w-full rounded-xl border-2 border-border bg-card px-4 py-3 outline-none focus:border-primary" />
                    )}
                  </label>
                ))}
                <p className="text-sm text-muted-foreground">📌 Please fill your details before placing the order.</p>
              </div>
            </div>
            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">Total Amount</span>
                <span className="font-display text-3xl font-black text-primary">₹{total}</span>
              </div>
              <button onClick={order} className="mt-4 w-full rounded-2xl bg-whatsapp py-4 font-display text-lg font-bold text-primary-foreground shadow-soft">
                Order on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
