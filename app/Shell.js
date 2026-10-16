import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "./UserMenu";
import Topbar from "./Topbar";
import styles from "./Shell.module.css";

// Loads the signed-in user, or sends the visitor straight to Discord.
// cache() dedupes the call when both the layout and a page need it in one request.
export const requireUser = cache(async () => {
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

// A new account starts with a few example projects so the switcher isn't empty.
const EXAMPLE_PROJECTS = [
  { name: "Welcome Messages", icon: "layout" },
  { name: "Teleport Pads", icon: "globe" },
  { name: "Chat Filter", icon: "wrench" },
];

export const getProjects = cache(async () => {
  const { user } = await requireUser();
  const supabase = await createClient();

  let { data: projects } = await supabase
    .from("projects")
    .select("id, name, icon")
    .order("created_at", { ascending: true });

  if (!projects?.length) {
    const { data: seeded } = await supabase
      .from("projects")
      .insert(EXAMPLE_PROJECTS.map((p) => ({ ...p, owner: user.id })))
      .select("id, name, icon");
    projects = seeded ?? [];
  }

  const wanted = (await cookies()).get("valida.activeProject")?.value;
  const activeId = projects.some((p) => p.id === wanted) ? wanted : projects[0]?.id ?? null;
  return { projects, activeId };
});

// Sidebar + content area shared by every signed-in page.
export default async function Shell({ children }) {
  const [{ name, avatar }, plan, { projects, activeId }] = await Promise.all([
    requireUser(),
    getPlan(),
    getProjects(),
  ]);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true" />
          <span className={styles.brandName}>Valida Studio</span>
        </div>
        <div className={styles.spacer} />
        <UserMenu name={name} avatar={avatar} plan={plan} />
      </aside>
      <div className={styles.main}>
        <Topbar projects={projects} activeId={activeId} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
