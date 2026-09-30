import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // If user is already logged in, redirect straight to dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-sm tracking-tight">EventHub</span>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent"
            >
              Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm font-medium px-3 py-1.5 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Manage Events &<br />
            <span className="text-muted-foreground">Track Participants</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            A simple platform to browse events, register your attendance,
            and access your participation certificates — all in one place.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/auth/sign-up"
              className="px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: "🗓️",
              title: "Browse Events",
              desc: "Discover and explore upcoming events open for registration.",
            },
            {
              icon: "✅",
              title: "Register Instantly",
              desc: "Sign up for events in one click. Capacity limits handled automatically.",
            },
            {
              icon: "🏆",
              title: "Get Certificates",
              desc: "Access your participation certificate directly from your dashboard.",
            },
          ].map((f) => (
            <div key={f.title} className="text-center space-y-2">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        EventHub · Built with Next.js & Supabase
      </footer>
    </main>
  );
}
