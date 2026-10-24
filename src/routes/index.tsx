import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Phone, Truck, ShieldCheck, Sprout, Users, X, Minus, Plus, Menu, Leaf, Lock, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.jpg.asset.json";
import hero from "@/assets/hero.png";
import onion from "@/assets/onion.jpg";
import tomato from "@/assets/tomato.jpg";
import potato from "@/assets/potato.jpg";
import chilli from "@/assets/chilli.jpg";
import coriander from "@/assets/coriander.jpg";
import fruits from "@/assets/fruits.jpg";
import lemon from "@/assets/lemon.jpg";
import { getPrices, savePrices, verifyAdmin } from "@/lib/prices.functions";

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
  loader: () => getPrices(),
  component: Index,
});

type Cat = "Vegetables" | "Fruits" | "Herbs";
type Opt = { size: string; price: number };
type Product = { id: string; name: string; local: string; img: string; cat: Cat; options: Opt[] };

const BASE: Product[] = [
  { id: "onion", name: "Onion", local: "Pyaj", img: onion, cat: "Vegetables", options: [{ size: "500 gm", price: 35 }, { size: "1 kg", price: 70 }] },
  { id: "chilli", name: "Green Chilli", local: "Hari Mirch", img: chilli, cat: "Vegetables", options: [{ size: "100 gm", price: 10 }, { size: "250 gm", price: 20 }] },
  { id: "tomato", name: "Tomato", local: "Tamatar", img: tomato, cat: "Vegetables", options: [{ size: "500 gm", price: 30 }, { size: "1 kg", price: 60 }] },
  { id: "potato", name: "Potato", local: "Aloo", img: potato, cat: "Vegetables", options: [{ size: "1 kg", price: 40 }, { size: "2 kg", price: 75 }] },
  { id: "coriander", name: "Coriander", local: "Dhaniya Patti", img: coriander, cat: "Herbs", options: [{ size: "100 gm", price: 20 }, { size: "250 gm", price: 45 }] },
  { id: "lemon", name: "Lemon", local: "Nimbu", img: lemon, cat: "Fruits", options: [{ size: "250 gm", price: 60 }, { size: "500 gm", price: 110 }] },
  { id: "fruits", name: "Banana & Apple Combo", local: "Kela & Seb", img: fruits, cat: "Fruits", options: [{ size: "1 kg", price: 120 }, { size: "2 kg", price: 230 }] },
];

type CartItem = { key: string; name: string; local: string; img: string; size: string; price: number; qty: number };

