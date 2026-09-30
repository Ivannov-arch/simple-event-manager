import { getEventById } from "@/app/actions/event";
import { getMyRegistrations } from "@/app/actions/register";
import { RegisterButton } from "./register-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventDetailPage({
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

  const myRegistrations = await getMyRegistrations();
  const myReg = myRegistrations.find((r) => {
    const e = r.event as { id: string } | null;
    return e?.id === id;
  });
  const isRegistered = !!myReg && myReg.status !== "CANCELLED";

  const registrations = event.registrations as unknown as { count: number }[] | null;
  const registeredCount = registrations?.[0]?.count ?? 0;
  const isFull =
    event.capacity !== null && registeredCount >= event.capacity;

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const sameDay =
    startDate.toDateString() === endDate.toDateString();

  return (
    <div className="max-w-2xl space-y-8">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/events">← Back to Events</Link>
      </Button>

      {/* Event Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        {event.description && (
          <p className="text-muted-foreground leading-relaxed">
            {event.description}
          </p>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Date
            </p>
            <p className="font-medium">{formatDate(event.start_time)}</p>
            {!sameDay && (
              <p className="text-muted-foreground text-xs">
                to {formatDate(event.end_time)}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Time
            </p>
            <p className="font-medium">
              {formatTime(event.start_time)} – {formatTime(event.end_time)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Location
            </p>
            <p className="font-medium">{event.location}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Capacity
            </p>
            <p className="font-medium">
              {event.capacity === null
                ? `${registeredCount} registered · Unlimited`
                : `${registeredCount} / ${event.capacity} spots filled`}
            </p>
            {isFull && (
              <p className="text-xs text-red-500 font-medium">Event is full</p>
            )}
          </div>
        </div>
      </div>

      {/* Certificate (if issued) */}
      {myReg?.certificate_url && (
        <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              🎉 Your certificate is ready!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Congratulations on attending this event.
            </p>
          </div>
          <a
            href={myReg.certificate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-medium text-green-700 dark:text-green-300 underline underline-offset-4 hover:opacity-80"
          >
            Download
          </a>
        </div>
      )}

      {/* Register / Cancel */}
      <RegisterButton
        eventId={event.id}
        isRegistered={isRegistered}
        registrationId={myReg?.id}
        isFull={isFull}
      />
    </div>
  );
}
