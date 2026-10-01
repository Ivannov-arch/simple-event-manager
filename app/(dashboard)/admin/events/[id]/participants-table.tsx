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
import { Award, Check, ExternalLink, Loader2, User } from "lucide-react";

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
  const map: Record<string, { bg: string; text: string; border: string }> = {
    REGISTERED: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
    },
    ATTENDED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
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
    <tr className="hover:bg-white/[0.03] transition-colors group">
      {/* Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0">
            {(reg.participant?.full_name || reg.participant?.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">
              {reg.participant?.full_name ?? reg.participant?.username ?? "Anonymous"}
            </p>
            <p className="text-xs text-muted-foreground">@{reg.participant?.username ?? "user"}</p>
          </div>
        </div>
      </td>

      {/* Registered At */}
      <td className="px-6 py-4 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">
        {new Date(reg.registered_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <select
            className="text-xs border border-white/10 rounded-xl px-2.5 py-1.5 bg-slate-900 text-foreground focus:outline-none focus:border-violet-500 cursor-pointer"
            value={reg.status}
            disabled={isStatusLoading}
            onChange={(e) => handleStatusChange(e.target.value as RegistrationStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-slate-900">
                {s}
              </option>
            ))}
          </select>
          {isStatusLoading && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
        </div>
      </td>

      {/* Certificate URL */}
      <td className="px-6 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <Input
            type="url"
            className="h-8 text-xs w-52 bg-white/5 border-white/10 rounded-xl"
            placeholder="https://drive.google.com/..."
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs px-3 border-white/10 hover:bg-white/5 rounded-xl"
            onClick={handleSetCert}
            disabled={isCertLoading || !certInput.trim()}
          >
            {isCertLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
          </Button>
          {reg.certificate_url && (
            <a
              href={reg.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium ml-1"
            >
              <span>View</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </td>
    </tr>
  );
}

export function ParticipantsTable({ registrations }: ParticipantsTableProps) {
  const router = useRouter();

  const refresh = () => router.refresh();

  if (registrations.length === 0) {
    return (
      <div className="text-center py-16 rounded-3xl glass-panel border-dashed border-white/15 space-y-2">
        <p className="text-foreground font-semibold text-sm">No participants registered yet.</p>
        <p className="text-xs text-muted-foreground">Participants will show up here as they enroll.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl glass-panel border-white/10 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4 hidden sm:table-cell">Registered</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 hidden lg:table-cell">Certificate Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {registrations.map((reg) => (
              <ParticipantRow key={reg.id} reg={reg} onRefresh={refresh} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

