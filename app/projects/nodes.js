"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Files and folders of a project. RLS limits every query to the caller's own projects.

const cleanName = (name) => String(name ?? "").trim().replace(/\s+/g, " ").slice(0, 60);

function validate(name) {
  if (!name) return "Name is required";
  if (name.includes("/")) return "Names can't contain /";
  return null;
}

const friendly = (error) =>
  error.code === "23505" ? "Something with that name already exists here" : error.message;

export async function createNode({ projectId, parentId = null, kind, name }) {
  const clean = cleanName(name);
  const bad = validate(clean);
  if (bad) return { error: bad };
  if (kind !== "folder" && kind !== "file") return { error: "Invalid kind" };

  const supabase = await createClient();

  // A parent must be a folder of the same project
  if (parentId) {
    const { data: parent } = await supabase
      .from("project_nodes")
      .select("kind, project_id")
      .eq("id", parentId)
      .single();
    if (!parent || parent.kind !== "folder" || parent.project_id !== projectId) return { error: "Invalid folder" };
  }

  const { data, error } = await supabase
    .from("project_nodes")
    .insert({ project_id: projectId, parent_id: parentId, kind, name: clean })
    .select("id")
    .single();
  if (error) return { error: friendly(error) };

  revalidatePath("/", "layout");
  return { id: data.id };
}

export async function renameNode({ id, name }) {
  const clean = cleanName(name);
  const bad = validate(clean);
  if (bad) return { error: bad };

  const supabase = await createClient();
  const { error } = await supabase.from("project_nodes").update({ name: clean }).eq("id", String(id));
  if (error) return { error: friendly(error) };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteNode(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("project_nodes").delete().eq("id", String(id)); // children cascade
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

// Node-editor graph of one file (nodes + edges as React Flow JSON)
export async function saveGraph({ id, graph }) {
  const json = JSON.stringify(graph ?? {});
  if (json.length > 200_000) return { error: "Graph too large" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_nodes")
    .update({ graph })
    .eq("id", String(id))
    .eq("kind", "file")
    .select("id");
  if (error) {
    console.error("saveGraph failed:", error.message);
    return { error: error.message };
  }
  if (!data?.length) {
    console.error("saveGraph: no row updated for", id);
    return { error: "File not found" };
  }
  return { ok: true };
}
