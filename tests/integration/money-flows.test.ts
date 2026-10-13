import { describe, it, expect, beforeEach } from "vitest";
import { prisma, resetDb, makeUser, asUser, bal, form, redirected } from "../helpers";
import { completeTrip } from "@/actions/trips/update-trip-status.action";
import { bookTrip } from "@/actions/bookings/create-booking.action";
import { cancelBooking } from "@/actions/bookings/cancel-booking.action";
import { cancelScheduledTrip, completeScheduledTrip } from "@/actions/trips/schedule-trip.action";
import { placeOrder } from "@/actions/orders/place-order.action";
import { updateOrder } from "@/actions/vendor/update-order.action";
import { requestWithdrawal } from "@/actions/wallet/withdraw.action";
import { requestTopUp } from "@/actions/wallet/add-money.action";
import { reviewRequest } from "@/actions/admin/review-payment.action";
beforeEach(resetDb);

describe("shipment delivery", () => {
  const mk = async (custBalance: number) => {
    const c = await makeUser("CUSTOMER", { balance: custBalance }), d = await makeUser("DRIVER");
    const l = await prisma.load.create({ data: { item: "Box", origin: "Addis Ababa", destination: "Bahir Dar", weightKg: 10, price: 1000, status: "IN_TRANSIT", postedById: c.id, driverId: d.id } });
    return { c, d, l };
  };
  it("charges the customer, pays the driver 90%, records commission, and never pays twice", async () => {
    const { c, d, l } = await mk(10000); asUser(d);
    await completeTrip(l.id);
    expect(await bal(c.id)).toBe(9000); expect(await bal(d.id)).toBe(900);
    expect((await prisma.commission.findUniqueOrThrow({ where: { loadId: l.id } })).amount).toBe(100);
    await completeTrip(l.id); // double click
    expect(await bal(d.id)).toBe(900); expect(await prisma.commission.count()).toBe(1);
  });
  it("rolls everything back when the customer can't pay", async () => {
    const { c, d, l } = await mk(500); asUser(d);
    expect(await redirected(completeTrip(l.id))).toMatch(/insufficient/);
    expect((await prisma.load.findUniqueOrThrow({ where: { id: l.id } })).status).toBe("IN_TRANSIT");
    expect(await bal(c.id)).toBe(500); expect(await bal(d.id)).toBe(0); expect(await prisma.commission.count()).toBe(0);
  });
});

describe("passenger trips", () => {
  const mk = async () => {
    const d = await makeUser("DRIVER"), c1 = await makeUser("CUSTOMER", { balance: 5000 }), c2 = await makeUser("CUSTOMER", { balance: 5000 });
    const t = await prisma.trip.create({ data: { origin: "Addis Ababa", destination: "Hawassa", departAt: new Date(Date.now() + 864e5), price: 500, seats: 4, seatsLeft: 4, driverId: d.id } });
    return { d, c1, c2, t };
  };
  it("books seats, takes payment, and refuses overbooking", async () => {
    const { c1, t } = await mk(); asUser(c1);
    expect(await redirected(bookTrip(t.id, form({ seats: "2" })))).toBe("/customer/bookings?ok=1");
    expect(await bal(c1.id)).toBe(4000); expect((await prisma.trip.findUniqueOrThrow({ where: { id: t.id } })).seatsLeft).toBe(2);
    expect(await redirected(bookTrip(t.id, form({ seats: "3" })))).toMatch(/Not enough seats/);
    expect(await bal(c1.id)).toBe(4000); // nothing charged on failure
  });
  it("cancelling a booking refunds and frees the seats", async () => {
    const { c1, t } = await mk(); asUser(c1);
    await redirected(bookTrip(t.id, form({ seats: "2" })));
    const b = await prisma.booking.findFirstOrThrow(); await cancelBooking(b.id);
    expect(await bal(c1.id)).toBe(5000); expect((await prisma.trip.findUniqueOrThrow({ where: { id: t.id } })).seatsLeft).toBe(4);
    await cancelBooking(b.id); expect(await bal(c1.id)).toBe(5000); // no second refund
  });
  it("driver cancelling refunds every passenger", async () => {
    const { d, c1, c2, t } = await mk();
    asUser(c1); await redirected(bookTrip(t.id, form({ seats: "1" }))); asUser(c2); await redirected(bookTrip(t.id, form({ seats: "2" })));
    asUser(d); await cancelScheduledTrip(t.id);
    expect(await bal(c1.id)).toBe(5000); expect(await bal(c2.id)).toBe(5000);
  });
  it("completing pays the driver 90% of what passengers paid", async () => {
    const { d, c1, t } = await mk();
    asUser(c1); await redirected(bookTrip(t.id, form({ seats: "2" })));
    await prisma.trip.update({ where: { id: t.id }, data: { status: "ONGOING" } });
    asUser(d); await completeScheduledTrip(t.id); await completeScheduledTrip(t.id);
    expect(await bal(d.id)).toBe(900); expect((await prisma.commission.findUniqueOrThrow({ where: { tripId: t.id } })).amount).toBe(100);
  });
});

