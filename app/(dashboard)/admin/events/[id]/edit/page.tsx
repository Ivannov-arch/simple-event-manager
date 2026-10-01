import { getEventById } from "@/app/actions/event";
import { EventForm } from "../../event-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";

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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground gap-1.5">
          <Link href={`/admin/events/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Event Detail</span>
          </Link>
        </Button>
      </div>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20 mb-2">
          <Edit className="h-3 w-3" />
          <span>Event Editor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Modify Event</h1>
        <p className="text-muted-foreground text-sm mt-1 truncate">
          Currently editing &ldquo;{event.title}&rdquo;
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
