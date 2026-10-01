"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, AtSign, Calendar, Shield, Activity, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileFormProps {
  initialData: {
    full_name: string | null;
    username: string | null;
    birth_date: string | null;
    role: string;
    status: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialData.full_name ?? "");
  const [username, setUsername] = useState(initialData.username ?? "");
  const [birthDate, setBirthDate] = useState(initialData.birth_date ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile({
        full_name: fullName,
        username,
        birth_date: birthDate || null,
      });
      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 border-white/10 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full-name" className="text-xs font-semibold text-muted-foreground">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="pl-10 bg-white/5 border-white/10 focus:border-violet-500 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold text-muted-foreground">
              Username
            </Label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alexj"
                className="pl-10 bg-white/5 border-white/10 focus:border-violet-500 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birth-date" className="text-xs font-semibold text-muted-foreground">
              Date of Birth
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 focus:border-violet-500 rounded-xl text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Read-only System Metadata Cards */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-violet-400" />
              <span>Assigned Role</span>
            </div>
            <p className="text-sm font-bold text-foreground tracking-wide">
              {initialData.role}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Account Status</span>
            </div>
            <p className="text-sm font-bold text-emerald-400 tracking-wide">
              {initialData.status}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Profile changes saved successfully!</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-600/20 active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Profile...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
