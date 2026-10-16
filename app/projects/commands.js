"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Commands of a project. RLS limits every query to the caller's own projects.

const normalize = (name) => String(name ?? "").trim().replace(/^\/+/, "").toLowerCase();

export async function createCommand({ projectId, name }) {
  const clean = normalize(name);
  if (!clean) return { error: "Name is required" };
  if (!/^[a-z0-9_-]{1,32}$/.test(clean)) return { error: "Only letters, numbers, - and _, up to 32 characters" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_commands")
    .insert({ project_id: String(projectId), name: clean })
    .select("id")
    .single();
  if (error) return { error: error.code === "23505" ? `/${clean} already exists` : error.message };

  revalidatePath("/", "layout");
  return { id: data.id };
}

export async function deleteCommand(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("project_commands").delete().eq("id", String(id));
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

// Node positions etc. of one command's canvas
export async function saveCommandGraph({ id, graph }) {
  if (JSON.stringify(graph ?? {}).length > 50_000) return { error: "Graph too large" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("project_commands").update({ graph: graph ?? {} }).eq("id", String(id)).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Command not found" };
  return { ok: true };
}
