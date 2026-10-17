"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ACTIVE_COOKIE = "valida.activeProject";
const YEAR = 60 * 60 * 24 * 365;

// Remember the selected project on this device (the list itself lives in the database).
export async function setActiveProject(id) {
  (await cookies()).set(ACTIVE_COOKIE, String(id), { path: "/", maxAge: YEAR, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function createProject({ name }) {
  const cleanName = String(name ?? "").trim().slice(0, 40);
  if (!cleanName) return { error: "Name is required" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data, error } = await supabase
    .from("projects")
    .insert({ owner: user.id, name: cleanName })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await setActiveProject(data.id);
  return { id: data.id };
}

export async function updateProject({ id, name }) {
  const patch = {};
  if (name !== undefined) {
    const cleanName = String(name).trim().slice(0, 40);
    if (!cleanName) return { error: "Name is required" };
    patch.name = cleanName;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").update(patch).eq("id", String(id));
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteProject(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", String(id));
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
