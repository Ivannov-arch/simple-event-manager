import { getMyProfile } from "@/app/actions/profile";
import { ProfileForm } from "./profile-form";
import { User, Shield } from "lucide-react";

export default async function ProfilePage() {
  const profile = await getMyProfile();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-semibold border border-violet-500/20 mb-2">
          <User className="h-3 w-3" />
          <span>Account Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Personal Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and maintain your identity information and account details.
        </p>
      </div>

      <ProfileForm
        initialData={{
          full_name: profile.full_name,
          username: profile.username,
          birth_date: profile.birth_date,
          role: profile.role,
          status: profile.status,
        }}
      />
    </div>
  );
}
