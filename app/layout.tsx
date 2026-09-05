import "./globals.css";
import { Header } from "@/components/Header";
import { JobStoreProvider } from "@/lib/jobStore";

export const metadata = {
  title: "Waterloo Rocketry Manufacturing PDM",
  description: "Engineering PDM workflow system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><JobStoreProvider><div className="shell"><Header />{children}</div></JobStoreProvider></body></html>;
}
