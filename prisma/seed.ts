import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
const people: [string, string, Role, UserStatus][] = [
  ["Admin User", "admin@tms.et", "ADMIN", "ACTIVE"], ["Meron Tesfaye", "customer@tms.et", "CUSTOMER", "ACTIVE"],
  ["Abebe Tadesse", "driver@tms.et", "DRIVER", "ACTIVE"], ["Abebe Kebede", "vendor@tms.et", "VENDOR", "ACTIVE"],
  ["Tadesse Alemu", "tadesse@tms.et", "DRIVER", "ACTIVE"], ["Mekides Kebede", "mekides@tms.et", "DRIVER", "PENDING"],
  ["Yonas Getachew", "yonas@tms.et", "DRIVER", "SUSPENDED"], ["Samuel Ayalew", "samuel@tms.et", "DRIVER", "ACTIVE"],
  ["Betelhem Asrat", "betelhem@tms.et", "CUSTOMER", "ACTIVE"], ["Kassahun Tadesse", "kassahun@tms.et", "CUSTOMER", "ACTIVE"],
  ["Liya Abebe", "liya@tms.et", "CUSTOMER", "SUSPENDED"], ["Solomon Girmay", "solomon@tms.et", "CUSTOMER", "ACTIVE"],
  ["Abay Food Supply", "abay@tms.et", "VENDOR", "ACTIVE"], ["Hawassa Construction", "hawassa@tms.et", "VENDOR", "ACTIVE"],
  ["Dire Dawa Logistics", "dd@tms.et", "VENDOR", "ACTIVE"], ["Mekelle Electronics", "mekelle@tms.et", "VENDOR", "PENDING"],
];
async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") throw new Error("Refusing to seed demo accounts in production");
  const passwordHash = await bcrypt.hash("Password123!", 10);
  for (const [name, email, role, status] of people)
    await prisma.user.upsert({ where: { email }, update: {}, create: { name, email, role, status, passwordHash, verified: status === "ACTIVE", phone: "+251 91 234 5678",
      wallet: { create: {} } } });
  console.log(`Seeded ${people.length} users`);
}
async function fleet() {
  const drivers = await prisma.user.findMany({ where: { role: "DRIVER", status: "ACTIVE" } });
  const cust = await prisma.user.findFirstOrThrow({ where: { role: "CUSTOMER" } });
  await prisma.wallet.updateMany({ where: { user: { role: "CUSTOMER" }, balance: 0 }, data: { balance: 50000 } }); // demo funds
  const types = [["TRUCK", "5 Ton"], ["VAN", "12 Seater"], ["SUV", "4x4"]];
  for (const [i, d] of drivers.entries()) {
    const [type, capacity] = types[i % 3];
    await prisma.vehicle.upsert({ where: { plate: `AA-${12345 + i * 111}` }, update: {}, create: { plate: `AA-${12345 + i * 111}`, type, capacity, ownerId: d.id, status: i === 2 ? "MAINTENANCE" : "ACTIVE" } });
  }
  if (await prisma.load.count()) return;
  const loads: [string, string, string, number, number][] = [["Agricultural Products", "Addis Ababa", "Bahir Dar", 2500, 8000], ["Construction Materials", "Addis Ababa", "Dire Dawa", 5000, 12000],
    ["Electronics", "Hawassa", "Addis Ababa", 1000, 6500], ["Food Supplies", "Mekelle", "Dessie", 2000, 9500], ["Textile Goods", "Hawassa", "Addis Ababa", 1200, 5200]];
  for (const [item, origin, destination, weightKg, price] of loads) await prisma.load.create({ data: { item, origin, destination, weightKg, price, postedById: cust.id } });
}
async function shop() {
  if (await prisma.product.count()) return;
  const vendors = await prisma.user.findMany({ where: { role: "VENDOR", status: "ACTIVE" } });
  const items: [string, string, string, number, number][] = [["Fresh Tomatoes", "Agricultural Products", "kg", 25, 500], ["Construction Cement", "Construction Materials", "bag", 280, 200], ["Laptop Computers", "Electronics", "unit", 18000, 50], ["Cooking Oil", "Food & Beverages", "liter", 150, 300]];
  for (const [i, v] of vendors.entries()) for (const [name, category, unit, price, stock] of items.slice(i % 2 ? 2 : 0, i % 2 ? 4 : 3))
    await prisma.product.create({ data: { name, category, unit, price, stock, vendorId: v.id } });
}
main().then(fleet).then(shop).finally(() => prisma.$disconnect());
