import { Space_Grotesk, Inter } from "next/font/google";
import { CustomerAuthProvider } from "../components/CustomerAuthProvider";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SupportChatWidget } from "@/components/SupportChatWidget";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body bg-bg text-text">
        <CustomerAuthProvider>
          <ThemeProvider>
            <SiteHeader />
            {children}
            <SupportChatWidget />
          </ThemeProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
