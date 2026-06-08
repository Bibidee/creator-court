import type { Metadata } from "next";
import "../styles/globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { ToastProvider } from "../components/ui/Toast";

export const metadata: Metadata = {
  title: "Creator Court — Originality, evidence, and public verdicts",
  description:
    "Register original work, open evidence-backed copy cases, and publish GenLayer verdicts on originality and attribution.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
