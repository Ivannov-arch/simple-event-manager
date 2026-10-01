import { getEventById } from "@/app/actions/event";
import { getMyRegistrations } from "@/app/actions/register";
import { RegisterButton } from "./register-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Back Button */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 gap-1.5"
        >
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Events</span>
          </Link>
        </Button>
      </div>

      {/* Main Header */}
      <div className="p-8 rounded-3xl glass-panel relative overflow-hidden border-white/10 space-y-4">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>{event.status} Event</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {event.title}
          </h1>
          {event.description && (
            <div className="pt-2">
              <MarkdownRenderer content={event.description} />
            </div>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl glass-panel border-white/10 flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Date & Schedule
            </p>
            <p className="font-semibold text-sm text-foreground">{formatDate(event.start_time)}</p>
            {!sameDay && (
              <p className="text-xs text-muted-foreground">Until {formatDate(event.end_time)}</p>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10 flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Time
            </p>
            <p className="font-semibold text-sm text-foreground">
              {formatTime(event.start_time)} – {formatTime(event.end_time)}
            </p>
            <p className="text-xs text-muted-foreground">Local timezone</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10 flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Location
            </p>
            <p className="font-semibold text-sm text-foreground">{event.location}</p>
            <p className="text-xs text-muted-foreground">Venue / Platform</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border-white/10 flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Participant Capacity
            </p>
            <p className="font-semibold text-sm text-foreground">
              {event.capacity === null
                ? `${registeredCount} registered (Unlimited)`
                : `${registeredCount} / ${event.capacity} seats taken`}
            </p>
            {isFull ? (
              <p className="text-xs text-rose-400 font-bold">Capacity reached</p>
            ) : (
              <p className="text-xs text-emerald-400 font-medium">Spots available</p>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Section (if issued) */}
      {myReg?.certificate_url && (
        <div className="p-6 rounded-2xl glass-panel border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">
                Official Certificate Ready!
              </p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Your attendance has been verified. Download your verified certificate.
              </p>
            </div>
          </div>
          <a
            href={myReg.certificate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
          >
            <span>View Certificate</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Register / Cancel Button Section */}
      <div className="p-6 rounded-2xl glass-panel border-white/10">
        <RegisterButton
          eventId={event.id}
          isRegistered={isRegistered}
          registrationId={myReg?.id}
          isFull={isFull}
        />
      </div>
    </div>
  );
}
