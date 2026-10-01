"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RegistrationStatus = "REGISTERED" | "ATTENDED" | "CANCELLED";

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

async function getAdminUser() {
  const { supabase, userId } = await getAuthenticatedUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || profile?.role?.toUpperCase() !== "ADMIN") {
    throw new Error("Forbidden: Admin access required.");
  }

  return { supabase, userId };
}

// ─── Participant: Register ─────────────────────────────────────────────────────

/**
 * Register the current user to an event.
 *
 * Checks:
 * 1. Event exists and is PUBLISHED.
 * 2. User is not already registered.
 * 3. Event capacity is not exceeded (if capacity is set; NULL = unlimited).
 */
export async function registerEvent(eventId: string) {
  const { supabase, userId } = await getAuthenticatedUser();

  // 1. Fetch event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, status, capacity")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found.");
  }

  if (event.status !== "PUBLISHED") {
    throw new Error("This event is not open for registration.");
  }

  // 2. Check for existing registration
  const { data: existing } = await supabase
    .from("registrations")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing && existing.status !== "CANCELLED") {
    throw new Error("You are already registered for this event.");
  }

  // 3. Check capacity (only if capacity is not NULL)
  if (event.capacity !== null) {
    const { count, error: countError } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "REGISTERED");

    if (countError) throw new Error(countError.message);

    if (count !== null && count >= event.capacity) {
      throw new Error("This event is full. No more spots available.");
    }
  }

  // 4. Insert or re-activate a cancelled registration
  let result;
  if (existing && existing.status === "CANCELLED") {
    const { data, error } = await supabase
      .from("registrations")
      .update({ status: "REGISTERED", updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    result = data;
  } else {
    const { data, error } = await supabase
      .from("registrations")
      .insert({ event_id: eventId, user_id: userId, status: "REGISTERED" })
      .select()
      .single();

    if (error) throw new Error(error.message);
    result = data;
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  return result;
}

/**
 * Cancel the current user's registration for an event.
 */
export async function cancelRegistration(registrationId: string) {
  const { supabase, userId } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("registrations")
    .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("id", registrationId)
    .eq("user_id", userId) // ensure user can only cancel their own
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  return data;
}

/**
 * Get all registrations for the current user, including event details.
 */
export async function getMyRegistrations() {
  const { supabase, userId } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      event:events(id, title, location, start_time, end_time, status)
    `
    )
    .eq("user_id", userId)
    .neq("status", "CANCELLED")
    .order("registered_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// ─── Admin: Manage Registrations ──────────────────────────────────────────────

/**
 * Get all registrations for a specific event. Admin only.
 * Includes participant profile details.
 */
export async function getEventRegistrations(eventId: string) {
  const { supabase } = await getAdminUser();

  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      participant:profiles!user_id(id, full_name, username)
    `
    )
    .eq("event_id", eventId)
    .order("registered_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update a participant's registration status. Admin only.
 * Used to mark attendees or change participant status.
 */
export async function updateRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus
) {
  const { supabase } = await getAdminUser();

  const { data, error } = await supabase
    .from("registrations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", registrationId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/events");
  return data;
}

/**
 * Upload/set a certificate URL for a participant's registration. Admin only.
 */
export async function setCertificateUrl(
  registrationId: string,
  certificateUrl: string
) {
  const { supabase } = await getAdminUser();

  const { data, error } = await supabase
    .from("registrations")
    .update({
      certificate_url: certificateUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", registrationId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/events");
  return data;
}
