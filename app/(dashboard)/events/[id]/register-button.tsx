"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { registerEvent, cancelRegistration } from "@/app/actions/register";
import { CheckCircle2, Loader2, XCircle, Sparkles } from "lucide-react";

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
      setError(err instanceof Error ? err.message : "Failed to register.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!registrationId) return;
    if (!confirm("Are you sure you want to cancel your registration?")) return;
    setIsLoading(true);
    setError(null);
    try {
      await cancelRegistration(registrationId);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {isRegistered ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2.5 text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>You have an active registration for this event.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all self-start sm:self-auto"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Cancelling...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Cancel Registration
              </span>
            )}
          </Button>
        </div>
      ) : isFull ? (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          <span>This event has reached maximum participant capacity.</span>
          <Button disabled size="sm" variant="secondary" className="opacity-50">
            Registration Closed
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Securing spot...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Confirm Registration
            </span>
          )}
        </Button>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}
    </div>
  );
}

