import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carbinox Video Ads Generator",
  description: "AI-powered video ad creation pipeline for Carbinox",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

function Sidebar() {
  return (
    <aside className="w-64 border-r border-[var(--card-border)] bg-[var(--card)] p-6 flex flex-col gap-2">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight">CARBINOX</h1>
        <p className="text-xs text-[var(--muted)]">Video Ads Generator</p>
      </div>
      <nav className="flex flex-col gap-1">
        <SidebarLink href="/" label="Dashboard" />
        <SidebarLink href="/projects/new" label="New Project" />
        <SidebarLink href="/briefs" label="Briefs" />
        <SidebarLink href="/render-queue" label="Render Queue" />
        <SidebarLink href="/library" label="Asset Library" />
        <SidebarLink href="/settings" label="Settings" />
      </nav>
      <div className="mt-auto pt-6 border-t border-[var(--card-border)]">
        <p className="text-xs text-[var(--muted)]">Powered by Claude + Remotion</p>
      </div>
    </aside>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-3 py-2 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 transition-colors"
    >
      {label}
    </a>
  );
}
