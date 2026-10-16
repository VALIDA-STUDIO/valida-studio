import { Suspense } from "react";
import { getProjects } from "../Shell";
import styles from "./dashboard.module.css";

const ArrowUpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

async function Canvas() {
  const { projects } = await getProjects();

  // No projects yet: point at the "New project" button in the top bar.
  if (!projects.length) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <ArrowUpIcon />
          </span>
          <h2 className={styles.emptyTitle}>No project yet</h2>
          <p className={styles.emptyText}>Use “New project” in the top bar to create one.</p>
        </div>
      </div>
    );
  }

  // A project is selected: nothing to show here yet.
  return null;
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Canvas />
    </Suspense>
  );
}
