import { getAdminEvents } from "@/app/actions/event";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const events = await getAdminEvents();

  const stats = {
    total: events.length,
    published: events.filter((e) => e.status === "PUBLISHED").length,
    draft: events.filter((e) => e.status === "DRAFT").length,
    completed: events.filter((e) => e.status === "COMPLETED").length,
  };

  const totalParticipants = events.reduce((sum, e) => {
    const regs = e.registrations as unknown as { count: number }[] | null;
    return sum + (regs?.[0]?.count ?? 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage events and participants.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">+ New Event</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: stats.total, color: "text-foreground" },
          { label: "Published", value: stats.published, color: "text-green-600 dark:text-green-400" },
          { label: "Draft", value: stats.draft, color: "text-yellow-600 dark:text-yellow-400" },
          { label: "Total Participants", value: totalParticipants, color: "text-blue-600 dark:text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Events</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/events">View All</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {events.slice(0, 5).map((event) => {
            const regs = event.registrations as unknown as { count: number }[] | null;
            const count = regs?.[0]?.count ?? 0;
            return (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-foreground/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(event.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    &nbsp;·&nbsp;{count} participant{count !== 1 ? "s" : ""}
                  </p>
                </div>
                <StatusPill status={event.status} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span className={`shrink-0 ml-3 text-xs font-medium px-2.5 py-0.5 rounded-full ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
