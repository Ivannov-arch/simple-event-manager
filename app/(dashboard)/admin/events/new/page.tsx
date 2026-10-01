import { EventForm } from "../event-form";
import { Sparkles, Calendar } from "lucide-react";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20 mb-2">
          <Sparkles className="h-3 w-3" />
          <span>Event Creator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure title, schedule, capacity limits, and venue details for your upcoming event.
        </p>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
