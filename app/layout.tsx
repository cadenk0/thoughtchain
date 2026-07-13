import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThoughtChain: Daily word association game",
  description: "Connect words through association. A new puzzle every day.",
  openGraph: {
    title: "ThoughtChain",
    description: "Connect words through association. A new puzzle every day.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ThoughtChain",
    description: "Connect words through association. A new puzzle every day.",
  },
};

const themeInitScript = `(function(){try{var s=localStorage.getItem('thoughtchain-theme');var t='light';if(s){var p=JSON.parse(s);if(p&&p.state&&p.state.theme)t=p.state.theme;}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Space Grotesk — smart, geometric, modern wordmark font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="app-shell">
            <Header />
            <div className="page-content">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
