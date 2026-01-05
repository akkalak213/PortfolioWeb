import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import CyberNavbar from "@/components/CyberNavbar";
import TerminalFooter from "@/components/TerminalFooter";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", 
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Portfolio | Full Stack & IoT Engineer",
  description: "Portfolio featuring Full Stack Development, IoT Projects, Photography, and Video Editing works.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-400 min-h-screen flex flex-col`}>
        
        <CyberNavbar />
        
        {/* เพิ่ม print:pt-0 เพื่อลบช่องว่างด้านบนตอนปริ้น */}
        <main className="flex-grow w-full relative pt-24 print:pt-0">
            {children}
        </main>
        
        <TerminalFooter />
        
      </body>
    </html>
  );
}