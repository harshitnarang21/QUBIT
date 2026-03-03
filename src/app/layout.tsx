import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Digital Design Solver AI",
  description: "Solve your digital design assignments instantly with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="app-container">
          <nav className="navbar glass">
            <div className="nav-logo">
              <span className="gradient-text">Qubit Solver</span>
            </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
