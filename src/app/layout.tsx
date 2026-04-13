import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Zarika Studio – Handcrafted Sarees",
  description: "Discover handpicked sarees from the finest weavers across India. Silk, cotton, bridal and festive collections.",
  openGraph: {
    title: "Zarika Studio",
    description: "Handpicked sarees from master weavers across India",
    url: "https://zarikastudio.com",
    siteName: "Zarika Studio",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body style={{ overflowX: "hidden" }} className="font-sans bg-cream text-charcoal antialiased">
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#2C2420",
              color: "#FAF8F3",
              borderLeft: "3px solid #B8973C",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "13px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
