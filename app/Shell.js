import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "./UserMenu";
import ProjectsNav from "./ProjectsNav";
import Topbar from "./Topbar";
import styles from "./Shell.module.css";

// Loads the signed-in user, or sends the visitor straight to Discord.
export const requireUser = cache(async () => {
  await connection(); // request-time only: supabase-js reads the clock, which can't be prerendered
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const m = user.user_metadata ?? {};
  return { user, name: m.custom_claims?.global_name ?? m.full_name ?? m.name ?? user.email, avatar: m.avatar_url };
});

// The user's plan (standard | pro | enterprise) from public.profiles; standard when missing.
export const getPlan = cache(async () => {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("plan").eq("user_id", user.id).maybeSingle();
  return data?.plan ?? "standard";
});

// The user's projects (RLS: own rows) and which one is active on this device (cookie).
export const getProjects = cache(async () => {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("id, name").order("created_at", { ascending: true });
  if (error) console.error("projects query failed:", error.message);
  const projects = data ?? [];
  const wanted = (await cookies()).get("valida.activeProject")?.value;
  const activeId = projects.some((p) => p.id === wanted) ? wanted : projects[0]?.id ?? null;
  return { projects, activeId };
});

// Sidebar (logo, project chip, profile chip) + top bar with the breadcrumb and project switcher.
export default async function Shell({ children }) {
  const [{ name, avatar }, plan, { projects, activeId }] = await Promise.all([requireUser(), getPlan(), getProjects()]);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true" />
          <span className={styles.brandName}>Valida Studio</span>
          <span className={styles.beta}>Beta</span>
        </div>
        <div className={styles.navArea}>
          <ProjectsNav projects={projects} activeId={activeId} />
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
