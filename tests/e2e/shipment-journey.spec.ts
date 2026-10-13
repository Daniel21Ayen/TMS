import { test, expect, type Page } from "@playwright/test";
const login = async (page: Page, email: string) => {
  await page.goto("/login"); await page.getByPlaceholder("Enter your email address").fill(email); await page.getByPlaceholder("Enter your password").fill("Password123!");
  await page.getByRole("button", { name: "Sign In" }).click(); await page.waitForURL(/dashboard/);
};
test("unauthenticated visitors are sent to the login page", async ({ page }) => { await page.goto("/admin/dashboard"); await expect(page).toHaveURL(/login/); });
test("wrong role is bounced to its own dashboard", async ({ page }) => { await login(page, "customer@tms.et"); await page.goto("/admin/dashboard"); await expect(page).toHaveURL(/customer\/dashboard/); });
test("customer posts a shipment, driver delivers it, driver is paid", async ({ browser }) => {
  const item = `E2E Box ${Date.now()}`;
  const cust = await (await browser.newContext()).newPage(); await login(cust, "customer@tms.et");
  await cust.goto("/customer/shipments/create");
  await cust.fill("input[name=item]", item); await cust.fill("input[name=origin]", "Addis Ababa"); await cust.fill("input[name=destination]", "Bahir Dar");
  await cust.fill("input[name=weightKg]", "100"); await cust.fill("input[name=price]", "1000"); await cust.getByRole("button", { name: "Post Shipment" }).click();
  await expect(cust.getByText(item)).toBeVisible();
  const drv = await (await browser.newContext()).newPage(); await login(drv, "driver@tms.et");
  await drv.goto("/driver/available-loads"); await drv.locator("div.card", { hasText: item }).getByRole("button", { name: "Accept" }).click();
  await drv.goto("/driver/trips"); const trip = drv.locator("div.card", { hasText: item });
  await trip.getByRole("button", { name: "Start Trip" }).click(); await trip.getByRole("button", { name: "Mark Delivered" }).click();
  await expect(drv.locator("div.card", { hasText: item }).getByText("Delivered").first()).toBeVisible();
  await drv.goto("/driver/earnings-wallet"); await expect(drv.getByText(/10% commission deducted/).first()).toBeVisible();
});
