import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Head from "next/head";

export const metadata = {
  title: "Mentor Metrics",
  description: "Rate My Professor AI Assistant",
  image: "/og-image.png",
  url: "https://mentor-metrics.vercel.app",
  siteName: "Mentor Metrics",
  type: "website",
  keywords: ["Rate My Professor", "AI", "Assistant", "Mentor Metrics"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
