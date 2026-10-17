import { cache } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "./UserMenu";
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

// Sidebar (logo + profile chip with logout) and an empty content area.
export default async function Shell({ children }) {
  const [{ name, avatar }, plan] = await Promise.all([requireUser(), getPlan()]);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true" />
          <span className={styles.brandName}>Valida Studio</span>
        </div>
        <div className={styles.navArea} />
        <UserMenu name={name} avatar={avatar} plan={plan} />
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
