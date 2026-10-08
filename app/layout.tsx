import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaxFeeder — Stop Chasing Clients for Tax Documents",
  description: "The only client portal built specifically for tax preparers. Set up in 5 minutes. Clients don't need passwords.",
  openGraph: {
    title: "TaxFeeder — Stop Chasing Clients for Tax Documents",
    description: "The only client portal built specifically for tax preparers. $29/mo.",
    type: "website",
    url: "https://taxfeeder.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
