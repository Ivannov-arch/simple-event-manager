import { EventForm } from "../event-form";

export default function NewEventPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Event</h1>
        <p className="text-muted-foreground mt-1">
          Create a new event for participants to register.
        </p>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
