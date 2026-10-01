import { getPublishedEvents } from "@/app/actions/event";
import { getMyRegistrations } from "@/app/actions/register";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20 mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Upcoming Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Browse Published Events
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discover upcoming sessions, conferences, and workshops open for enrollment.
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground self-start sm:self-auto">
          <span className="text-foreground font-bold text-sm">{events.length}</span>{" "}
          {events.length === 1 ? "Event" : "Events"} Available
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-20 rounded-3xl glass-panel border-dashed border-white/15 space-y-3">
          <div className="h-12 w-12 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base text-foreground">No events available right now</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            There are currently no published events open for registration. Check back soon for new updates!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const registrations = event.registrations as unknown as
              | { id: string; status: string }[]
              | null;
            const registeredCount =
              registrations?.filter((r) => r.status !== "CANCELLED").length ?? 0;
            const isFull =
              event.capacity !== null && registeredCount >= event.capacity;
            const isRegistered = registeredEventIds.has(event.id);
            const fillPercentage =
              event.capacity !== null
                ? Math.min(100, Math.round((registeredCount / event.capacity) * 100))
                : null;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group relative rounded-3xl glass-panel p-6 flex flex-col justify-between hover:border-violet-500/40 transition-all hover:shadow-xl hover:shadow-violet-500/5 active:scale-[0.99]"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      <MapPin className="h-3 w-3 text-violet-400" />
                      <span className="truncate max-w-[120px]">{event.location}</span>
                    </span>

                    {isRegistered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Registered</span>
                      </span>
                    ) : isFull ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle className="h-3 w-3" />
                        <span>Full</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground">
                        Open
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-foreground group-hover:text-violet-300 transition-colors line-clamp-2">
                      {event.title}
                    </h2>
                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Meta Items */}
                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      <span>{formatTime(event.start_time)}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  {fillPercentage !== null && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Spots</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {registeredCount} / {event.capacity} ({fillPercentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? "bg-rose-500" : fillPercentage > 75 ? "bg-amber-500" : "bg-violet-500"
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {fillPercentage === null && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                      <Users className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{registeredCount} registered &middot; Unlimited spots</span>
                    </div>
                  )}
                </div>

                {/* Card Footer CTA */}
                <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-violet-400 group-hover:text-violet-300 flex items-center gap-1 transition-colors">
                    {isRegistered ? "View registration" : isFull ? "View details" : "Register now"}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
