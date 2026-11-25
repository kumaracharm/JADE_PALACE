import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OMNIS-X | Institutional Digital Twin Explorer",
  description: "Enterprise cyber-physical digital twin & resilience decision-support platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0E0F12] text-[#E2E1E6] font-sans selection:bg-[#5A4E70] selection:text-[#F5D061]">
        {children}
      </body>
    </html>
  );
}
