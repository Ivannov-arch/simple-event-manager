"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { registerEvent, cancelRegistration } from "@/app/actions/register";

interface RegisterButtonProps {
  eventId: string;
  isRegistered: boolean;
  registrationId?: string;
  isFull: boolean;
}

export function RegisterButton({
  eventId,
  isRegistered,
  registrationId,
  isFull,
}: RegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await registerEvent(eventId);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!registrationId) return;
    setIsLoading(true);
    setError(null);
    try {
      await cancelRegistration(registrationId);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {isRegistered ? (
        <>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
            <span className="size-2 rounded-full bg-green-500" />
            You are registered
          </div>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
            >
              {isLoading ? "Cancelling..." : "Cancel Registration"}
            </Button>
          </div>
        </>
      ) : isFull ? (
        <Button disabled className="w-full sm:w-auto">
          Event is Full
        </Button>
      ) : (
        <Button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Registering..." : "Register for This Event"}
        </Button>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
