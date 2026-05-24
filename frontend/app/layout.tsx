import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "My Profile Page",
  description: "Interactive portfolio and project dashboard",
  icons: [
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon_io/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon_io/favicon-16x16.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/favicon_io/apple-touch-icon.png' },
  ],
  manifest: '/favicon_io/site.webmanifest',
  other: {
    'color-scheme': 'light',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}

