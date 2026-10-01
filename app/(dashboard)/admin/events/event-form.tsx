"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent, type EventPayload, type EventStatus } from "@/app/actions/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Loader2,
  AlertCircle,
  FileText,
  Activity,
} from "lucide-react";

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: Partial<EventPayload & { id: string }>;
}

const STATUS_OPTIONS: EventStatus[] = ["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"];

export function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "Online");
  const [startTime, setStartTime] = useState(
    initialData?.start_time ? toDatetimeLocal(initialData.start_time) : ""
  );
  const [endTime, setEndTime] = useState(
    initialData?.end_time ? toDatetimeLocal(initialData.end_time) : ""
  );
  const [capacity, setCapacity] = useState<string>(
    initialData?.capacity != null ? String(initialData.capacity) : ""
  );
  const [status, setStatus] = useState<EventStatus>(initialData?.status ?? "DRAFT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload: EventPayload = {
      title,
      description: description || null,
      location,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      capacity: capacity === "" ? null : Number(capacity),
      status,
    };

    try {
      if (mode === "create") {
        await createEvent(payload);
        router.push("/admin/events");
      } else if (mode === "edit" && eventId) {
        await updateEvent(eventId, payload);
        router.push(`/admin/events/${eventId}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 border-white/10 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-violet-400" />
            <span>Event Title *</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Next.js & Supabase Masterclass"
            required
            className="bg-white/5 border-white/10 focus:border-violet-500 rounded-xl"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">
            Description (Markdown / text)
          </Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide full details, itinerary, prerequisites, and speaker background..."
            rows={4}
            className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500 transition-colors resize-none"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-violet-400" />
            <span>Location / Link</span>
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Online (Zoom) or Physical Address"
            className="bg-white/5 border-white/10 focus:border-violet-500 rounded-xl"
          />
        </div>

        {/* Start / End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="start-time" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-violet-400" />
              <span>Start Date &amp; Time *</span>
            </Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="bg-white/5 border-white/10 focus:border-violet-500 rounded-xl text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-time" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              <span>End Date &amp; Time *</span>
            </Label>
            <Input
              id="end-time"
              type="datetime-local"
              value={endTime}
              min={startTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="bg-white/5 border-white/10 focus:border-violet-500 rounded-xl text-foreground"
            />
          </div>
        </div>

        {/* Capacity & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="capacity" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span>Capacity (Leave empty for Unlimited)</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 50"
              className="bg-white/5 border-white/10 focus:border-violet-500 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-violet-400" />
              <span>Publishing Status</span>
            </Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500 transition-colors"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-foreground">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20 active:scale-95"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : mode === "create" ? (
              "Publish Event"
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
            className="border-white/10 hover:bg-white/5 rounded-xl"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

/** Convert ISO string to datetime-local input value */
function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

