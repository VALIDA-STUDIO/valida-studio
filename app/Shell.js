import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "./UserMenu";
import Topbar from "./Topbar";
import SidebarNav from "./SidebarNav";
import styles from "./Shell.module.css";

// Loads the signed-in user, or sends the visitor straight to Discord.
// cache() dedupes the call when both the layout and a page need it in one request.
export const requireUser = cache(async () => {
  await connection(); // request-time only: supabase-js reads the clock, which can't be prerendered
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const m = user.user_metadata ?? {};
  return {
    user,
    name: m.custom_claims?.global_name ?? m.full_name ?? m.name ?? user.email,
    // Discord's legacy "#0" discriminator is noise
    handle: (m.name ?? "").replace(/#0$/, ""),
    avatar: m.avatar_url,
    discordId: m.provider_id ?? "",
  };
});

// TODO: read the real plan from the database. Until then a "plan" cookie
// (set via /dev/plan?set=premium) previews the premium design.
export const getPlan = cache(async () => {
  const value = (await cookies()).get("plan")?.value;
  return value === "premium" ? "premium" : "default";
});

export const getProjects = cache(async () => {
  await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, config")
    .order("created_at", { ascending: true });
  if (error) console.error("projects query failed:", error.message);
  const projects = data ?? [];

  const wanted = (await cookies()).get("valida.activeProject")?.value;
  const activeId = projects.some((p) => p.id === wanted) ? wanted : projects[0]?.id ?? null;
  return { projects, activeId };
});

// Commands of a project, in creation order
export const getCommands = cache(async (projectId) => {
  if (!projectId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_commands")
    .select("id, name, description, args")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) console.error("commands query failed:", error.message);
  return data ?? [];
});

// One command of a project, with its canvas graph
export const getCommand = cache(async (projectId, id) => {
  if (!projectId || !id) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_commands")
    .select("id, name, description, permission, aliases, sender, args, graph")
    .eq("project_id", projectId)
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("command query failed:", error.message);
  return data ?? null;
});

// Sidebar + content area shared by every signed-in page.
export default async function Shell({ children }) {
  const [{ name, avatar }, plan, { projects, activeId }] = await Promise.all([
    requireUser(),
    getPlan(),
    getProjects(),
  ]);
  const project = projects.find((p) => p.id === activeId) ?? null;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true" />
          <span className={styles.brandName}>Valida Studio</span>
        </div>
        <div className={styles.navArea}>
          <SidebarNav project={project} />
        </div>
        <UserMenu name={name} avatar={avatar} plan={plan} />
      </aside>
      <div className={styles.main}>
        <Topbar projects={projects} activeId={activeId} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
