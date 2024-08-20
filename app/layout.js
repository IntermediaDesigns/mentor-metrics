import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Mentor Metrics",
  description:
    "A RAG-based application of Rate My Professor AI Assistant with Next.js, Python, OpenAI, and Pinecone.",
  type: "website",
  website: "https://mentor-metrics.vercel.app",
  siteName: "Mentor Metrics",
  image: "/cover.png",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={metadata.description} />
        <meta property="og:type" content={metadata.type} />
        <meta property="og:site_name" content={metadata.siteName} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:url" content={metadata.website} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={metadata.image} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:site" content="@vercel" />
        <meta name="twitter:creator" content="@vercel" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}