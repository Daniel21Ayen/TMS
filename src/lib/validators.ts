import { SUPPORT_CATEGORIES } from "@/data/constants/support";
import { CATEGORIES } from "@/data/constants/categories";
import { z } from "zod";
export const vehicleSchema = z.object({
  plate: z.string().trim().min(4, "Plate number is too short").max(15).transform((v) => v.toUpperCase()),
  type: z.enum(["TRUCK", "VAN", "SUV", "CAR"]),
  capacity: z.string().trim().max(30).optional(),
});
export const shipmentSchema = z.object({
  item: z.string().trim().min(2, "Describe the item").max(80),
  origin: z.string().trim().min(2, "Enter the pickup city"),
  destination: z.string().trim().min(2, "Enter the destination city"),
  weightKg: z.coerce.number().int().min(1, "Weight must be at least 1 kg").max(50000),
  price: z.coerce.number().int().min(100, "Offer at least ETB 100").max(10_000_000),
}).refine((d) => d.origin.toLowerCase() !== d.destination.toLowerCase(), { message: "Pickup and destination must differ", path: ["destination"] });
export const paymentRequestSchema = z.object({
  amount: z.coerce.number().int().min(50, "Minimum amount is ETB 50").max(500_000, "Maximum amount is ETB 500,000"),
  method: z.enum(["TELEBIRR", "CBE_BIRR", "BANK", "CHAPA"]),
  reference: z.string().trim().min(4, "Enter a valid reference / account number").max(40),
});
const password = z.string().min(8, "Password must be at least 8 characters").regex(/[A-Za-z]/, "Password needs a letter").regex(/\d/, "Password needs a number");
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().regex(/^\+?[0-9 ]{9,15}$/, "Enter a valid phone number").optional().or(z.literal("")),
  role: z.enum(["CUSTOMER", "DRIVER", "VENDOR"], { message: "Choose how you will use TMS" }),
  password, confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
export const resetSchema = z.object({
  email: z.string().trim().toLowerCase().email(), code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"), password, confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter the product name").max(80),
  category: z.enum(CATEGORIES, { message: "Choose a category" }),
  description: z.string().trim().max(500).optional(),
  unit: z.string().trim().min(1, "Enter a unit (kg, bag, unit...)").max(15),
  price: z.coerce.number().int().min(1, "Enter a price per unit").max(10_000_000),
  stock: z.coerce.number().int().min(0, "Quantity cannot be negative").max(1_000_000),
  expiresAt: z.string().optional().transform((v) => (v ? new Date(v) : undefined)).refine((d) => !d || !isNaN(+d), "Invalid expiry date"),
});
export const ticketSchema = z.object({
  subject: z.string().trim().min(3, "Enter a short subject").max(100),
  category: z.enum(SUPPORT_CATEGORIES, { message: "Choose a category" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  message: z.string().trim().min(5, "Describe your issue in a few words").max(2000),
});
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(/^\+?[0-9 ]{9,15}$/, "Enter a valid phone number").optional().or(z.literal("")),
});
export const passwordChangeSchema = z.object({ current: z.string().min(1, "Enter your current password"), password, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
export const tripSchema = z.object({
  origin: z.string().trim().min(2, "Enter the departure city"), destination: z.string().trim().min(2, "Enter the destination city"),
  departAt: z.string().min(1, "Choose a departure time").transform((v) => new Date(v)).refine((d) => !isNaN(+d) && d > new Date(), "Departure must be in the future"),
  seats: z.coerce.number().int().min(1, "At least 1 seat").max(60), price: z.coerce.number().int().min(10, "Price per seat is too low").max(100000),
}).refine((d) => d.origin.toLowerCase() !== d.destination.toLowerCase(), { message: "Departure and destination must differ", path: ["destination"] });
