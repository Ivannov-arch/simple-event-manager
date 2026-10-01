"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";

export interface EventPayload {
  title: string;
  description?: string | null;
  location?: string;
  start_time: string;
  end_time: string;
  capacity?: number | null;
  status?: EventStatus;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Verify the current session user exists and return their id + role. */
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

/** Additionally verify the user has the ADMIN role. */
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

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get all events — for Admin dashboard (all statuses).
 * Includes participant count via a join on registrations.
 */
export async function getAdminEvents() {
  const { supabase } = await getAdminUser();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      registrations(count),
      creator:profiles!created_by(full_name, username)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get only PUBLISHED events — for Participant event browser.
 */
export async function getPublishedEvents() {
  const { supabase } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      registrations(count)
    `
    )
    .eq("status", "PUBLISHED")
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get a single event by id — accessible by any authenticated user.
 */
export async function getEventById(eventId: string) {
  const { supabase } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      registrations(count),
      creator:profiles!created_by(full_name, username)
    `
    )
    .eq("id", eventId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a new event. Admin only.
 */
export async function createEvent(payload: EventPayload) {
  const { supabase, userId } = await getAdminUser();

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...payload,
      status: payload.status ?? "DRAFT",
      location: payload.location ?? "Online",
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/events");
  return data;
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Update an existing event. Admin only.
 */
export async function updateEvent(eventId: string, payload: Partial<EventPayload>) {
  const { supabase } = await getAdminUser();

  const { data, error } = await supabase
    .from("events")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  return data;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete an event by id. Admin only.
 * Only DRAFT or CANCELLED events should be deletable (enforced at UI level).
 */
export async function deleteEvent(eventId: string) {
  const { supabase } = await getAdminUser();

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/events");
}
