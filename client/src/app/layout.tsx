import { Manrope, Inter, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "../components/AuthProvider";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";
import { Toaster } from "sonner";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="font-body">
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="light"
          toastOptions={{ style: { fontFamily: "var(--font-body)" } }}
        />
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
