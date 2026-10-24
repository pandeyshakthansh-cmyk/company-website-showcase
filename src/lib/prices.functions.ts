import { createServerFn } from "@tanstack/react-start";

function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function checkPassword(pw: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("Admin password not configured");
  return safeEqual(pw, expected);
}

export const getPrices = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("product_prices").select("product_id,size,price");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => ({ password: String(d.password ?? "") }))
  .handler(async ({ data }) => ({ ok: checkPassword(data.password) }));

export const savePrices = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; prices: { product_id: string; size: string; price: number }[] }) => {
    if (!Array.isArray(d.prices) || d.prices.length > 200) throw new Error("Invalid prices");
    return {
      password: String(d.password ?? ""),
      prices: d.prices.map((p) => {
        const price = Math.round(Number(p.price));
        if (!Number.isFinite(price) || price < 0 || price > 100000) throw new Error("Invalid price");
        return { product_id: String(p.product_id).slice(0, 50), size: String(p.size).slice(0, 30), price };
      }),
    };
  })
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("product_prices")
      .upsert(data.prices.map((p) => ({ ...p, updated_at: new Date().toISOString() })));
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
