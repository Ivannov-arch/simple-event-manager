import { getAdminEvents } from "@/app/actions/event";
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
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

export default async function AdminEventsPage() {
  const events = await getAdminEvents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">
            {events.length} event{events.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">+ New Event</Link>
        </Button>
      </div>

      {/* Table */}
      {events.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No events yet.</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/admin/events/new">Create your first event</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Event</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Participants</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((event) => {
                const regs = event.registrations as unknown as { count: number }[] | null;
                const count = regs?.[0]?.count ?? 0;
                return (
                  <tr key={event.id} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-[200px]">{event.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        📍 {event.location}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {new Date(event.start_time).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {count}
                      {event.capacity !== null && (
                        <span className="text-muted-foreground"> / {event.capacity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={event.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/events/${event.id}`}>Manage</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
