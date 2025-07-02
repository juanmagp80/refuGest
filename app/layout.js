import { Geist, Geist_Mono, Poppins } from "next/font/google";
import CloudinaryLoader from "./CloudinaryLoader";
import "./globals.css";
// Define your Poppins font configuration
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700"], // You can define specific weights if you need
  subsets: ["latin"],
});

// Other fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Refugest",
  description: "Gestion de refugios de animales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CloudinaryLoader />
        {children}

      </body>
    </html>
  );
}
