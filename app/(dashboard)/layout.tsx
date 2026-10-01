import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { Calendar, Compass, Shield, User, Sparkles } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch profile for name + role
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role?.toUpperCase() === "ADMIN";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      {/* Background ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[140px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group transition-transform active:scale-95"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              EventHub
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/events"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <Compass className="h-4 w-4" />
              <span>Browse</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>My Events</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-violet-300 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all shadow-sm shadow-violet-500/10"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-muted-foreground font-medium truncate max-w-[150px]">
                {profile?.full_name || profile?.username || user.email}
              </span>
              {isAdmin && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold tracking-wider uppercase">
                  Admin
                </span>
              )}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
