"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent, type EventPayload, type EventStatus } from "@/app/actions/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/markdown-renderer";
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
  Bold,
  Italic,
  List,
  Heading,
  Code,
  Link as LinkIcon,
  Eye,
  PenLine,
} from "lucide-react";

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: Partial<EventPayload & { id: string }>;
}

const STATUS_OPTIONS: EventStatus[] = ["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"];

export function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter();

  // Helper to split ISO date into Date and Time
  const initialStart = initialData?.start_time ? new Date(initialData.start_time) : null;
  const initialEnd = initialData?.end_time ? new Date(initialData.end_time) : null;

  const formatDateVal = (d: Date | null) =>
    d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";
  const formatTimeVal = (d: Date | null) =>
    d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "09:00";

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

  const [location, setLocation] = useState(initialData?.location ?? "Online");

  // Distinct Date & Time states for superior UX
  const [startDate, setStartDate] = useState(formatDateVal(initialStart));
  const [startTime, setStartTime] = useState(formatTimeVal(initialStart));
  const [endDate, setEndDate] = useState(formatDateVal(initialEnd));
  const [endTime, setEndTime] = useState(formatTimeVal(initialEnd));

  const [capacity, setCapacity] = useState<string>(
    initialData?.capacity != null ? String(initialData.capacity) : ""
  );
  const [status, setStatus] = useState<EventStatus>(initialData?.status ?? "DRAFT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset helper
  const applyPreset = (preset: "today" | "tomorrow" | "weekend") => {
    const now = new Date();
    let target = new Date();

    if (preset === "today") {
      target.setHours(now.getHours() + 1, 0, 0, 0);
    } else if (preset === "tomorrow") {
      target.setDate(now.getDate() + 1);
      target.setHours(10, 0, 0, 0);
    } else if (preset === "weekend") {
      const daysUntilSat = (6 - now.getDay() + 7) % 7 || 7;
      target.setDate(now.getDate() + daysUntilSat);
      target.setHours(13, 0, 0, 0);
    }

    const endTarget = new Date(target.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    setStartDate(formatDateVal(target));
    setStartTime(formatTimeVal(target));
    setEndDate(formatDateVal(endTarget));
    setEndTime(formatTimeVal(endTarget));
  };

  // Markdown toolbar inserter
  const insertMarkdown = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = document.getElementById("description") as HTMLTextAreaElement | null;
    if (!textarea) {
      setDescription((prev) => `${prev}\n${prefix}${placeholder}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.substring(start, end) || placeholder;
    const replacement = `${prefix}${selected}${suffix}`;
    const newText = description.substring(0, start) + replacement + description.substring(end);

    setDescription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const handleTitlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText && /[\r\n]/.test(pastedText)) {
      e.preventDefault();
      const input = e.currentTarget;
      const start = input.selectionStart ?? title.length;
      const end = input.selectionEnd ?? title.length;
      const cleaned = pastedText.replace(/[\r\n]+/g, " ");
      const updated = title.substring(0, start) + cleaned + title.substring(end);
      setTitle(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!startDate || !startTime || !endDate || !endTime) {
      setError("Please specify valid start and end dates and times.");
      setIsLoading(false);
      return;
    }

    const startDateObj = new Date(`${startDate}T${startTime}`);
    const endDateObj = new Date(`${endDate}T${endTime}`);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      setError("Please specify valid start and end dates and times.");
      setIsLoading(false);
      return;
    }

    if (startDateObj >= endDateObj) {
      setError("End time must be after start time.");
      setIsLoading(false);
      return;
    }

    const startISO = startDateObj.toISOString();
    const endISO = endDateObj.toISOString();

    const payload: EventPayload = {
      title,
      description: description || null,
      location,
      start_time: startISO,
      end_time: endISO,
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
          <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-violet-400" />
            <span>Event Title *</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onPaste={handleTitlePaste}
            placeholder="e.g. Next.js & Supabase Masterclass 2026"
            required
            autoComplete="off"
            className="bg-white/5 border-white/10 focus:border-violet-500 rounded-xl text-base py-2.5 font-medium"
          />
        </div>

        {/* Description with Markdown Support & Live Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <span>Event Description (Markdown Supported)</span>
            </Label>
            {/* Tabs Write / Preview */}
            <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setDescTab("write")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  descTab === "write"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PenLine className="h-3 w-3" />
                <span>Write</span>
              </button>
              <button
                type="button"
                onClick={() => setDescTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  descTab === "preview"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {descTab === "write" ? (
            <div className="space-y-2">
              {/* Markdown Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => insertMarkdown("**", "**", "bold text")}
                  className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Bold (**text**)"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("*", "*", "italic text")}
                  className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Italic (*text*)"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("### ", "", "Heading")}
                  className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Heading (### title)"
                >
                  <Heading className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("- ", "", "List item")}
                  className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Bullet List (- item)"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("[", "](https://example.com)", "Link Title")}
                  className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Link ([title](url))"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("`", "`", "code")}
                  className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Inline Code (`code`)"
                >
                  <Code className="h-3.5 w-3.5" />
                </button>
              </div>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write full event details in Markdown format... (e.g. ## Agenda, - Prerequisites, > Speaker Notes)"
                rows={5}
                className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-violet-500 focus-visible:ring-1 focus-visible:ring-violet-500 transition-colors resize-y font-mono"
              />
            </div>
          ) : (
            <div className="min-h-[140px] p-4 rounded-xl border border-white/10 bg-white/[0.02] overflow-y-auto max-h-80">
              {description.trim() ? (
                <MarkdownRenderer content={description} />
              ) : (
                <p className="text-xs text-muted-foreground italic">No description written yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-violet-400" />
            <span>Location / Link</span>
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Online (Google Meet) or Auditorium Hall A"
            className="bg-white/5 border-white/10 focus:border-violet-500 rounded-xl"
          />
        </div>

        {/* Date & Time Section with Quick Presets & Distinct Inputs */}
        <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground tracking-wide uppercase flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-400" />
              Schedule & Timing
            </span>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground font-medium mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset("today")}
                className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 hover:bg-violet-600/20 hover:border-violet-500/30 text-muted-foreground hover:text-violet-300 transition-all"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyPreset("tomorrow")}
                className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 hover:bg-violet-600/20 hover:border-violet-500/30 text-muted-foreground hover:text-violet-300 transition-all"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => applyPreset("weekend")}
                className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 hover:bg-violet-600/20 hover:border-violet-500/30 text-muted-foreground hover:text-violet-300 transition-all"
              >
                Weekend
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Start Date & Time */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-violet-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-violet-400" />
                <span>Start Date &amp; Time *</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    required
                    style={{ colorScheme: "dark" }}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900/90 pl-3 pr-9 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer"
                  />
                  <Calendar className="absolute right-3 h-4 w-4 text-violet-400 pointer-events-none" />
                </div>
                <div className="relative flex items-center">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    required
                    style={{ colorScheme: "dark" }}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900/90 pl-3 pr-9 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer"
                  />
                  <Clock className="absolute right-3 h-4 w-4 text-violet-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* End Date & Time */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-sky-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                <span>End Date &amp; Time *</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    required
                    style={{ colorScheme: "dark" }}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900/90 pl-3 pr-9 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer"
                  />
                  <Calendar className="absolute right-3 h-4 w-4 text-sky-400 pointer-events-none" />
                </div>
                <div className="relative flex items-center">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    required
                    style={{ colorScheme: "dark" }}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-slate-900/90 pl-3 pr-9 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer"
                  />
                  <Clock className="absolute right-3 h-4 w-4 text-sky-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="capacity" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span>Capacity (Leave empty for Unlimited)</span>
            </Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 100"
              className="bg-white/5 border-white/10 focus:border-violet-500 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
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
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20 active:scale-95 transition-all"
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
