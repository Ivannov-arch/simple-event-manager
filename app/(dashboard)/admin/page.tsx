import { getAdminEvents } from "@/app/actions/event";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  FileEdit,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    DRAFT: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
    },
    PUBLISHED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    },
    COMPLETED: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
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
      className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
    >
      {status}
    </span>
  );
}

export default async function AdminPage() {
  const events = await getAdminEvents();

  const stats = {
    total: events.length,
    published: events.filter((e) => e.status === "PUBLISHED").length,
    draft: events.filter((e) => e.status === "DRAFT").length,
    completed: events.filter((e) => e.status === "COMPLETED").length,
  };

  const totalParticipants = events.reduce((sum, e) => {
    const regs = e.registrations as unknown as
      | { id: string; status: string }[]
      | null;
    const count = regs?.filter((r) => r.status !== "CANCELLED").length ?? 0;
    return sum + count;
  }, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20 mb-2">
            <Shield className="h-3 w-3" />
            <span>Administrator Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Orchestrate events, track registrations, and handle attendee certification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20 active:scale-95"
          >
            <Link href="/admin/events/new" className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Events
            </span>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Across all statuses</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Published
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-emerald-400">{stats.published}</p>
          <p className="text-xs text-muted-foreground mt-1">Live &amp; accepting participants</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Drafts
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileEdit className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-amber-400">{stats.draft}</p>
          <p className="text-xs text-muted-foreground mt-1">Unpublished events</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Registrations
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-3xl font-black mt-3 text-blue-400">{totalParticipants}</p>
          <p className="text-xs text-muted-foreground mt-1">Total enrollments recorded</p>
        </div>
      </div>

      {/* Recent Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-400" />
            <span>Recent Events</span>
          </h2>
          <Button asChild variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
            <Link href="/admin/events" className="flex items-center gap-1.5">
              <span>View All Events</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 rounded-2xl glass-panel border-dashed border-white/15 space-y-3">
            <p className="text-foreground font-semibold">No events created yet</p>
            <p className="text-xs text-muted-foreground">Click "+ Create Event" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {events.slice(0, 5).map((event) => {
              const regs = event.registrations as unknown as
                | { id: string; status: string }[]
                | null;
              const count = regs?.filter((r) => r.status !== "CANCELLED").length ?? 0;
              return (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="rounded-2xl glass-panel p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-violet-500/30 transition-all group"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm sm:text-base font-bold text-foreground group-hover:text-violet-300 transition-colors truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start_time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      &nbsp;&middot;&nbsp;
                      <span className="text-foreground/80 font-medium">
                        {count} participant{count !== 1 ? "s" : ""}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusPill status={event.status} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
