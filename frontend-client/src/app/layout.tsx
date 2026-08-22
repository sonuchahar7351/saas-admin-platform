import { Space_Grotesk, Inter } from "next/font/google";
import { CustomerAuthProvider } from "../components/CustomerAuthProvider";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SupportChatWidget } from "@/components/SupportChatWidget";
import { Toaster } from "sonner";

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
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ style: { fontFamily: "var(--font-body)" } }}
        />
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