function Index() {
  const saved = Route.useLoaderData();
  const products = useMemo(
    () => BASE.map((p) => ({ ...p, options: p.options.map((o) => ({ ...o, price: saved.find((s) => s.product_id === p.id && s.size === o.size)?.price ?? o.price })) })),
    [saved],
  );
  const [filter, setFilter] = useState<"All" | Cat>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", pincode: "" });

  const list = filter === "All" ? products : products.filter((p) => p.cat === filter);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const add = (p: Product, o: Opt) => {
    const key = `${p.id}-${o.size}`;
    setCart((c) => c.find((i) => i.key === key)
      ? c.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
      : [...c, { key, name: p.name, local: p.local, img: p.img, size: o.size, price: o.price, qty: 1 }]);
    toast.success(`${p.name} (${o.size}) added`);
  };
  const changeQty = (key: string, d: number) => setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));

  const detectLocation = () => {
    if (form.address || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) =>
      setForm((f) => (f.address ? f : { ...f, address: `Location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}` })));
  };

  const order = (): void => {
    if (!cart.length) { toast.error("Your basket is empty"); return; }
    if (!form.name || !form.phone || !form.address || !form.pincode) { toast.error("Please fill your details before placing the order."); return; }
    const lines = cart.map((i) => `• ${i.name} (${i.local}) ${i.size} — ₹${i.price} × ${i.qty} = ₹${i.price * i.qty}`).join("\n");
    const msg = `🛒 *New Order — GreenBasketFresh*\n\n${lines}\n\n*Total: ₹${total}*\n\n👤 ${form.name}\n📞 ${form.phone}\n📍 ${form.address}\n🔢 ${form.pincode}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <img src={logo.url} alt="GreenBasketFresh logo" className="h-12 w-auto rounded-lg mix-blend-multiply" />
          <nav className="hidden items-center gap-6 font-medium md:flex">
            <a href="#shop">Shop</a><a href="#why">Why us</a>
            <button onClick={() => setAdmin(true)} className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm"><Lock className="size-4" />Edit prices</button>
          </nav>
          <button className="rounded-full bg-muted p-2 md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu"><Menu className="size-6" /></button>
        </div>
        {menu && (
          <nav className="mx-4 mb-3 flex flex-col gap-1 rounded-2xl bg-card p-3 font-medium shadow-soft md:hidden">
            <a className="rounded-xl px-3 py-2" href="#shop" onClick={() => setMenu(false)}>Shop</a>
            <a className="rounded-xl px-3 py-2" href="#why" onClick={() => setMenu(false)}>Why us</a>
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-left" onClick={() => { setMenu(false); setAdmin(true); }}><Lock className="size-4" />Edit prices</button>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 pt-10 text-primary-foreground md:grid md:grid-cols-2 md:items-center md:px-12 md:pt-0">
          <div className="relative z-10 md:py-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase"><Leaf className="size-4" />Picked this morning</span>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] font-extrabold md:text-6xl">
              Farm freshness,<br /><em className="text-secondary not-italic">delivered</em> to your door.
            </h1>
            <p className="mt-4 max-w-md opacity-85">Vegetables, seasonal fruits and fresh herbs — straight from the farm, no middlemen, no compromise.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#shop" className="flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 font-semibold text-secondary-foreground">Start shopping <ArrowRight className="size-4" /></a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="flex items-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3.5 font-semibold"><Phone className="size-4" />WhatsApp</a>
            </div>
          </div>
          <img src={hero} alt="Basket of fresh vegetables" width={1024} height={1024} className="relative mx-auto -mb-6 mt-8 w-full max-w-md md:mt-0" />
        </div>
      </section>

      {/* Why */}
      <section id="why" className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { i: Sprout, t: "Zero pesticides", d: "Naturally grown" },
            { i: Truck, t: "Same-day delivery", d: "Order by noon" },
            { i: Users, t: "500+ families", d: "Trust us daily" },
            { i: ShieldCheck, t: "Quality promise", d: "Or money back" },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-5">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-muted text-primary"><Icon className="size-6" /></span>
              <p className="mt-4 font-display text-lg font-semibold">{t}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-accent uppercase">Today's harvest</p>
            <h2 className="font-display text-3xl font-extrabold md:text-4xl">Fill your basket</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["All", "Vegetables", "Fruits", "Herbs"] as const).map((c) => (
              <button key={c} onClick={() => setFilter(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${filter === c ? "bg-foreground text-background" : "bg-muted text-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => <ProductCard key={p.id} p={p} onAdd={add} />)}
        </div>
      </section>

      <footer className="bg-foreground px-4 py-10 pb-28 text-center text-background">
        <p className="font-display text-2xl font-bold">GreenBasketFresh</p>
        <p className="mt-1 text-sm opacity-70">Farm Freshness, Delivered to Your Doorstep.</p>
        <p className="mt-6 text-xs opacity-50">© {new Date().getFullYear()} GreenBasketFresh</p>
      </footer>

      {/* Floating basket */}
      <button onClick={() => setOpen(true)} className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between rounded-2xl bg-foreground px-5 py-3.5 text-background shadow-soft">
        <span className="flex items-center gap-3 font-semibold"><ShoppingBag className="size-5" />{count} item{count === 1 ? "" : "s"}</span>
        <span className="flex items-center gap-2 font-semibold">₹{total} <ArrowRight className="size-4" /></span>
      </button>

      {open && (
        <Sheet onClose={() => setOpen(false)} title="Your basket">
          <div className="overflow-y-auto">
            <div className="px-5">
              {cart.length === 0 && <p className="py-8 text-center text-muted-foreground">Your basket is empty.</p>}
              {cart.map((i) => (
                <div key={i.key} className="flex items-center gap-3 border-b border-border py-3">
                  <img src={i.img} alt={i.name} className="size-14 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold">{i.name} <span className="text-sm font-normal text-muted-foreground">({i.local})</span></p>
                    <p className="text-sm text-muted-foreground">{i.size} · ₹{i.price} × {i.qty} = <b className="text-primary">₹{i.price * i.qty}</b></p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-muted p-1">
                    <button onClick={() => changeQty(i.key, -1)} className="rounded-full bg-card p-1" aria-label="Decrease"><Minus className="size-4" /></button>
                    <span className="w-4 text-center text-sm font-bold">{i.qty}</span>
                    <button onClick={() => changeQty(i.key, 1)} className="rounded-full bg-card p-1" aria-label="Increase"><Plus className="size-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 px-5 py-5">
              <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Mobile number" value={form.phone} inputMode="tel" onChange={(v) => setForm({ ...form, phone: v })} />
              <label className="block">
                <span className="text-sm font-medium text-muted-foreground">Delivery address</span>
                <textarea rows={2} value={form.address} onFocus={detectLocation} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Tap — we'll try to detect your location" className="mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none focus:border-primary" />
              </label>
              <Field label="Pincode" value={form.pincode} inputMode="numeric" onChange={(v) => setForm({ ...form, pincode: v })} />
            </div>
          </div>
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-baseline justify-between"><span className="font-medium">Total</span><span className="font-display text-3xl font-extrabold">₹{total}</span></div>
            <button onClick={order} className="mt-3 w-full rounded-2xl bg-whatsapp py-4 text-lg font-semibold text-primary-foreground">Order on WhatsApp</button>
          </div>
        </Sheet>
      )}

      {admin && <AdminSheet products={products} onClose={() => setAdmin(false)} />}
    </div>
  );
}

function ProductCard({ p, onAdd }: { p: Product; onAdd: (p: Product, o: Opt) => void }) {
  const [sel, setSel] = useState(0);
  const o = p.options[sel];
  return (
    <div className="flex gap-4 rounded-3xl border border-border bg-card p-3">
      <img src={p.img} alt={p.name} loading="lazy" width={816} height={816} className="size-28 shrink-0 rounded-2xl bg-muted object-cover" />
      <div className="flex flex-1 flex-col">
        <p className="font-display text-lg leading-tight font-semibold">{p.name}</p>
        <p className="text-sm text-muted-foreground">{p.local}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.options.map((x, i) => (
            <button key={x.size} onClick={() => setSel(i)}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${i === sel ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{x.size}</button>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-xl font-extrabold">₹{o.price}</span>
          <button onClick={() => onAdd(p, o)} className="flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground"><Plus className="size-4" />Add</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (v: string) => void; inputMode?: "tel" | "numeric" }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <input value={value} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none focus:border-primary" />
    </label>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 md:items-center" onClick={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-background md:rounded-[2rem]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-display text-2xl font-extrabold">{title}</h2>
          <button onClick={onClose} className="rounded-full bg-muted p-2" aria-label="Close"><X className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AdminSheet({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(products.flatMap((p) => p.options.map((o) => [`${p.id}|${o.size}`, String(o.price)]))));

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const { ok } = await verifyAdmin({ data: { password: pw } });
    setBusy(false);
    if (ok) setUnlocked(true); else toast.error("Wrong password");
  };
  const save = async () => {
    setBusy(true);
    try {
      const prices = Object.entries(draft).map(([k, v]) => { const [product_id, size] = k.split("|"); return { product_id, size, price: Number(v) }; });
      const res = await savePrices({ data: { password: pw, prices } });
      if (!res.ok) { toast.error("Wrong password"); return; }
      toast.success("Prices updated");
      await router.invalidate();
      onClose();
    } catch { toast.error("Please enter valid prices"); } finally { setBusy(false); }
  };

  return (
    <Sheet title="Edit prices" onClose={onClose}>
      {!unlocked ? (
        <form onSubmit={unlock} className="grid gap-3 px-5 pb-6">
          <p className="text-sm text-muted-foreground">Enter the shop password to change prices.</p>
          <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none focus:border-primary" />
          <button disabled={busy} className="rounded-2xl bg-primary py-3.5 font-semibold text-primary-foreground disabled:opacity-60">Unlock</button>
        </form>
      ) : (
        <>
          <div className="overflow-y-auto px-5">
            {products.map((p) => (
              <div key={p.id} className="border-b border-border py-3">
                <p className="font-semibold">{p.name}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {p.options.map((o) => {
                    const k = `${p.id}|${o.size}`;
                    return (
                      <label key={k} className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm">
                        <span className="w-14 shrink-0 text-muted-foreground">{o.size}</span>₹
                        <input inputMode="numeric" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value.replace(/\D/g, "") })} className="w-full bg-transparent font-semibold outline-none" />
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4"><button onClick={save} disabled={busy} className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Save prices"}</button></div>
        </>
      )}
    </Sheet>
  );
}
