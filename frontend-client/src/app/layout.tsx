import { Space_Grotesk, Inter } from "next/font/google";
import { CustomerAuthProvider } from "../components/CustomerAuthProvider";
import "./globals.css";

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
        <CustomerAuthProvider>{children}</CustomerAuthProvider>
      </body>
    </html>
  );
}
