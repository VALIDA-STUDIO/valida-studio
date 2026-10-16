"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateName, validateCommand } from "../canvas/commandSchema";

// Commands of a project. RLS limits every query to the caller's own projects.

export async function createCommand({ projectId, name }) {
  const { clean, error } = validateName(name);
  if (error) return { error };

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("project_commands")
    .insert({ project_id: String(projectId), name: clean })
    .select("id")
    .single();
  if (dbError) return { error: dbError.code === "23505" ? `/${clean} already exists` : dbError.message };

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

// Name, description, permission, aliases, sender and arguments of one command
export async function saveCommand({ id, command }) {
  const { ok, errors, value } = validateCommand(command);
  if (!ok) return { error: "Fix the highlighted fields", errors };

  const supabase = await createClient();
  const { data, error } = await supabase.from("project_commands").update(value).eq("id", String(id)).select("id");
  if (error) return { error: error.code === "23505" ? `/${value.name} already exists` : error.message, errors: error.code === "23505" ? { name: "Already used by another command" } : {} };
  if (!data?.length) return { error: "Command not found" };

  revalidatePath("/", "layout");
  return { ok: true, command: value };
}

// Node positions of one command's canvas
export async function saveCommandGraph({ id, graph }) {
  if (JSON.stringify(graph ?? {}).length > 50_000) return { error: "Graph too large" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("project_commands").update({ graph: graph ?? {} }).eq("id", String(id)).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Command not found" };
  return { ok: true };
}
