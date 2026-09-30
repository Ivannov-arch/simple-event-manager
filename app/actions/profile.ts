"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfilePayload {
  full_name?: string;
  username?: string;
  birth_date?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: You must be logged in.");
  }

  return { supabase, userId: user.id };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get the current user's profile.
 */
export async function getMyProfile() {
  const { supabase, userId } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get a profile by user id — accessible by admin or the user themselves.
 */
export async function getProfileById(profileId: string) {
  const { supabase } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, role, status, created_at")
    .eq("id", profileId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Update the current user's profile (full_name, username, birth_date).
 *
 * Role and status are intentionally NOT updatable here — those are
 * admin-only operations handled separately.
 */
export async function updateProfile(payload: ProfilePayload) {
  const { supabase, userId } = await getAuthenticatedUser();

  // Check username uniqueness if it's being changed
  if (payload.username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", payload.username)
      .neq("id", userId)
      .maybeSingle();

    if (existing) {
      throw new Error("Username is already taken. Please choose another one.");
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/profile");
  return data;
}

// ─── Admin: Manage User Status ─────────────────────────────────────────────────

/**
 * Update a user's account status (ACTIVE / SUSPENDED). Admin only.
 */
export async function updateUserStatus(
  targetUserId: string,
  status: "ACTIVE" | "SUSPENDED"
) {
  const { supabase, userId } = await getAuthenticatedUser();

  // Verify caller is an admin
  const { data: callerProfile, error: callerError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (callerError || callerProfile?.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", targetUserId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/participants");
  return data;
}
