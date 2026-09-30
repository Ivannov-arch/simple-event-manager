import { getMyProfile } from "@/app/actions/profile";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const profile = await getMyProfile();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal details.
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
