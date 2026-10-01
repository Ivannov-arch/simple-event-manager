import { getEventById } from "@/app/actions/event";
import { getEventRegistrations } from "@/app/actions/register";
import { ParticipantsTable } from "./participants-table";
import { DeleteEventButton } from "./delete-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  ArrowLeft,
  Shield,
  Activity,
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEventDetailPage({
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

  const registrations = await getEventRegistrations(id);

  const regs = event.registrations as unknown as
    | { id: string; status: string }[]
    | null;
  const registeredCount =
    regs?.filter((r) => r.status !== "CANCELLED").length ?? 0;
  const attendedCount = registrations.filter((r) => r.status === "ATTENDED").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Back Button */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 gap-1.5"
        >
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Events</span>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground truncate">
              {event.title}
            </h1>
            <StatusPill status={event.status} />
          </div>
          {event.description && (
            <div className="pt-2 max-w-2xl">
              <MarkdownRenderer content={event.description} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button asChild variant="outline" size="sm" className="border-white/10 hover:bg-white/5 rounded-xl">
            <Link href={`/admin/events/${id}/edit`} className="flex items-center gap-1.5">
              <Edit className="h-4 w-4" />
              <span>Edit Event</span>
            </Link>
          </Button>
          <DeleteEventButton eventId={id} status={event.status} />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Location
          </p>
          <p className="text-sm font-bold text-foreground mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-violet-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Start Time
          </p>
          <p className="text-sm font-bold text-foreground mt-1">
            {formatDate(event.start_time)}
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            End Time
          </p>
          <p className="text-sm font-bold text-foreground mt-1">
            {formatDate(event.end_time)}
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Capacity Limit
          </p>
          <p className="text-sm font-bold text-foreground mt-1">
            {event.capacity === null ? "Unlimited" : `${event.capacity} seats`}
          </p>
        </div>
      </div>

      {/* Participant Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Registered Attendees
          </p>
          <p className="text-3xl font-black mt-2 text-blue-400">{registeredCount}</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Verified Attended
          </p>
          <p className="text-3xl font-black mt-2 text-emerald-400">{attendedCount}</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Capacity Fill Rate
          </p>
          <p className="text-3xl font-black mt-2 text-foreground">
            {event.capacity
              ? `${Math.min(100, Math.round((registeredCount / event.capacity) * 100))}%`
              : "Unlimited"}
          </p>
        </div>
      </div>

      {/* Participants Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            <span>Registered Participants ({registrations.length})</span>
          </h2>
        </div>
        <ParticipantsTable
          registrations={registrations as Parameters<typeof ParticipantsTable>[0]["registrations"]}
          eventId={id}
        />
      </div>
    </div>
  );
}
