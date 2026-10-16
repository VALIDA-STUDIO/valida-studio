import { Suspense } from "react";
import { requireUser } from "../../Shell";
import Appearance from "./Appearance";
import DangerZone from "./DangerZone";
import styles from "./settings.module.css";

async function SettingsContent({ searchParams }) {
  await requireUser();
  const failed = (await searchParams)?.error === "delete";

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your preferences and account.</p>
      </header>

      <div className={styles.stack}>
          {/* ---------- Preferences ---------- */}
          <section id="preferences" className={styles.group}>
            <div className={styles.groupHead}>
              <h2>Preferences</h2>
            </div>
            <Appearance />
          </section>

          {/* ---------- Account ---------- */}
          <section id="account" className={styles.group}>
            <div className={styles.groupHead}>
              <h2>Account</h2>
            </div>

            <div className={styles.card}>
              <div className={styles.cardBody}>
                <div className={styles.cardText}>
                  <h3 className={styles.cardTitle}>Sign out of all sessions</h3>
                  <p className={styles.cardDesc}>Sign out on every device where you are currently logged in.</p>
                </div>
              </div>
              <div className={styles.cardFoot}>
                <span className={styles.footText}>This includes the current session.</span>
                <form action="/auth/logout-all" method="post">
                  <button className={styles.btn} type="submit">
                    Sign out all
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* ---------- Danger zone ---------- */}
          <section id="danger" className={styles.group}>
            <div className={styles.groupHead}>
              <h2 className={styles.dangerText}>Danger zone</h2>
            </div>
            <DangerZone failed={failed} />
          </section>
      </div>
    </div>
  );
}

export default function SettingsPage({ searchParams }) {
  return (
    <Suspense fallback={null}>
      <SettingsContent searchParams={searchParams} />
    </Suspense>
  );
}
