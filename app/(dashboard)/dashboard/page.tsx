import { getMyRegistrations } from "@/app/actions/register";
import { getMyProfile } from "@/app/actions/profile";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Award,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    REGISTERED: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
    },
    ATTENDED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    CANCELLED: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
    },
  };

  const style = map[status] ?? {
    bg: "bg-white/5",
    text: "text-muted-foreground",
    border: "border-white/10",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${style.bg} ${style.text} ${style.border}`}
    >
      {status}
    </span>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const [registrations, profile] = await Promise.all([
    getMyRegistrations(),
    getMyProfile(),
  ]);

  const registeredCount = registrations.filter((r) => r.status === "REGISTERED").length;
  const attendedCount = registrations.filter((r) => r.status === "ATTENDED").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-medium border border-violet-500/20 mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Participant Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back,{" "}
              <span className="gradient-text">
                {profile.full_name || profile.username || "Participant"}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your registered events, track your attendance, and access certified credentials.
            </p>
          </div>
          <Button
            asChild
            className="self-start sm:self-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 active:scale-95"
          >
            <Link href="/events" className="flex items-center gap-2">
              <span>Browse Events</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Registrations
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-blue-400">{registeredCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Upcoming events confirmed</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Events Attended
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-emerald-400">{attendedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed events</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Participations
            </span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-foreground">{registrations.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Overall history</p>
        </div>
      </div>

      {/* My Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-400" />
            <span>My Registered Events</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            Showing {registrations.length} {registrations.length === 1 ? "event" : "events"}
          </span>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16 rounded-2xl glass-panel border-dashed border-white/15 space-y-4">
            <div className="h-12 w-12 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground font-semibold text-base">No registrations found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                You haven&apos;t enrolled in any events yet. Check out available sessions and claim your spot!
              </p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:opacity-90">
              <Link href="/events">Explore Available Events</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {registrations.map((reg) => {
              const event = reg.event as {
                id: string;
                title: string;
                location: string;
                start_time: string;
                end_time: string;
                status: string;
              } | null;

              return (
                <div
                  key={reg.id}
                  className="rounded-2xl glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-violet-500/30 transition-all group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-violet-300 transition-colors truncate">
                        {event?.title ?? "Untitled Event"}
                      </h3>
                      <StatusBadge status={reg.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-violet-400" />
                        {event?.location ?? "Online"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-sky-400" />
                        {event?.start_time ? formatDate(event.start_time) : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {reg.certificate_url && (
                      <a
                        href={reg.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-all shadow-sm shadow-emerald-500/10"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>Certificate</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <Button asChild size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                      <Link href={`/events/${event?.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
