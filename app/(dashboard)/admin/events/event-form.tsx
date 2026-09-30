"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent, type EventPayload, type EventStatus } from "@/app/actions/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create Event" : "Edit Event"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Fill in the details to create a new event."
            : "Update the event information below."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description (optional)"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Location */}
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Online"
            />
          </div>

          {/* Start / End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-time">Start Date & Time *</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-time">End Date & Time *</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                min={startTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="grid gap-2">
            <Label htmlFor="capacity">
              Capacity{" "}
              <span className="text-muted-foreground font-normal">(leave empty for unlimited)</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Unlimited"
            />
          </div>

          {/* Status */}
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "create" ? "Creating..." : "Saving..."
                : mode === "create" ? "Create Event" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/** Convert ISO string to datetime-local input value */
function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  // Format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
