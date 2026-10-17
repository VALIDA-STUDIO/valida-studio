"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Variables of a project: [{ id, name, type, perPlayer, default, persist }]
const TYPES = ["number", "text", "boolean"];
const NAME = /^[a-z][a-z0-9_]{0,31}$/;

export async function saveVariables({ projectId, variables }) {
  const list = Array.isArray(variables) ? variables.slice(0, 100) : [];
  const clean = [];
  const errors = {};
  list.forEach((v, i) => {
    const name = String(v?.name ?? "").trim().toLowerCase();
    const type = TYPES.includes(v?.type) ? v.type : "number";
    let def = String(v?.default ?? "").trim();
    if (!name) errors[i] = "Name is required";
    else if (!NAME.test(name)) errors[i] = "Lowercase letters, numbers and _, starting with a letter";
    else if (clean.some((c) => c.name === name)) errors[i] = "Already used";
    if (type === "number" && def && !/^-?\d+(\.\d+)?$/.test(def)) errors[i] ??= "Default must be a number";
    if (type === "boolean") def = def === "true" ? "true" : "false";
    if (type === "number" && !def) def = "0";
    clean.push({ id: String(v?.id ?? name), name, type, perPlayer: !!v?.perPlayer, default: def.slice(0, 200), persist: !!v?.persist });
  });
  if (Object.keys(errors).length) return { error: "Fix the highlighted variables", errors };

  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").update({ variables: clean }).eq("id", String(projectId)).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Project not found" };

  revalidatePath("/", "layout");
  return { ok: true, variables: clean };
}
