import { getAdminEvents } from "@/app/actions/event";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  Settings,
  Edit,
  ArrowRight,
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
      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
    >
      {status}
    </span>
  );
}

export default async function AdminEventsPage() {
  const events = await getAdminEvents();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Event Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse, manage, and configure all scheduled events in your organization.
          </p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20 active:scale-95"
        >
          <Link href="/admin/events/new" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </Link>
        </Button>
      </div>

      {/* Table */}
      {events.length === 0 ? (
        <div className="text-center py-20 rounded-3xl glass-panel border-dashed border-white/15 space-y-4">
          <div className="h-12 w-12 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-foreground">No events recorded yet</p>
            <p className="text-xs text-muted-foreground">Start by publishing your first event.</p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/admin/events/new">Create Event</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl glass-panel border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Date</th>
                  <th className="px-6 py-4 hidden md:table-cell">Attendance</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((event) => {
                  const regs = event.registrations as unknown as { count: number }[] | null;
                  const count = regs?.[0]?.count ?? 0;
                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground group-hover:text-violet-300 transition-colors truncate max-w-[240px]">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-violet-400" />
                          <span className="truncate max-w-[200px]">{event.location}</span>
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                        {new Date(event.start_time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs hidden md:table-cell whitespace-nowrap">
                        <span className="font-semibold text-foreground">{count}</span>
                        {event.capacity !== null ? (
                          <span className="text-muted-foreground"> / {event.capacity}</span>
                        ) : (
                          <span className="text-muted-foreground"> (Unlimited)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={event.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-xs">
                            <Link href={`/admin/events/${event.id}`} className="flex items-center gap-1">
                              <Settings className="h-3.5 w-3.5" />
                              <span>Manage</span>
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="hover:bg-white/5 text-xs text-muted-foreground hover:text-foreground">
                            <Link href={`/admin/events/${event.id}/edit`} className="flex items-center gap-1">
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
