"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Plugin config of a project (plugin.yml-style metadata), stored as JSON on the project row.

const str = (v, max) => String(v ?? "").trim().slice(0, max);
const list = (v, max, n) =>
  (Array.isArray(v) ? v : [])
    .map((x) => str(x, max))
    .filter((x, i, a) => x && a.indexOf(x) === i)
    .slice(0, n);

const PLATFORMS = ["paper"];
const MC_VERSIONS = ["26.3"];

export async function saveConfig({ projectId, config }) {
  const c = config ?? {};
  const clean = {
    name: str(c.name, 40),
    version: str(c.version, 20),
    description: str(c.description, 200),
    authors: list(c.authors, 40, 10),
    website: str(c.website, 200),
    prefix: str(c.prefix, 40),
    platform: PLATFORMS.includes(c.platform) ? c.platform : PLATFORMS[0],
    mcVersion: MC_VERSIONS.includes(c.mcVersion) ? c.mcVersion : MC_VERSIONS[0],
    depend: list(c.depend, 40, 20),
    softdepend: list(c.softdepend, 40, 20),
  };
  if (clean.version && !/^[\w.+-]+$/.test(clean.version)) return { error: "Only letters, numbers, dots and dashes" };
  if (clean.website && !/^https?:\/\/\S+$/i.test(clean.website)) return { error: "Must start with http:// or https://" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").update({ config: clean }).eq("id", String(projectId)).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Project not found" };

  revalidatePath("/", "layout");
  return { ok: true, config: clean };
}
