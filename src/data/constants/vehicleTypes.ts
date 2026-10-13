import { Truck, Bus, Car, type LucideIcon } from "lucide-react";
export const VEHICLE_TYPES = [{ value: "TRUCK", label: "Truck" }, { value: "VAN", label: "Van / Minibus" }, { value: "SUV", label: "SUV / 4x4" }, { value: "CAR", label: "Car" }] as const;
export const VEHICLE_ICON: Record<string, LucideIcon> = { TRUCK: Truck, VAN: Bus, SUV: Car, CAR: Car };
