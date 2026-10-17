import { cache } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "./Shell.module.css";

// Loads the signed-in user, or sends the visitor straight to Discord.
export const requireUser = cache(async () => {
  await connection(); // request-time only: supabase-js reads the clock, which can't be prerendered
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return user;
});

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

// Sidebar (logo + logout) and an empty content area.
export default async function Shell({ children }) {
  await requireUser();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true" />
          <span className={styles.brandName}>Valida Studio</span>
        </div>
        <div className={styles.navArea} />
        <form action="/auth/logout" method="post">
          <button className={styles.logout} type="submit">
            <LogoutIcon />
            Logout
          </button>
        </form>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
