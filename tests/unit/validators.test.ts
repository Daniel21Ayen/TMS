import { describe, it, expect } from "vitest";
import { shipmentSchema, registerSchema, paymentRequestSchema, tripSchema, productSchema } from "@/lib/validators";
describe("validators", () => {
  it("shipment: rejects identical pickup/destination (case-insensitive) and coerces numbers", () => {
    expect(shipmentSchema.safeParse({ item: "Box", origin: "Adama", destination: "adama", weightKg: "10", price: "500" }).success).toBe(false);
    const ok = shipmentSchema.safeParse({ item: "Box", origin: "Adama", destination: "Harar", weightKg: "10", price: "500" });
    expect(ok.success && ok.data.price).toBe(500);
  });
  it("shipment: enforces a minimum offer", () => { expect(shipmentSchema.safeParse({ item: "Box", origin: "A1", destination: "B2", weightKg: 5, price: 50 }).success).toBe(false); });
  it("register: enforces password policy and match, lowercases email", () => {
    const base = { name: "Meron T", email: "Meron@Test.ET", role: "CUSTOMER", password: "abcdefg1", confirm: "abcdefg1" };
    const ok = registerSchema.safeParse(base); expect(ok.success && ok.data.email).toBe("meron@test.et");
    expect(registerSchema.safeParse({ ...base, password: "abcdefgh", confirm: "abcdefgh" }).success).toBe(false); // no digit
    expect(registerSchema.safeParse({ ...base, confirm: "different1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, role: "ADMIN" }).success).toBe(false); // admins can't self-register
  });
  it("payment request: amount bounds", () => {
    const r = (amount: number) => paymentRequestSchema.safeParse({ amount, method: "TELEBIRR", reference: "ABC123" }).success;
    expect(r(10)).toBe(false); expect(r(600000)).toBe(false); expect(r(500)).toBe(true);
  });
  it("trip: departure must be in the future", () => {
    const t = (d: string) => tripSchema.safeParse({ origin: "Addis Ababa", destination: "Hawassa", departAt: d, seats: 3, price: 400 }).success;
    expect(t("2000-01-01T10:00")).toBe(false); expect(t(new Date(Date.now() + 864e5).toISOString())).toBe(true);
  });
  it("product: no negative stock", () => { expect(productSchema.safeParse({ name: "Cement", category: "Construction Materials", unit: "bag", price: 280, stock: -1 }).success).toBe(false); });
});
