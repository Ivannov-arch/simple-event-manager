import { getMyRegistrations } from "@/app/actions/register";
import { getMyProfile } from "@/app/actions/profile";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    REGISTERED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    ATTENDED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profile.full_name ?? profile.username} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here are all the events you have registered for.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Registered",
            count: registrations.filter((r) => r.status === "REGISTERED").length,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Attended",
            count: registrations.filter((r) => r.status === "ATTENDED").length,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Total",
            count: registrations.length,
            color: "text-foreground",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* My Events List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Registrations</h2>
          <Button asChild size="sm">
            <Link href="/events">Browse More Events</Link>
          </Button>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">
              You haven&apos;t registered for any events yet.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/events">Explore Events</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm truncate">
                        {event?.title ?? "Unknown Event"}
                      </h3>
                      <StatusBadge status={reg.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      📍 {event?.location} &nbsp;·&nbsp;{" "}
                      {event?.start_time ? formatDate(event.start_time) : "—"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {reg.certificate_url && (
                      <a
                        href={reg.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline underline-offset-4 hover:opacity-80"
                      >
                        View Certificate
                      </a>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/events/${event?.id}`}>Details</Link>
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
