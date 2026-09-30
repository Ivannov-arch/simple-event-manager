import { getEventById } from "@/app/actions/event";
import { EventForm } from "../../event-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditEventPage({
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

  return (
    <div className="max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/admin/events/${id}`}>← Back to Event</Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
        <p className="text-muted-foreground mt-1 truncate">
          Editing: {event.title}
        </p>
      </div>

      <EventForm
        mode="edit"
        eventId={id}
        initialData={{
          title: event.title,
          description: event.description,
          location: event.location,
          start_time: event.start_time,
          end_time: event.end_time,
          capacity: event.capacity,
          status: event.status as "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED",
        }}
      />
    </div>
  );
}
