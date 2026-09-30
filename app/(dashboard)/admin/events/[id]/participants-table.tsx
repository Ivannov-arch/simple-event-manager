"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateRegistrationStatus,
  setCertificateUrl,
  type RegistrationStatus,
} from "@/app/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Participant {
  id: string;
  status: string;
  certificate_url: string | null;
  registered_at: string;
  participant: {
    id: string;
    full_name: string | null;
    username: string | null;
  } | null;
}

interface ParticipantsTableProps {
  registrations: Participant[];
  eventId: string;
}

const STATUS_OPTIONS: RegistrationStatus[] = ["REGISTERED", "ATTENDED", "CANCELLED"];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    REGISTERED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    ATTENDED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function ParticipantRow({ reg, onRefresh }: { reg: Participant; onRefresh: () => void }) {
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isCertLoading, setIsCertLoading] = useState(false);
  const [certInput, setCertInput] = useState(reg.certificate_url ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: RegistrationStatus) => {
    setIsStatusLoading(true);
    setError(null);
    try {
      await updateRegistrationStatus(reg.id, newStatus);
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setIsStatusLoading(false);
    }
  };

  const handleSetCert = async () => {
    if (!certInput.trim()) return;
    setIsCertLoading(true);
    setError(null);
    try {
      await setCertificateUrl(reg.id, certInput.trim());
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to set certificate.");
    } finally {
      setIsCertLoading(false);
    }
  };

  return (
    <tr className="bg-card hover:bg-muted/20 transition-colors">
      {/* Name */}
      <td className="px-4 py-3">
        <p className="font-medium text-sm">
          {reg.participant?.full_name ?? reg.participant?.username ?? "—"}
        </p>
        <p className="text-xs text-muted-foreground">@{reg.participant?.username ?? "unknown"}</p>
      </td>

      {/* Registered At */}
      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
        {new Date(reg.registered_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <StatusPill status={reg.status} />
          <select
            className="text-xs border border-input rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            value={reg.status}
            disabled={isStatusLoading}
            onChange={(e) => handleStatusChange(e.target.value as RegistrationStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </td>

      {/* Certificate */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <Input
            type="url"
            className="h-7 text-xs w-48"
            placeholder="https://..."
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2"
            onClick={handleSetCert}
            disabled={isCertLoading || !certInput.trim()}
          >
            {isCertLoading ? "..." : "Set"}
          </Button>
          {reg.certificate_url && (
            <a
              href={reg.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline underline-offset-4"
            >
              View
            </a>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </td>
    </tr>
  );
}

export function ParticipantsTable({ registrations, eventId }: ParticipantsTableProps) {
  const router = useRouter();

  const refresh = () => router.refresh();

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground text-sm">No participants registered yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Participant</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Registered</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Certificate URL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {registrations.map((reg) => (
            <ParticipantRow key={reg.id} reg={reg} onRefresh={refresh} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
