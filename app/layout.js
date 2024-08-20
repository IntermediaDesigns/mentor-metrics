import "./globals.css";


export const metadata = {
  title: "Mentor Metrics",
  description: "A RAG-based application of Rate My Professor AI Assistant with Next.js, Python, OpenAI, and Pinecone.",
  type: "website",
  siteName: "Mentor Metrics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:type" content={metadata.type} />
        <meta property="og:site_name" content={metadata.siteName} />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        </body>
    </html>
  );
}
