import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Goodwin Batteries - Cloud Invoicing & Inventory Suite",
  description: "Official GST Billing, Inventory Management and Cloud Ledger for Goodwin Batteries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-800">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
