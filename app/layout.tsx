import "./globals.css";
import { Header } from "@/components/Header";
import { JobStoreProvider } from "@/lib/jobStore";

export const metadata = { title: "Engineering PDM", description: "Phase 1 mock engineering PDM workflow" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><JobStoreProvider><div className="shell"><Header />{children}</div></JobStoreProvider></body></html>;
}
