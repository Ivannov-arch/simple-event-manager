import { getEventById } from "@/app/actions/event";
import { getEventRegistrations } from "@/app/actions/register";
import { ParticipantsTable } from "./participants-table";
import { DeleteEventButton } from "./delete-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event;
  try {
    event = await getEventById(id);
  } catch {
    notFound();
  }

  const registrations = await getEventRegistrations(id);

  const regs = event.registrations as unknown as { count: number }[] | null;
  const registeredCount = regs?.[0]?.count ?? 0;

  const attendedCount = registrations.filter((r) => r.status === "ATTENDED").length;

  return (
    <div className="space-y-8">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/events">← Back to Events</Link>
      </Button>

      {/* Event Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
            <StatusPill status={event.status} />
          </div>
          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/events/${id}/edit`}>Edit Event</Link>
          </Button>
          <DeleteEventButton eventId={id} status={event.status} />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Location", value: event.location },
          { label: "Start", value: formatDate(event.start_time) },
          { label: "End", value: formatDate(event.end_time) },
          {
            label: "Capacity",
            value: event.capacity === null ? "Unlimited" : String(event.capacity),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
            <p className="text-sm font-medium mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Participant Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Registered", value: registeredCount, color: "text-blue-600 dark:text-blue-400" },
          { label: "Attended", value: attendedCount, color: "text-green-600 dark:text-green-400" },
          {
            label: "Fill Rate",
            value: event.capacity
              ? `${Math.round((registeredCount / event.capacity) * 100)}%`
              : "—",
            color: "text-foreground",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Participants Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Participants ({registrations.length})
        </h2>
        <ParticipantsTable
          registrations={registrations as Parameters<typeof ParticipantsTable>[0]["registrations"]}
          eventId={id}
        />
      </div>
    </div>
  );
}
