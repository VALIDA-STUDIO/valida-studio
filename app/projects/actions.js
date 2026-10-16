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

export async function createProject(name = "New project") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data, error } = await supabase
    .from("projects")
    .insert({ owner: user.id, name: name.trim().slice(0, 40) || "New project", icon: "folder" })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await setActiveProject(data.id);
  return { id: data.id };
}
