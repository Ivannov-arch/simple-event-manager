"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/app/actions/event";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteEventButton({ eventId, status }: { eventId: string; status: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only DRAFT or CANCELLED events can be deleted
  const canDelete = status === "DRAFT" || status === "CANCELLED";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) return;
    setIsLoading(true);
    setError(null);
    try {
      await deleteEvent(eventId);
      router.push("/admin/events");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete event.");
      setIsLoading(false);
    }
  };

  if (!canDelete) return null;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isLoading}
        className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all rounded-xl gap-1.5"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Deleting...</span>
          </>
        ) : (
          <>
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </>
        )}
      </Button>
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}

