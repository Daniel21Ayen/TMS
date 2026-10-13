import { vi } from "vitest";
// Next.js runtime pieces that don't exist outside a request. redirect() throws like the real one so tests can assert on the target.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); }, notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("next/headers", () => ({ headers: () => new Headers({ "x-forwarded-for": "9.9.9.9" }) }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
