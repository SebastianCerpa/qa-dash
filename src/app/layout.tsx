import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from '@/components/providers/ClientProviders';

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "QA Dashboard - Quality Assurance Management",
  description: "Professional QA Dashboard for managing testing workflows, tasks, and team collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased font-inter`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

