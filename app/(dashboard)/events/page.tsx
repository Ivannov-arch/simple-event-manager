import { getPublishedEvents } from "@/app/actions/event";
import { getMyRegistrations } from "@/app/actions/register";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventsPage() {
  const [events, myRegistrations] = await Promise.all([
    getPublishedEvents(),
    getMyRegistrations(),
  ]);

  // Build a set of event IDs the user has already registered for
  const registeredEventIds = new Set(
    myRegistrations
      .filter((r) => r.status === "REGISTERED" || r.status === "ATTENDED")
      .map((r) => {
        const event = r.event as { id: string } | null;
        return event?.id;
      })
      .filter(Boolean) as string[]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse Events</h1>
        <p className="text-muted-foreground mt-1">
          {events.length} event{events.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">No events are available right now.</p>
          <p className="text-sm text-muted-foreground mt-1">Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => {
            const registrations = event.registrations as unknown as { count: number }[] | null;
            const registeredCount = registrations?.[0]?.count ?? 0;
            const isFull =
              event.capacity !== null && registeredCount >= event.capacity;
            const isRegistered = registeredEventIds.has(event.id);

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group block rounded-xl border border-border bg-card p-5 hover:border-foreground/30 hover:shadow-sm transition-all"
              >
                {/* Top: Title + Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {event.title}
                  </h2>
                  {isRegistered && (
                    <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Registered
                    </span>
                  )}
                </div>

                {/* Description */}
                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {event.description}
                  </p>
                )}

                {/* Meta */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>📍 {event.location}</p>
                  <p>
                    📅 {formatDate(event.start_time)} · {formatTime(event.start_time)}
                  </p>
                  <p>
                    👥{" "}
                    {event.capacity === null
                      ? `${registeredCount} registered · Unlimited spots`
                      : isFull
                        ? `${registeredCount}/${event.capacity} · Full`
                        : `${registeredCount}/${event.capacity} spots filled`}
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-4">
                  {isFull && !isRegistered ? (
                    <span className="text-xs text-red-500 font-medium">
                      This event is full
                    </span>
                  ) : (
                    <span className="text-xs text-primary font-medium group-hover:underline underline-offset-4">
                      {isRegistered ? "View details →" : "View & register →"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
