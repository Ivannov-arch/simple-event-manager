"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/app/actions/event";
import { Button } from "@/components/ui/button";

export function DeleteEventButton({ eventId, status }: { eventId: string; status: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only DRAFT or CANCELLED events can be deleted
  const canDelete = status === "DRAFT" || status === "CANCELLED";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this event? This cannot be undone.")) return;
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
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
      >
        {isLoading ? "Deleting..." : "Delete Event"}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
