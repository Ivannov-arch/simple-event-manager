import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  Award,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";

export default async function HomePage() {
  // If user is already logged in, redirect straight to dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background ambient decorative blurs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-border/60 bg-background/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              EventHub
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-white/5 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/20 hover:shadow-violet-600/40 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 sm:py-28">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          <span>Next-Gen Event & Participant Management</span>
        </div>

        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Orchestrate Events.
            <br />
            <span className="gradient-text">Empower Participants.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            The high-performance platform for managing event registrations, tracking attendee
            status, and delivering verified digital participation certificates effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 transition-all active:scale-95"
            >
              <span>Explore Events Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-foreground font-medium transition-all hover:border-border/80 active:scale-95"
            >
              Sign In to Account
            </Link>
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="mt-16 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl glass-panel">
          <div className="text-center p-3">
            <p className="text-2xl font-bold text-foreground">100%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time Sync</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl font-bold text-violet-400">Zero</p>
            <p className="text-xs text-muted-foreground mt-0.5">Overbooking Risk</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl font-bold text-sky-400">Instant</p>
            <p className="text-xs text-muted-foreground mt-0.5">Certificate Issuance</p>
          </div>
          <div className="text-center p-3">
            <p className="text-2xl font-bold text-emerald-400">Role-Based</p>
            <p className="text-xs text-muted-foreground mt-0.5">Secure Permissions</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-t border-border/50 py-20 px-4 sm:px-6 bg-secondary/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Engineered for Seamless Coordination
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Everything both organizers and participants need in a unified modern experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-panel hover:border-violet-500/40 transition-all group space-y-3">
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Live Event Discovery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore published workshops, webinars, and conferences with real-time seat availability.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-indigo-500/40 transition-all group space-y-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base text-foreground">1-Click Registration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join with automatic capacity validation and self-service registration management.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-sky-500/40 transition-all group space-y-3">
              <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Verified Certificates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Direct access to your proof of attendance and downloadable credentials right in your portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>EventHub &copy; {new Date().getFullYear()} &middot; Built with Next.js &amp; Supabase</p>
      </footer>
    </main>
  );
}
