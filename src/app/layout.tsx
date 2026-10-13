import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/shared/Providers";
export const metadata: Metadata = { title: "TMS – Transport Management System" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
