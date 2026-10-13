import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";
import { prisma, resetDb, makeUser, asUser, form, redirected } from "../helpers";
import { rateLimit } from "@/lib/rate-limit";
import { authOptions } from "@/lib/auth";
import { issueOtp, verifyOtp } from "@/services/auth/otp.service";
import { sendEmail } from "@/services/email/email.service";
import { toggleUserStatus } from "@/actions/admin/manage-user.action";
import { reviewRequest } from "@/actions/admin/review-payment.action";
import { bookTrip } from "@/actions/bookings/create-booking.action";
import { uploadDocument, reviewDocument } from "@/actions/documents/document.action";
vi.mock("@/services/email/email.service", () => ({ sendEmail: vi.fn() }));
beforeEach(resetDb);
const lastCode = () => vi.mocked(sendEmail).mock.calls.at(-1)![0].text.match(/\d{6}/)![0];

describe("rate limiter", () => {
  it("blocks after the limit and recovers when the window expires", async () => {
    for (let i = 0; i < 3; i++) expect((await rateLimit("k", 3, 60)).ok).toBe(true);
    expect((await rateLimit("k", 3, 60)).ok).toBe(false);
    await prisma.rateLimit.update({ where: { key: "k" }, data: { resetAt: new Date(Date.now() - 1000) } });
    expect((await rateLimit("k", 3, 60)).ok).toBe(true);
  });
});

describe("authentication", () => {
  it("locks sign-in after 5 failed attempts", async () => {
    const u = await makeUser("CUSTOMER"); await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash("Right-pass1", 4) } });
    const auth = (authOptions.providers[0] as unknown as { options: { authorize: (c: object, r: object) => Promise<unknown> } }).options.authorize;
    for (let i = 0; i < 5; i++) expect(await auth({ email: u.email, password: "wrong" }, { headers: {} })).toBeNull();
    await expect(auth({ email: u.email, password: "Right-pass1" }, { headers: {} })).rejects.toThrow("RATE_LIMITED");
  });
  it("revokes sessions after a password change or suspension", async () => {
    const u = await makeUser("CUSTOMER"), jwt = authOptions.callbacks!.jwt!, tok = { id: u.id, tv: 0, role: "CUSTOMER" };
    expect(((await jwt({ token: { ...tok } } as never)) as { revoked: boolean }).revoked).toBe(false);
    await prisma.user.update({ where: { id: u.id }, data: { tokenVersion: { increment: 1 } } });
    expect(((await jwt({ token: { ...tok } } as never)) as { revoked: boolean }).revoked).toBe(true);
    await prisma.user.update({ where: { id: u.id }, data: { tokenVersion: 0, status: "SUSPENDED" } });
    expect(((await jwt({ token: { ...tok } } as never)) as { revoked: boolean }).revoked).toBe(true);
  });
});

describe("one-time codes", () => {
  it("accepts the right code once, throttles resends, and burns a code after 5 wrong guesses", async () => {
    await issueOtp("a@test.et", "VERIFY"); const code = lastCode();
    expect((await issueOtp("a@test.et", "VERIFY")).ok).toBe(false); // 60 s cooldown
    expect(await verifyOtp("a@test.et", "VERIFY", code)).toBe(true); expect(await verifyOtp("a@test.et", "VERIFY", code)).toBe(false);
    await prisma.otpCode.deleteMany(); await issueOtp("b@test.et", "RESET"); const c2 = lastCode();
    for (let i = 0; i < 5; i++) expect(await verifyOtp("b@test.et", "RESET", c2 === "000000" ? "111111" : "000000")).toBe(false);
    expect(await verifyOtp("b@test.et", "RESET", c2)).toBe(false);
  });
});

describe("authorization", () => {
  it("blocks wrong roles from privileged actions", async () => {
    const c = await makeUser("CUSTOMER"), d = await makeUser("DRIVER"); asUser(c);
    await expect(toggleUserStatus(d.id)).rejects.toThrow("Forbidden"); await expect(reviewRequest("x", true)).rejects.toThrow("Forbidden");
    asUser(d); await expect(bookTrip("x", form({ seats: "1" }))).rejects.toThrow("Forbidden");
  });
  it("won't verify a driver without approved documents, then auto-verifies when all are approved", async () => {
    const a = await makeUser("ADMIN"), d = await makeUser("DRIVER", { status: "PENDING" }); asUser(a);
    expect(await redirected(toggleUserStatus(d.id))).toMatch(/required documents/);
    const ids: string[] = [];
    for (const kind of ["LICENSE", "ID_CARD", "VEHICLE_REGISTRATION"]) ids.push((await prisma.document.create({ data: { userId: d.id, kind, filename: "a.png", mime: "image/png", size: 1, data: Buffer.from("x") } })).id);
    for (const id of ids) await reviewDocument(id, true, new FormData());
    const u = await prisma.user.findUniqueOrThrow({ where: { id: d.id } }); expect(u.status).toBe("ACTIVE"); expect(u.verified).toBe(true);
  });
  it("accepts real images/PDFs only, judged by file contents not name", async () => {
    const d = await makeUser("DRIVER", { status: "PENDING" }); asUser(d);
    const up = (bytes: number[] | string, name: string) => { const f = new FormData(); f.set("file", new File([typeof bytes === "string" ? bytes : new Uint8Array(bytes)], name)); return uploadDocument("LICENSE", f); };
    expect(await redirected(up("<script>alert(1)</script>", "evil.jpg"))).toMatch(/Only JPG, PNG or PDF/);
    expect(await redirected(up([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "id.png"))).toBe("/driver/documents?ok=1");
    expect((await prisma.document.findFirstOrThrow()).mime).toBe("image/png");
  });
});