describe("marketplace", () => {
  const mk = async () => {
    const v = await makeUser("VENDOR"), c = await makeUser("CUSTOMER", { balance: 10000 });
    const p = await prisma.product.create({ data: { name: "Cement", category: "Construction Materials", unit: "bag", price: 100, stock: 10, vendorId: v.id } });
    asUser(c); await redirected(placeOrder(p.id, form({ quantity: "3" })));
    return { v, c, p, o: await prisma.vendorOrder.findFirstOrThrow() };
  };
  it("takes stock and payment at order time; rejects more than is in stock", async () => {
    const { c, p } = await mk();
    expect(await bal(c.id)).toBe(9700); expect((await prisma.product.findUniqueOrThrow({ where: { id: p.id } })).stock).toBe(7);
    expect(await redirected(placeOrder(p.id, form({ quantity: "50" })))).toMatch(/Not enough stock/);
  });
  it("delivery pays the vendor 90% and skips invalid transitions", async () => {
    const { v, o } = await mk(); asUser(v);
    await updateOrder(o.id, "DELIVERED"); // PENDING -> DELIVERED is not allowed
    expect((await prisma.vendorOrder.findUniqueOrThrow({ where: { id: o.id } })).status).toBe("PENDING");
    for (const s of ["CONFIRMED", "PROCESSING", "DELIVERED"] as const) await updateOrder(o.id, s);
    expect(await bal(v.id)).toBe(270); expect((await prisma.commission.findUniqueOrThrow({ where: { orderId: o.id } })).amount).toBe(30);
  });
  it("cancelling restores stock and refunds", async () => {
    const { v, c, p, o } = await mk(); asUser(v); await updateOrder(o.id, "CANCELLED");
    expect(await bal(c.id)).toBe(10000); expect((await prisma.product.findUniqueOrThrow({ where: { id: p.id } })).stock).toBe(10);
  });
});

describe("wallet requests", () => {
  it("withdrawal holds funds, and a rejection returns them exactly once", async () => {
    const d = await makeUser("DRIVER", { balance: 1000 }), a = await makeUser("ADMIN"); asUser(d);
    expect(await redirected(requestWithdrawal(form({ amount: "400", method: "TELEBIRR", reference: "0911223344" })))).toBe("/driver/earnings-wallet?ok=1");
    expect(await bal(d.id)).toBe(600);
    expect(await redirected(requestWithdrawal(form({ amount: "5000", method: "TELEBIRR", reference: "0911223344" })))).toMatch(/Insufficient balance/);
    const r = await prisma.paymentRequest.findFirstOrThrow(); asUser(a);
    await reviewRequest(r.id, false); await reviewRequest(r.id, false); await reviewRequest(r.id, true);
    expect(await bal(d.id)).toBe(1000);
  });
  it("top-up credits once on approval and blocks reused receipts", async () => {
    const c = await makeUser("CUSTOMER"), a = await makeUser("ADMIN"); asUser(c);
    await redirected(requestTopUp(form({ amount: "500", method: "BANK", reference: "RCPT-1001" })));
    expect(await redirected(requestTopUp(form({ amount: "500", method: "BANK", reference: "RCPT-1001" })))).toMatch(/already submitted/);
    const r = await prisma.paymentRequest.findFirstOrThrow(); asUser(a);
    await reviewRequest(r.id, true); await reviewRequest(r.id, true);
    expect(await bal(c.id)).toBe(500);
  });
});
