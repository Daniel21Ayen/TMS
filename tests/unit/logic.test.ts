import { describe, it, expect, beforeAll } from "vitest";
import { getRoute, haversineKm } from "@/services/location/routing.service";
import { coordsOf } from "@/data/constants/cities";
import { productStatus, timeAgo } from "@/lib/utils";
describe("routing", () => {
  beforeAll(() => { delete process.env.ORS_API_KEY; });
  it("matches cities case-insensitively and returns null for unknown places", async () => {
    expect(coordsOf(" addis ababa ")).toBeTruthy(); expect(await getRoute("Atlantis", "Addis Ababa")).toBeNull();
  });
  it("falls back to a labelled estimate with sane numbers", async () => {
    const r = await getRoute("Addis Ababa", "Bahir Dar");
    expect(r?.source).toBe("estimate"); expect(r!.distanceKm).toBeGreaterThan(350); expect(r!.distanceKm).toBeLessThan(500); expect(r!.durationMin).toBeGreaterThan(300);
  });
  it("haversine of a point to itself is 0", () => { expect(haversineKm({ lat: 9, lng: 38 }, { lat: 9, lng: 38 })).toBe(0); });
});
describe("utils", () => {
  it("productStatus", () => {
    expect(productStatus({ stock: 5, expiresAt: new Date(Date.now() - 1000) })).toBe("EXPIRED");
    expect(productStatus({ stock: 0, expiresAt: null })).toBe("OUT_OF_STOCK"); expect(productStatus({ stock: 3, expiresAt: null })).toBe("ACTIVE");
  });
  it("timeAgo", () => { expect(timeAgo(new Date())).toBe("Just now"); expect(timeAgo(new Date(Date.now() - 3 * 3600_000))).toBe("3h ago"); });
});
